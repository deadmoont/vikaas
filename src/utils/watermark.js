// Builds a tiled, diagonal text watermark as a CSS background-image (a data
// URI SVG) — used on SolvePage's problem-description panel to mirror real
// assessment platforms stamping the candidate's email repeatedly across the
// question text as a screenshot/leak deterrent. Purely a CSS background
// derived from the current session's config; nothing is uploaded anywhere.
const escapeXml = (str) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildWatermarkBackground(text) {
  const label = text && text.trim() ? text.trim() : "";
  if (!label) return "none";

  // One tile = one rotated line of the email; background-repeat then
  // stamps it edge-to-edge into the many-rows-of-slanted-text look. The
  // tile is sized off the actual text length (with generous margin on all
  // sides) so the rotated line always lands fully inside the canvas —
  // SVG silently clips anything outside its bounds, which is why a fixed
  // 260px-wide tile was previously cutting the front half of longer
  // emails off (text started at a negative x, already off-canvas).
  const fontSize = 16;
  const textWidth = label.length * fontSize * 0.62;
  const width = Math.ceil(textWidth + 140);
  const height = Math.ceil(width * 0.55);
  const cx = width / 2;
  const cy = height / 2;
  const x = 40;
  const y = Math.round(height * 0.6);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<text x="${x}" y="${y}" transform="rotate(-28 ${cx} ${cy})" ` +
    `font-family="Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif" ` +
    `font-size="${fontSize}" fill="#ffffff" fill-opacity="0.09">${escapeXml(label)}</text>` +
    `</svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
