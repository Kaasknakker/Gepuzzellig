"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

const POSTMARK_SERVER_TOKEN = defineSecret("POSTMARK_SERVER_TOKEN");
const POSTMARK_FROM = defineSecret("POSTMARK_FROM");
const APP_URL = defineString("APP_URL", { default: "https://kaasknakker.github.io/Gepuzzellig/" });
const MAIL_MODE = defineString("MAIL_MODE", { default: "postmark" });
const MAIL_ALLOWLIST = defineString("MAIL_ALLOWLIST", { default: "" });

const projectId = () => String(process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "");
const normalizedUrl = value => String(value || "").replace(/\/+$/, "") + "/";
const appUrl = () => normalizedUrl(APP_URL.value());
const mailMode = () => String(MAIL_MODE.value() || "postmark").trim().toLowerCase();
const allowlist = () => new Set(String(MAIL_ALLOWLIST.value() || "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean));
const isTestProject = () => projectId() === "gepuzzellig-test";
const assertEnvironmentSafe = () => {
  const pid = projectId(), mode = mailMode(), url = appUrl();
  if (pid === "gepuzzellig-test") {
    if (url !== "https://gepuzzellig-test.web.app/") throw new HttpsError("failed-precondition", "Test-APP_URL is niet veilig geconfigureerd.");
    if (!["sink","allowlist"].includes(mode)) throw new HttpsError("failed-precondition", "Testmail moet sink of allowlist gebruiken.");
  } else if (pid === "gepuzzelig") {
    if (mode !== "postmark") throw new HttpsError("failed-precondition", "Productiemail moet expliciet Postmark gebruiken.");
    if (url !== "https://kaasknakker.github.io/Gepuzzellig/") throw new HttpsError("failed-precondition", "Productie-APP_URL wijkt af.");
  } else {
    throw new HttpsError("failed-precondition", "Onbekend Firebase-project voor Functions.");
  }
  return { pid, mode, url };
};

const esc = (value) => String(value == null ? "" : value)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

async function deliverInvite({ to, subject, textBody, htmlBody }) {
  const env = assertEnvironmentSafe();
  if (env.mode === "sink") {
    console.info("Test invite mail sunk", { projectId: env.pid, toDomain: String(to).split("@")[1] || "" });
    return { messageId: "test-sink", delivered: false, mode: "sink" };
  }
  if (env.mode === "allowlist" && !allowlist().has(to)) {
    console.info("Test invite mail blocked by allowlist", { projectId: env.pid });
    return { messageId: "test-blocked", delivered: false, mode: "allowlist" };
  }
  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": POSTMARK_SERVER_TOKEN.value(),
    },
    body: JSON.stringify({
      From: POSTMARK_FROM.value(), To: to, Subject: subject, TextBody: textBody, HtmlBody: htmlBody,
      MessageStream: "outbound", Tag: isTestProject() ? "gepuzzellig-test-invite" : "gepuzzellig-invite",
    }),
  });
  let result = {};
  try { result = await response.json(); } catch (_) {}
  if (!response.ok || Number(result.ErrorCode || 0) !== 0) {
    console.error("Postmark invite failed", response.status, result);
    throw new HttpsError("internal", "E-mail versturen is mislukt.");
  }
  return { messageId: String(result.MessageID || ""), delivered: true, mode: env.mode };
}

exports.sendInviteEmail = onCall({
  region: "europe-west1",
  secrets: [POSTMARK_SERVER_TOKEN, POSTMARK_FROM],
  timeoutSeconds: 30,
  memory: "256MiB",
}, async (request) => {
  const env = assertEnvironmentSafe();
  if (!request.auth) throw new HttpsError("unauthenticated", "Log eerst in.");
  const code = String(request.data && request.data.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  if (code.length < 8) throw new HttpsError("invalid-argument", "Ongeldige uitnodigingscode.");

  const db = getFirestore();
  const uid = request.auth.uid;
  const [profileSnap, inviteSnap] = await Promise.all([db.doc("profiles/" + uid).get(), db.doc("accessInvites/" + code).get()]);
  if (!profileSnap.exists) throw new HttpsError("permission-denied", "Geen Gepuzzellig-profiel.");
  if (!inviteSnap.exists) throw new HttpsError("not-found", "Uitnodiging niet gevonden.");

  const profile = profileSnap.data() || {}, invite = inviteSnap.data() || {};
  if (invite.createdByAuthUid !== uid || invite.createdByPlayerId !== profile.playerId) throw new HttpsError("permission-denied", "Deze uitnodiging is niet van jou.");
  if (invite.revoked || invite.usedByAuthUid) throw new HttpsError("failed-precondition", "Deze uitnodiging is niet meer actief.");
  const expiresAt = invite.expiresAt && typeof invite.expiresAt.toMillis === "function" ? invite.expiresAt.toMillis() : 0;
  if (!expiresAt || expiresAt <= Date.now()) throw new HttpsError("failed-precondition", "Deze uitnodiging is verlopen.");
  if (invite.mailSentAt) return { sent: true, alreadySent: true };

  const to = String(invite.email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) throw new HttpsError("invalid-argument", "Ongeldig e-mailadres.");

  const inviter = esc(invite.createdByName || profile.displayName || "Een puzzelaar");
  const group = esc(invite.suggestedGroupName || "de groep van je uitnodiger");
  const link = env.url + "?invite=" + encodeURIComponent(code);
  const subject = inviter + " nodigt je uit voor Gepuzzellig 🧩";
  const textBody = inviter + " heeft je uitgenodigd voor Gepuzzellig.\n\n" +
    "Je kunt na registratie meedoen met " + (invite.suggestedGroupName || "de groep van je uitnodiger") +
    ", een andere groep kiezen of zelf een groep maken.\n\nOpen je persoonlijke uitnodiging: " + link +
    "\n\nDeze uitnodiging is 7 dagen geldig.";

  const htmlBody = `<!doctype html><html><body style="margin:0;background:#f6f4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1f2430">
  <div style="padding:32px 14px"><div style="max-width:560px;margin:auto;background:#fff;border:1px solid #ddd6cb;border-radius:22px;overflow:hidden">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#7354d8,#9477e8);color:#fff"><strong>🧩 GEPUZZELLIG</strong><h1>Je bent uitgenodigd!</h1></div>
    <div style="padding:28px"><p><strong>${inviter}</strong> heeft je uitgenodigd om mee te puzzelen.</p>
    <div style="padding:14px 16px;border-radius:14px;background:#f5f1ff"><strong>Voorgestelde groep:</strong><br>${group}</div>
    <p><a href="${link}">Open mijn uitnodiging →</a></p></div></div></div></body></html>`;

  const delivery = await deliverInvite({ to, subject, textBody, htmlBody });
  await inviteSnap.ref.update({
    mailSentAt: Date.now(),
    mailMessageId: delivery.messageId,
    mailMode: delivery.mode,
    mailDelivered: delivery.delivered,
    mailUpdatedAt: FieldValue.serverTimestamp(),
  });
  return { sent: true, delivered: delivery.delivered, mode: delivery.mode };
});

exports.__test = { normalizedUrl, projectId, isTestProject };
