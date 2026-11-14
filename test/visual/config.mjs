// Vaste instellingen voor de visuele controle. Wijzig FIXED_TIME alleen bewust: dan verandert iedere baseline.
export const FIXED_TIME = "2026-10-26T14:00:00.000Z"; // maandag 15:00 in Amsterdam
export const AUTH_UID = "fVY1NyHBkMgrSd21AlVcBYzN7Td2"; // testprofiel uit scripts/seed-test-groups.mjs
export const DEVICES = {
  ipad: { viewport: { width: 1180, height: 820 }, isMobile: false },
  ipadstaand: { viewport: { width: 820, height: 1180 }, isMobile: false },
  iphone: { viewport: { width: 390, height: 844 }, isMobile: true },
  iphoneklein: { viewport: { width: 320, height: 667 }, isMobile: true },
};
export const THEMES = ["light", "dark"];
