// Vervangt firebase-admin/firestore tijdens make-fixture.mjs: schrijft naar een object in het geheugen.
export const store = (globalThis.__VISUAL_STORE ||= {});
const ref = path => ({ path, get: async () => ({ data: () => store[path] }) });
export const getFirestore = () => ({ doc: ref, batch: () => ({ set: (r, d) => { store[r.path] = d; }, commit: async () => {} }) });
