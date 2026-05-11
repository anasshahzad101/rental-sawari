// Crop the main icon tile out of the Canva-exported logo.png.
//
// The Canva export packs the main logo, a small icon variant, and the orange
// "S" alternate onto one cream canvas. For the website we only need the main
// icon tile (no wordmark — that lives as text in the Logo component).

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "public/logo.png";
const OUT_FULL = "public/logo-full.png";
const OUT_MARK = "public/logo-mark.png";

const meta = await sharp(SRC).metadata();
console.log(`Source: ${meta.width}x${meta.height}`);

// Preserve the full export as logo-full.png for marketing use.
if (!fs.existsSync(OUT_FULL)) {
  fs.copyFileSync(SRC, OUT_FULL);
  console.log(`Saved full canvas → ${OUT_FULL}`);
}

// Crop the main icon tile. Coords measured from the 512×512 export.
const tile = { left: 108, top: 96, width: 152, height: 152 };

await sharp(SRC)
  .extract(tile)
  .resize(256, 256)
  .png({ compressionLevel: 9 })
  .toFile(OUT_MARK);

const out = await sharp(OUT_MARK).metadata();
console.log(`Cropped mark → ${OUT_MARK} (${out.width}x${out.height}, ${out.channels} channels)`);
