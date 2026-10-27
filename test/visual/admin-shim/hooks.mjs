// Node-resolverhook: stuurt firebase-admin naar de shim, zodat het echte seed-script lokaal draait.
const map = { "firebase-admin/app": "./app.mjs", "firebase-admin/firestore": "./firestore.mjs" };
export async function resolve(spec, ctx, next) {
  if (map[spec]) return { url: new URL(map[spec], import.meta.url).href, shortCircuit: true };
  return next(spec, ctx);
}
