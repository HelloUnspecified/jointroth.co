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
 *
 * Letters need nothing: every issue in src/content/letters/ gets its own card
 * at public/og/letters/<slug>.png from its frontmatter (title, date, summary),
 * and the issue page picks it up when the file exists. Re-run after adding one:
 *
 *   node scripts/build-og.mjs letters    # just the letters
 */
import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, writeFile, rm } from "node:fs/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import YAML from "yaml";

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
    eyebrow: "A private iPhone app for married couples",
    /* `em` marks the italic terracotta emphasis — italic, never bold. */
    headline:
      "A year planning the wedding. Then the marriage just <em>happens.</em>",
    sub: "A private place for the two of you to keep what matters and build what's next. Coming to iPhone in 2026.",
    foot: "jointroth.co",
  },
  "were-building": {
    eyebrow: "A free exercise for two",
    /* `___` renders as the ruled blank, same as the page headline. */
    headline: "We're building a relationship where we ___",
    sub: "A free, printable exercise for two. One pen each, thirty minutes.",
    foot: "jointroth.co/guides",
  },
  newsletter: {
    eyebrow: "A free letter for married couples",
    headline: "Brick by <em>Brick.</em>",
    sub: "Practical advice, real stories, and the hard conversations. From Clark and Carrie Sell, 23 years in and still doing the work.",
    foot: "jointroth.co/newsletter",
  },
};

/* ---- letters: one card per issue, from frontmatter ----------------------- */

const LETTERS_DIR = path.join(root, "src", "content", "letters");
const LETTERS_OUT = path.join(OUT, "letters");

/** Cut a deck down to roughly one sentence's worth for the card. */
function deck(text, max = 150) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(", "));
  return (end > 60 ? cut.slice(0, end + 1) : cut.trimEnd() + "…").trim();
}

function letterDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

async function letterCards() {
  const cards = {};
  let files = [];
  try {
    files = (await readdir(LETTERS_DIR)).filter((f) => /\.mdx?$/.test(f));
  } catch {
    return cards;
  }
  for (const file of files) {
    const raw = await readFile(path.join(LETTERS_DIR, file), "utf8");
    const m = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!m) continue;
    const fm = YAML.parse(m[1]);
    if (fm.draft) continue;
    const slug = file.replace(/\.mdx?$/, "");
    cards[slug] = {
      eyebrow: `Brick by Brick · ${letterDate(fm.date)}`,
      headline: fm.title,
      sub: deck(fm.description ?? fm.summary ?? ""),
      foot: "jointroth.co/newsletter",
    };
  }
  return cards;
}

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
h1.long{font-size:54px;max-width:24ch}
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
  <h1 class="${card.headline.length > 40 ? "long" : ""}">${rich(card.headline)}</h1>
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
const letters = await letterCards();

/** [card, output dir, label] */
let jobs;
if (only === "letters") {
  jobs = Object.entries(letters).map(([k, c]) => [
    k,
    c,
    LETTERS_OUT,
    `letters/${k}`,
  ]);
} else if (only) {
  if (CARDS[only]) jobs = [[only, CARDS[only], OUT, only]];
  else if (letters[only])
    jobs = [[only, letters[only], LETTERS_OUT, `letters/${only}`]];
  else throw new Error(`No card or letter named "${only}".`);
} else {
  jobs = [
    ...Object.entries(CARDS).map(([k, c]) => [k, c, OUT, k]),
    ...Object.entries(letters).map(([k, c]) => [
      k,
      c,
      LETTERS_OUT,
      `letters/${k}`,
    ]),
  ];
}

const bin = await chrome();
const fontCss = await faces();
await mkdir(OUT, { recursive: true });
await mkdir(LETTERS_OUT, { recursive: true });

for (const [name, card, dir, label] of jobs) {
  const html = path.join(dir, `.${name}.html`);
  await writeFile(html, page(card, fontCss));
  await exec(bin, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    `--screenshot=${path.join(dir, `${name}.png`)}`,
    `--window-size=${WIDTH},${HEIGHT}`,
    `file://${html}`,
  ]);
  await rm(html);
  console.log(`  og/${label}.png`);
}
