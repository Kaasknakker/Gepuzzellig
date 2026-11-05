// Nagebootste Firebase (app, Firestore, Auth, Functions) voor de visuele controle.
// Alles staat in het geheugen van de browser en komt uit window.__SEED (fixture.json).
// Er wordt NOOIT verbinding gemaakt met een echt Firebase-project.
// snapshot.mjs serveert dit bestand in plaats van de gstatic-firebase-modules.
const S = window.__FS || (window.__FS = { store: new Map(Object.entries(window.__SEED || {})), listeners: new Set(), log: [] });
const DEL = { __del: true };
const clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
const join = (...s) => s.filter(x => x !== undefined && x !== null).map(String).join("/");
function mkRef(path) { const seg = path.split("/"); return seg.length % 2 === 0 ? { type: "document", path, id: seg.at(-1), parent: { path: seg.slice(0, -1).join("/") } } : { type: "collection", path, id: seg.at(-1) }; }
export const initializeApp = c => ({ options: c });
export const getApp = () => ({});
export const status = undefined;
export const initializeFirestore = () => ({ fake: true });
export const getFirestore = () => ({ fake: true });
export function doc(base, ...segs) { const p = base && base.path !== undefined && base.type === "collection" ? join(base.path, ...(segs.length ? segs : [Math.random().toString(36).slice(2)])) : join(...segs); return mkRef(p); }
export function collection(base, ...segs) { const p = base && base.path ? join(base.path, ...segs) : join(...segs); return mkRef(p); }
export const where = (field, op, value) => ({ kind: "where", field, op, value });
export const orderBy = (field, dir) => ({ kind: "orderBy", field, dir });
export const limit = n => ({ kind: "limit", n });
export const documentId = () => "__name__";
export function query(col, ...cs) { return { type: "query", path: col.path, cs }; }
const snapDoc = (path) => { const d = S.store.get(path); return { id: path.split("/").at(-1), ref: mkRef(path), exists: () => d !== undefined, data: () => clone(d), get: k => d && d[k], metadata: { hasPendingWrites: false, fromCache: false } }; };
function get(o, k) { return k.split(".").reduce((a, b) => a == null ? undefined : a[b], o); }
function runQuery(q) {
  const base = q.path, depth = base.split("/").length + 1;
  let rows = [...S.store.keys()].filter(k => k.startsWith(base + "/") && k.split("/").length === depth).map(snapDoc);
  for (const c of q.cs || []) {
    if (c.kind === "where") rows = rows.filter(r => { const v = c.field === "__name__" ? r.id : get(r.data(), c.field); switch (c.op) { case "==": return v === c.value; case "!=": return v !== c.value; case "in": return c.value.includes(v); case "array-contains": return (v || []).includes(c.value); case ">=": return v >= c.value; case "<=": return v <= c.value; case ">": return v > c.value; case "<": return v < c.value; } return true; });
    if (c.kind === "orderBy") rows.sort((a, b) => { const x = get(a.data(), c.field), y = get(b.data(), c.field); return (x > y ? 1 : x < y ? -1 : 0) * (c.dir === "desc" ? -1 : 1); });
    if (c.kind === "limit") rows = rows.slice(0, c.n);
  }
  return { docs: rows, size: rows.length, empty: !rows.length, forEach: f => rows.forEach(f), docChanges: () => rows.map(d => ({ type: "added", doc: d })), metadata: { hasPendingWrites: false, fromCache: false } };
}
const read = r => r.type === "document" ? snapDoc(r.path) : runQuery(r.type === "query" ? r : { path: r.path, cs: [] });
export const getDoc = async r => read(r), getDocFromServer = getDoc, getDocFromCache = getDoc;
export const getDocs = async q => read(q), getDocsFromServer = getDocs, getDocsFromCache = getDocs;
const sig = r => JSON.stringify(r.docs ? r.docs.map(d => [d.id, d.data()]) : [r.exists(), r.data()]);
let pend = false;
function notify() { if (pend) return; pend = true; setTimeout(() => { pend = false; for (const l of S.listeners) { try { const r = read(l.ref), s = sig(r); if (s !== l.last) { l.last = s; l.next(r) } } catch (e) { console.error(e) } } }, 50); }
export function onSnapshot(ref, a, b, c) { let next = a, err = b; if (a && typeof a === "object" && !a.next) { next = b; err = c; } if (a && a.next) { next = a.next; err = a.error; } const l = { ref, next }; S.listeners.add(l); setTimeout(() => { try { const r0 = read(ref); l.last = sig(r0); next(r0) } catch (e) { console.error(e) } }, 0); return () => S.listeners.delete(l); }
function applyFields(cur, data, merge) {
  const out = merge ? clone(cur) || {} : {};
  for (const [k, v] of Object.entries(data)) {
    if (v && v.__del) { delete out[k]; continue; }
    if (merge && v && typeof v === "object" && !Array.isArray(v) && !v.__ts && cur && typeof cur[k] === "object") out[k] = applyFields(cur[k], v, true);
    else out[k] = clone(v);
  }
  return out;
}
function applyUpdate(cur, data) { const out = clone(cur) || {}; for (const [k, v] of Object.entries(data)) { const ps = k.split("."); let o = out; for (const p of ps.slice(0, -1)) o = o[p] = (o[p] && typeof o[p] === "object") ? o[p] : {}; if (v && v.__del) delete o[ps.at(-1)]; else o[ps.at(-1)] = clone(v); } return out; }
function w(op, r, d, opt) { S.log.push([op, r.path]); if (op === "delete") S.store.delete(r.path); else if (op === "update") { if (!S.store.has(r.path)) throw Object.assign(new Error("not-found"), { code: "not-found" }); S.store.set(r.path, applyUpdate(S.store.get(r.path), d)); } else S.store.set(r.path, applyFields(S.store.get(r.path), d, opt && opt.merge)); }
export const setDoc = async (r, d, o) => { w("set", r, d, o); notify(); };
export const updateDoc = async (r, d) => { w("update", r, d); notify(); };
export const deleteDoc = async r => { w("delete", r); notify(); };
export const addDoc = async (c, d) => { const r = doc(c); w("set", r, d); notify(); return r; };
export function writeBatch() { const ops = []; return { set(r, d, o) { ops.push(["set", r, d, o]); return this }, update(r, d) { ops.push(["update", r, d]); return this }, delete(r) { ops.push(["delete", r]); return this }, async commit() { for (const o of ops) w(...o); notify(); } }; }
export async function runTransaction(db, fn) { const ops = []; const tx = { get: async r => read(r), set(r, d, o) { ops.push(["set", r, d, o]); return tx }, update(r, d) { ops.push(["update", r, d]); return tx }, delete(r) { ops.push(["delete", r]); return tx } }; const res = await fn(tx); for (const o of ops) w(...o); notify(); return res; }
export const deleteField = () => DEL;
export const serverTimestamp = () => Date.now();
export const increment = n => n;
export const arrayUnion = (...v) => v;
export const arrayRemove = () => [];
export class Timestamp { constructor(s, n) { this.seconds = s; this.nanoseconds = n || 0; this.__ts = 1 } static now() { return Timestamp.fromMillis(Date.now()) } static fromMillis(m) { return new Timestamp(Math.floor(m / 1000), (m % 1000) * 1e6) } static fromDate(d) { return Timestamp.fromMillis(+d) } toMillis() { return this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6) } toDate() { return new Date(this.toMillis()) } }
export const enableIndexedDbPersistence = async () => {}, persistentLocalCache = () => ({}), persistentMultipleTabManager = () => ({});
// Auth
const U = window.__USER;
const auth = { currentUser: U, onAuthStateChanged: (cb) => { setTimeout(() => cb(U), 0); return () => {} } };
export const getAuth = () => auth;
export const onAuthStateChanged = (a, cb) => { setTimeout(() => cb(U), 0); return () => {} };
export const setPersistence = async () => {}, browserLocalPersistence = {}, indexedDBLocalPersistence = {};
export class GoogleAuthProvider { setCustomParameters() {} addScope() {} }
export const signInWithPopup = async () => ({ user: U }), signInWithRedirect = async () => {}, getRedirectResult = async () => null, signInAnonymously = async () => ({ user: U }), linkWithPopup = async () => ({ user: U }), signOut = async () => {};
// Functions
export const getFunctions = () => ({});
export const httpsCallable = () => async d => { S.log.push(["callable", JSON.stringify(d)]); return { data: { ok: true, sink: true } } };
