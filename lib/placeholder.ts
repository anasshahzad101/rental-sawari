/**
 * Single source of truth for placeholder imagery.
 *
 * Resolution order:
 *   1. `realUrl`  → a hosted Wikimedia / Unsplash / CDN URL (the live image).
 *   2. `realPath` → local image in /public/images once we've downloaded one.
 *   3. fallback   → a brand-coloured placehold.co tile with the label baked in.
 *
 * Each mock data file calls `placeholder(...)`. Drop a `realUrl` on a single
 * item to swap that image only; leave others on the placeholder.
 */

const BRAND_HEX = "0F766E";

export function placeholder(opts: {
  width: number;
  height: number;
  label: string;
  realUrl?: string;
  realPath?: string;
}) {
  if (opts.realUrl) return opts.realUrl;
  if (opts.realPath) return opts.realPath;
  const text = encodeURIComponent(opts.label);
  return `https://placehold.co/${opts.width}x${opts.height}/${BRAND_HEX}/white?text=${text}`;
}
