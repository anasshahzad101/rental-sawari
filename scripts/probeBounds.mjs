// Locate the teal tile in the Canva-exported PNG by detecting teal pixels.
// Teal is roughly RGB(15, 118, 110); cream background is around RGB(248, 244, 232).

import sharp from "sharp";

const img = sharp("public/logo.png");
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
console.log(`Image: ${info.width}x${info.height}, channels: ${info.channels}`);

function isTeal(r, g, b) {
  // Detect teal-ish pixels: moderate green, low red, similar green/blue.
  return r < 100 && g > 80 && g < 180 && b > 60 && b < 160 && g > r && b > r;
}

function getPixel(x, y) {
  const i = (y * info.width + x) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
}

// Scan rows/cols to find the bounding box of teal pixels.
// We only care about the main tile (top-left area), so limit scan range.
let minX = info.width, maxX = 0, minY = info.height, maxY = 0;

for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const [r, g, b] = getPixel(x, y);
    if (isTeal(r, g, b)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

console.log(`All teal pixels: x ${minX}-${maxX}, y ${minY}-${maxY}`);

// Now find connected components by scanning for the MAIN big tile separately
// from the small bottom-left version. Tile 1 is in the top half (y < 256).
let m1 = { minX: info.width, maxX: 0, minY: info.height, maxY: 0 };
let m2 = { minX: info.width, maxX: 0, minY: info.height, maxY: 0 };
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const [r, g, b] = getPixel(x, y);
    if (!isTeal(r, g, b)) continue;
    if (y < 256) {
      if (x < m1.minX) m1.minX = x;
      if (x > m1.maxX) m1.maxX = x;
      if (y < m1.minY) m1.minY = y;
      if (y > m1.maxY) m1.maxY = y;
    } else {
      if (x < m2.minX) m2.minX = x;
      if (x > m2.maxX) m2.maxX = x;
      if (y < m2.minY) m2.minY = y;
      if (y > m2.maxY) m2.maxY = y;
    }
  }
}

console.log(`Top tile (main):  x ${m1.minX}-${m1.maxX}  y ${m1.minY}-${m1.maxY}  →  ${m1.maxX - m1.minX + 1}x${m1.maxY - m1.minY + 1}`);
console.log(`Bottom tile (alt): x ${m2.minX}-${m2.maxX}  y ${m2.minY}-${m2.maxY}  →  ${m2.maxX - m2.minX + 1}x${m2.maxY - m2.minY + 1}`);

// Sample a few pixels for sanity
for (const [x, y] of [[100, 100], [180, 180], [400, 180], [150, 360]]) {
  console.log(`pixel(${x},${y}) = ${getPixel(x, y)}`);
}
