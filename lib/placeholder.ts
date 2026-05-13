/**
 * Single source of truth for placeholder imagery.
 *
 * Resolution order:
 *   1. `realUrl` mapped to a local /public/images/wikimedia/* path via the
 *      auto-generated imageMap (see scripts/downloadImages.mjs). Production
 *      serves the local copy from Vercel's CDN — eliminates the Wikipedia
 *      rate-limit and intermittent-image-load issues seen in earlier deploys.
 *   2. `realUrl` falls back to the live remote URL if we don't have a local
 *      copy (works because remotePatterns in next.config still lists Wikimedia).
 *   3. `realPath` → manually-specified local image in /public/images.
 *   4. fallback   → a brand-coloured placehold.co tile with the label baked in.
 */

import { imageMap } from "./imageMap";

const BRAND_HEX = "0F766E";

export function placeholder(opts: {
  width: number;
  height: number;
  label: string;
  realUrl?: string;
  realPath?: string;
}) {
  if (opts.realUrl) {
    const local = imageMap[opts.realUrl];
    if (local) return local;
    return opts.realUrl;
  }
  if (opts.realPath) return opts.realPath;
  const text = encodeURIComponent(opts.label);
  return `https://placehold.co/${opts.width}x${opts.height}/${BRAND_HEX}/white?text=${text}`;
}
