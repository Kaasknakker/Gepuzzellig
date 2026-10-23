"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

const POSTMARK_SERVER_TOKEN = defineSecret("POSTMARK_SERVER_TOKEN");
const POSTMARK_FROM = defineSecret("POSTMARK_FROM");
const APP_URL = "https://kaasknakker.github.io/Gepuzzellig/";

const esc = (value) => String(value == null ? "" : value)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

exports.sendInviteEmail = onCall({
  region: "europe-west1",
  secrets: [POSTMARK_SERVER_TOKEN, POSTMARK_FROM],
  timeoutSeconds: 30,
  memory: "256MiB",
}, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Log eerst in.");
  const code = String(request.data && request.data.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  if (code.length < 8) throw new HttpsError("invalid-argument", "Ongeldige uitnodigingscode.");

  const db = getFirestore();
  const uid = request.auth.uid;
  const [profileSnap, inviteSnap] = await Promise.all([
    db.doc("profiles/" + uid).get(),
    db.doc("accessInvites/" + code).get(),
  ]);
  if (!profileSnap.exists) throw new HttpsError("permission-denied", "Geen Gepuzzellig-profiel.");
  if (!inviteSnap.exists) throw new HttpsError("not-found", "Uitnodiging niet gevonden.");

  const profile = profileSnap.data() || {};
  const invite = inviteSnap.data() || {};
  if (invite.createdByAuthUid !== uid || invite.createdByPlayerId !== profile.playerId) {
    throw new HttpsError("permission-denied", "Deze uitnodiging is niet van jou.");
  }
  if (invite.revoked || invite.usedByAuthUid) throw new HttpsError("failed-precondition", "Deze uitnodiging is niet meer actief.");
  const expiresAt = invite.expiresAt && typeof invite.expiresAt.toMillis === "function" ? invite.expiresAt.toMillis() : 0;
  if (!expiresAt || expiresAt <= Date.now()) throw new HttpsError("failed-precondition", "Deze uitnodiging is verlopen.");
  if (invite.mailSentAt) return { sent: true, alreadySent: true };

  const to = String(invite.email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) throw new HttpsError("invalid-argument", "Ongeldig e-mailadres.");

  const inviter = esc(invite.createdByName || profile.displayName || "Een puzzelaar");
  const group = esc(invite.suggestedGroupName || "de groep van je uitnodiger");
  const link = APP_URL + "?invite=" + encodeURIComponent(code);
  const subject = inviter + " nodigt je uit voor Gepuzzellig 🧩";
  const textBody =
    inviter + " heeft je uitgenodigd voor Gepuzzellig.\n\n" +
    "Je kunt na registratie meedoen met " + (invite.suggestedGroupName || "de groep van je uitnodiger") +
    ", een andere groep kiezen of zelf een groep maken.\n\n" +
    "Open je persoonlijke uitnodiging: " + link + "\n\n" +
    "Deze uitnodiging is 7 dagen geldig en werkt alleen met dit Google-account.";

  const htmlBody = `<!doctype html><html><body style="margin:0;background:#f6f4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1f2430">
  <div style="padding:32px 14px"><div style="max-width:560px;margin:auto;background:#fff;border:1px solid #ddd6cb;border-radius:22px;overflow:hidden;box-shadow:0 12px 35px rgba(35,35,60,.10)">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#7354d8,#9477e8);color:#fff">
      <div style="font-size:14px;font-weight:800;letter-spacing:.04em">🧩 GEPUZZELLIG</div>
      <h1 style="margin:9px 0 0;font-size:27px;line-height:1.15">Je bent uitgenodigd!</h1>
    </div>
    <div style="padding:28px">
      <p style="font-size:17px;line-height:1.55;margin-top:0"><strong>${inviter}</strong> heeft je uitgenodigd om mee te puzzelen in Gepuzzellig.</p>
      <div style="padding:14px 16px;border-radius:14px;background:#f5f1ff;margin:18px 0"><strong>Voorgestelde groep:</strong><br>${group}</div>
      <p style="line-height:1.55">Na het activeren van je account kun je met deze groep meedoen, een andere groepscode gebruiken of zelf een nieuwe groep maken.</p>
      <p style="margin:28px 0"><a href="${link}" style="display:inline-block;background:#7354d8;color:#fff;text-decoration:none;font-weight:800;padding:13px 20px;border-radius:12px">Open mijn uitnodiging →</a></p>
      <p style="font-size:12px;line-height:1.5;color:#777">Deze persoonlijke link is 7 dagen geldig en werkt alleen met het Google-account waarvoor je bent uitgenodigd.</p>
    </div>
  </div></div></body></html>`;

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": POSTMARK_SERVER_TOKEN.value(),
    },
    body: JSON.stringify({
      From: POSTMARK_FROM.value(),
      To: to,
      Subject: subject,
      TextBody: textBody,
      HtmlBody: htmlBody,
      MessageStream: "outbound",
      Tag: "gepuzzellig-invite",
    }),
  });

  let result = {};
  try { result = await response.json(); } catch (_) {}
  if (!response.ok || Number(result.ErrorCode || 0) !== 0) {
    console.error("Postmark invite failed", response.status, result);
    throw new HttpsError("internal", "E-mail versturen is mislukt.");
  }

  await inviteSnap.ref.update({
    mailSentAt: Date.now(),
    mailMessageId: String(result.MessageID || ""),
    mailUpdatedAt: FieldValue.serverTimestamp(),
  });

  return { sent: true };
});
