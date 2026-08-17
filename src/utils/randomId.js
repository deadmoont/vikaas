// Generates a random lowercase-alphanumeric id for the cosmetic per-page
// URL path (see App.jsx's history.pushState usage) — purely decorative
// address-bar flavor, never a real route/session/auth token and never used
// to look up or authenticate anything.
export function randomId(length = 11) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// A longer opaque random string for a "?s=" query param — purely visual
// length/noise (deliberately NOT base64 of any real-looking JSON payload,
// unlike a genuine session token or the fabricated-credentials pattern
// this app intentionally avoids). Random on every character, so nothing
// about it decodes to anything meaningful. 160 chars to match the visual
// length of a typical long session-token query value.
export function randomToken(length = 160) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
