/**
 * Renders the site's Open Graph cards to public/og/*.png at 1200x630.
 *
 * Social crawlers can't run our CSS, so the cards are baked ahead of time:
 * this script lays each one out in headless Chrome using the real design
 * tokens and the real self-hosted webfonts, then screenshots it.
 *
 *   node scripts/build-og.mjs            # render every card
 *   node scripts/build-og.mjs default    # render one
 *
 * Adding a guide? Add a CARDS entry keyed by the guide slug and point that
 * guide's `ogImage:` frontmatter at /og/<slug>.png. Without an entry the guide
 * falls back to the default card, which is fine — just less specific.
 */
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";

const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "public", "og");

/* 1200x630 at the 1.91:1 ratio Facebook and LinkedIn both ask for, which is
   also what X crops summary_large_image to. */
const WIDTH = 1200;
const HEIGHT = 630;

const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

/* ---- the cards ---------------------------------------------------------- */

const CARDS = {
  default: {
    eyebrow: "Coming to iPhone",
    /* `em` marks the italic terracotta emphasis — italic, never bold. */
    headline: "Love is more than a feeling. It's what you <em>do.</em>",
    sub: "A private, encrypted home for your marriage.",
    foot: "jointroth.co",
  },
  "were-building": {
    eyebrow: "A free exercise for two",
    /* `___` renders as the ruled blank, same as the page headline. */
    headline: "We're building a relationship where we ___",
    sub: "A free, printable exercise for two. One pen each, thirty minutes.",
    foot: "jointroth.co/guides",
  },
};

/* ---- layout ------------------------------------------------------------- */

const FONTS = [
  ["Newsreader", 400, "normal", "newsreader/files/newsreader-latin-400-normal"],
  ["Newsreader", 400, "italic", "newsreader/files/newsreader-latin-400-italic"],
  ["Newsreader", 500, "normal", "newsreader/files/newsreader-latin-500-normal"],
  [
    "Hanken Grotesk",
    600,
    "normal",
    "hanken-grotesk/files/hanken-grotesk-latin-600-normal",
  ],
];

async function faces() {
  const out = [];
  for (const [family, weight, style, file] of FONTS) {
    const buf = await readFile(
      path.join(root, "node_modules", "@fontsource", `${file}.woff2`),
    );
    out.push(`@font-face{font-family:"${family}";font-weight:${weight};
      font-style:${style};src:url(data:font/woff2;base64,${buf.toString("base64")}) format("woff2")}`);
  }
  return out.join("\n");
}

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Re-apply the two bits of inline markup the copy is allowed to carry, after
   escaping: <em> for the italic emphasis and ___ for the ruled blank. */
const rich = (s) =>
  esc(s)
    .replace(/&lt;em&gt;/g, "<em>")
    .replace(/&lt;\/em&gt;/g, "</em>")
    .replace(/_{3,}/g, '<span class="blank"></span>');

const MARK = `<svg width="64" height="40" viewBox="0 0 64 40" fill="none">
  <path d="M18.5 6.2c4.1 0 7 6.4 7 14.1 0 7.7-2.9 13.9-7 13.9s-7-6.2-7-13.9c0-7.7 2.9-14.1 7-14.1Z" fill="#A24B34"/>
  <path d="M39.5 6.2c4.1 0 7 6.4 7 14.1 0 7.7-2.9 13.9-7 13.9s-7-6.2-7-13.9c0-7.7 2.9-14.1 7-14.1Z" fill="#7A2E39"/>
</svg>`;

function page(card, fontCss) {
  return `<!doctype html><meta charset="utf-8"><style>
${fontCss}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${WIDTH}px;height:${HEIGHT}px}
body{background:#F4EFE6;font-family:"Newsreader",Georgia,serif;
  -webkit-font-smoothing:antialiased;overflow:hidden;position:relative}

/* The hero's terracotta ignite glow, warming the top-left corner. */
.glow{position:absolute;top:-22%;left:-16%;width:86%;height:118%;
  background:radial-gradient(ellipse 52% 48% at 42% 44%,
    rgba(162,75,52,.20), rgba(162,75,52,.04) 56%, rgba(162,75,52,0) 76%);
  filter:blur(26px)}

.card{position:relative;height:100%;padding:72px 84px;
  display:flex;flex-direction:column}

/* margin-bottom guarantees air under the wordmark even when a long headline
   pushes the auto-margined eyebrow all the way up. */
.brand{display:flex;align-items:center;gap:16px;margin-bottom:34px}
.brand span{font-size:23px;font-weight:500;letter-spacing:.34em;
  text-transform:uppercase;color:#2B2623;padding-left:.34em}

.eyebrow{margin-top:auto;font-family:"Hanken Grotesk",sans-serif;font-size:19px;
  font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#A24B34}

h1{margin-top:22px;font-size:66px;font-weight:400;line-height:1.06;
  letter-spacing:-.015em;color:#2B2623;text-wrap:balance;max-width:21ch}
h1 em{font-style:italic;color:#A24B34}

/* The ruled blank you could write on — the guide headline's whole point. */
.blank{display:inline-block;width:2.6em;height:.66em;
  border-bottom:3px solid #A24B34;margin:0 .06em -.02em}

.sub{margin-top:26px;font-size:29px;line-height:1.5;color:#6B6156;
  text-wrap:pretty;max-width:34ch}

.foot{margin-top:auto;padding-top:34px;border-top:1px solid #E4DCC9;
  display:flex;justify-content:space-between;align-items:baseline;
  font-family:"Hanken Grotesk",sans-serif;font-size:19px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase}
.foot .site{color:#A24B34}
.foot .seal{color:#98907F}
</style>
<div class="glow"></div>
<div class="card">
  <div class="brand">${MARK}<span>Troth</span></div>
  <div class="eyebrow">${esc(card.eyebrow)}</div>
  <h1>${rich(card.headline)}</h1>
  <p class="sub">${esc(card.sub)}</p>
  <div class="foot">
    <span class="site">${esc(card.foot)}</span>
    <span class="seal">Sealed for two</span>
  </div>
</div>`;
}

/* ---- render ------------------------------------------------------------- */

async function chrome() {
  for (const bin of CHROME) {
    try {
      await exec(bin, ["--version"]);
      return bin;
    } catch {}
  }
  throw new Error(
    "No Chrome/Chromium found. Install Google Chrome, or add its path to CHROME.",
  );
}

const only = process.argv[2];
const names = only ? [only] : Object.keys(CARDS);
if (only && !CARDS[only]) throw new Error(`No card named "${only}".`);

const bin = await chrome();
const fontCss = await faces();
await mkdir(OUT, { recursive: true });

for (const name of names) {
  const html = path.join(OUT, `.${name}.html`);
  await writeFile(html, page(CARDS[name], fontCss));
  await exec(bin, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    `--screenshot=${path.join(OUT, `${name}.png`)}`,
    `--window-size=${WIDTH},${HEIGHT}`,
    `file://${html}`,
  ]);
  await rm(html);
  console.log(`  og/${name}.png`);
}
