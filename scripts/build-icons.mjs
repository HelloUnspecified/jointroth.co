/**
 * Renders every raster icon from public/favicon.svg — the single source of
 * truth for the mark. Run after editing that file:
 *
 *   node scripts/build-icons.mjs
 *
 * Why rasters at all, when the SVG is sharper? Google Search doesn't accept
 * SVG favicons — its supported list is BMP, GIF, ICO, PNG, JPEG, PPM, TIFF —
 * so without a raster there's no favicon beside the result. Safari likewise
 * has no WebP favicon support, which is why .ico carries the fallback.
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const CREAM = "#F4EFE6"; // --cream, the mark's own backdrop

const svg = await readFile(path.join(pub, "favicon.svg"));
const render = (size) =>
  sharp(svg, { density: 384 }).resize(size, size, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

/* Browser tab + the Organization JSON-LD logo. Keeps the SVG's rounded
   corners transparent so the mark reads as a sticker on any tab colour. */
await render(512).png().toFile(path.join(pub, "favicon.png"));
await render(512).webp({ quality: 92 }).toFile(path.join(pub, "favicon.webp"));

/* iOS home screen. Flattened onto cream and left square-edged: iOS applies its
   own squircle mask, so transparent corners would show through as black. */
await sharp(svg, { density: 384 })
  .resize(180, 180)
  .flatten({ background: CREAM })
  .png()
  .toFile(path.join(pub, "apple-touch-icon.png"));

/* favicon.ico as a single 32x32 PNG-in-ICO — the container every browser since
   Vista reads, and the format Google names first. */
const ico = await render(32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette: none
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(ico.length, 14);
header.writeUInt32LE(22, 18); // offset of the payload
await writeFile(path.join(pub, "favicon.ico"), Buffer.concat([header, ico]));

for (const f of [
  "favicon.png",
  "favicon.webp",
  "apple-touch-icon.png",
  "favicon.ico",
]) {
  console.log(`  ${f}`);
}
