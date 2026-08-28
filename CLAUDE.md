# CLAUDE.md

## Project

Astro 5/7 marketing site for **Troth** (jointroth.co) — a private, encrypted iPhone app for married couples. Two page families: the mobile-first **waitlist landing page** (inside an iPhone frame) and the **`/guides` lead-magnet landing pages** (full-bleed editorial, no phone frame). Deployed to Cloudflare (Workers + static assets) via `@astrojs/cloudflare`.

The codebase was repurposed from a prior site (re/Human); the reusable Astro/Cloudflare skeleton was kept and everything product-specific was rebuilt. The commit tagged "Snapshot: re/Human codebase before Troth rebrand" is the restore point for anything from the old site.

## Commands

- `npm run dev` — dev server on localhost:4321
- `npm run build` — production build to `./dist/` (emits `dist/client` assets + `dist/server` worker)
- `npx wrangler deploy` — deploy the built worker (reads the generated `dist/server/wrangler.json`)
- `npx prettier --write .` — format all files
- `npm run astro -- check` — type-check

## Deploy / Cloudflare gotcha

`wrangler.jsonc` must **not** set `main` or `assets.directory`. `@astrojs/cloudflare` generates `dist/server/wrangler.json` with the real `main` (`entry.mjs`) and `assets.directory` (`../client`) at build time, merging in the top-level `name`/`compatibility_*`/`observability`/`assets.binding` from `wrangler.jsonc`. A self-referential `main: dist/_worker.js/index.js` (from the old template) **breaks the build** — the bundled `@cloudflare/vite-plugin` validates `main` before the output exists.

**Deploy as a Cloudflare Worker, not Pages.** The adapter emits a Worker — static assets in `dist/client`, worker in `dist/server` — and `npx wrangler deploy` reads the build-generated `.wrangler/deploy/config.json`. A Pages project pointed at `dist` returns 404 because the site lives in `dist/client`, not `dist`. For Git auto-deploy, use Cloudflare **Workers Builds** (a Worker connected to the repo) with build command `npm run build` — not a Pages project.

**Regenerate the lockfile with npm 10, not 11.** Cloudflare builds with the npm bundled in Node 22.15.0 (`npm@10.9.2`) and runs `npm ci`, which requires `package-lock.json` to match `package.json` exactly. npm 11 records the wasm / `@emnapi/*` optional dependencies differently than npm 10, so a lock regenerated with npm 11 fails the Cloudflare build with `Missing: @emnapi/* from lock file`. Whenever you change dependencies, regenerate the lock with the matching npm — `npx npm@10.9.2 install` — and verify it with `npx npm@10.9.2 ci --dry-run` before pushing.

## Architecture

- **Native Astro, no React.** Every page and component is `.astro`; interactivity is small vanilla `<script>`s (Astro bundles/inlines them). Hover, press, and focus states are CSS. There is no client-side framework — keep it that way.
- `src/layouts/Layout.astro` — minimal shell: `<head>`, SEO, a pre-paint `is:inline` script (applies the saved Lamplight preference + adds `.troth-phone` via device detection), global body styles. No nav/footer chrome (waitlist pages carry zero navigation).
- `src/components/functional/SEO.astro` — site-wide meta/OG/JSON-LD. Site URL `https://jointroth.co`.
- **Reusable component library** — this is the pattern to extend for future sections (testimonials, instructions, etc.):
  - `src/elements/` — primitives with scoped styles: `LanternMark`, `Eyebrow` (tone: accent/letter/tertiary), `Button` (variant/size, CSS hover/press, renders `<a>` when `href` set), `TextField` (CSS focus glow), `Avatar`.
  - `src/components/troth/` — `PhoneFrame.astro` (the shared iPhone-frame shell: canvas, device frame, simulated status bar, Lamplight toggle + its theme `<script>`) and content components: `MessageBubble`, `QuestionCard`, `OnThisDayCard`, `ManifestoEntry`, `KeepsakeSeal`.
- Pages compose the library: `src/pages/index.astro` (landing — 7 scroll-snap screens + a page `<script>` for scroll reveal/progress dots/forms) and `src/pages/welcome.astro` (confirmation — spouse invite + copy links, its own `<script>`).
- `src/pages/api/subscribe.ts` — the single email-capture route (server route, `prerender = false`) → **Loops** custom form (public newsletter-form endpoint, no API key). Two request shapes: `{ email }` (waitlist — landing + spouse invite, which adds `ref: "spouse"`) and `{ email, guide, waitlist }` (a `/guides` lead magnet). **The client never sends mailing-list IDs** — `guide` is a slug resolved server-side against `src/lib/loops.ts`.
- Self-hosted fonts via `@fontsource` (no Google Fonts CDN — sub-1s LCP).
- CSS layering: design tokens in `src/css/troth-tokens.css`, shared UI/motion in `src/css/troth-ui.css` (both imported by `tailwind.css`, global); `src/css/troth-guide.css` is imported by `GuideLayout.astro` only, so waitlist pages never load it. Page-specific rules (scroll snap, reveal, dots) live in each page's `<style is:global>`. Waitlist page/section layout uses inline `style="…var(--…)…"` to stay faithful to the ported design; the guide components and every reusable component carry scoped `<style>` with `var(--token)` values.

## Lead-magnet pages (`/guides`)

**Adding a guide is adding one `.mdx` file** — `src/content/guides/<slug>.mdx` — plus one row in `src/lib/loops.ts`. Nothing else. That file's frontmatter drives the entire page; the MDX body is optional extra prose rendered between the steps and the founder note (omit it entirely and the section disappears).

- `src/content.config.mjs` — the `guides` collection schema (zod). Every section is optional except `title`/`description`/`headline`/`subhead`, so a sparse guide degrades gracefully.
- `src/pages/guides/[slug]/index.astro` — the landing page: hero + form, problem statement, "what's inside" steps beside a CSS paper mock of the asset, optional photo, optional MDX prose, founder note + second form, dark closing bridge to the product, and a phone-only sticky offer bar (shown only while no real form is on screen).
- `src/pages/guides/[slug]/thank-you.astro` — the double-opt-in ask (`noindex`). It **never links the PDF**; the asset travels only through the confirmation email. `?w=1` (set when the waitlist checkbox was ticked) swaps the waitlist CTA for an acknowledgement, via a pre-paint `is:inline` script so neither block flashes.
- `src/pages/guides/index.astro` — plain listing so `/guides` isn't a dead end.
- `src/layouts/GuideLayout.astro` + `src/components/guides/` (`GuideHeader`, `GuideFooter`, `GuideForm`, `ExercisePreview`) + `src/elements/` (`Checkbox`, `LamplightToggle`). Same tokens and two typefaces as the waitlist pages — different shape.
- A `___` (3+ underscores) in `headline` renders as a ruled terracotta blank you could write on. The h1 keeps the raw string as its `aria-label`.
- **PDFs and photos go in `public/guides/`** (see the README there). The `pdf:` frontmatter field is the URL to paste into the Loops confirmation email.
- Guide slugs are validated against `^[a-z0-9][a-z0-9-]{0,63}$` before being echoed to Loops as a `source`. A slug with no configured list still captures the email (tagged by source) and logs a warning, so a new page can never silently drop a signup.

## Icons

**`public/favicon.svg` is the single source of truth for the mark.** Every raster is derived from it by `node scripts/build-icons.mjs` — never hand-edit the outputs, and re-run the script after touching the SVG:

- `favicon.ico` (32×32) — the universal fallback, and the one that matters for Search: Google accepts BMP/GIF/ICO/PNG/JPEG/PPM/TIFF favicons but **not SVG**, so without it there's no icon beside a result. Safari has never supported WebP favicons either.
- `favicon.png` (512×512) — also the `logo` in the homepage `Organization` JSON-LD.
- `apple-touch-icon.png` (180×180) — flattened onto cream and square-edged, because iOS applies its own squircle mask and transparent corners render black.
- `favicon.webp` (512×512) — kept in sync but **not referenced by any page**; WebP favicons aren't broadly supported. Safe to delete.

Inside the SVG the two lanterns are drawn about x=24.5/45.5 spanning y 14.2–42.2, which is off-centre on the 64 canvas; the single `translate(-3 3.8)` on their group is what lands them on 32,32. Keep that transform if you edit the paths.

## Social cards (Open Graph)

`og:image` **must be a real, absolute, already-rendered file** — social crawlers don't run JS and don't come back to retry a broken one. The cards are baked ahead of time:

- `node scripts/build-og.mjs` renders `public/og/*.png` at **1200×630** (the 1.91:1 ratio Facebook and LinkedIn both ask for, which X also crops `summary_large_image` to). It lays each card out in headless Chrome using the real tokens and the real self-hosted webfonts, then screenshots it — so a card can never drift from the design system.
- Card copy lives in the `CARDS` map at the top of that script. `<em>` renders the italic terracotta emphasis; `___` renders the ruled blank.
- **A new guide gets a card by adding one `CARDS` entry keyed by its slug**, re-running the script, and setting `ogImage: "/og/<slug>.png"` + `ogImageAlt:` in its frontmatter. Skip all that and it falls back to `/og/default.png` — still a valid card, just not specific.
- `SEO.astro` hardcodes `og:image:width/height` as 1200×630, so any custom `ogImage` must be that size.

## Design source

The landing + confirmation pages are a faithful port of the Claude Design project **"Troth waitlist landing page"** (`Troth Landing Page.dc.html` + the `screenshots/*-confirm.png` mockups) and its design system. Pull design files with the `claude-design` MCP (`DesignSync` tool) — project id `e4995b13-c9e2-4e36-9183-0331506b3373`. The `.dc.html` component format (`<x-dc>`, `<x-import>`, `<sc-if>`, `{{ }}` bindings) and its React design-system bundle were translated into the native-Astro `src/elements/` + `src/components/troth/` library above; the layout/styling was ported verbatim (inline `var(--…)` styles), and stateful behavior became vanilla `<script>`s.

## Design System

### Tokens (`src/css/troth-tokens.css`)

Warm, low-saturation, editorial — every color reads "hand-mixed," never digital. Base is cream, the single accent is terracotta, text is warm charcoal (never true black). **Never use raw hex** in components — use these CSS variables (referenced via inline `var(--…)`, matching the design's inline-style approach):

| Token                                       | Light     | Role                                        |
| ------------------------------------------- | --------- | ------------------------------------------- |
| `--color-bg` / `--cream`                    | `#F4EFE6` | app / frame background                      |
| `--color-surface` / `--cream-lifted`        | `#FBF6EC` | elevated card (lighter = raised, no shadow) |
| `--color-surface-sunken` / `--cream-sunken` | `#EBE3D3` | recessed field / placeholder                |
| `--color-canvas`                            | `#DFD6C6` | backdrop behind the phone frame             |
| `--color-text` / `--ink`                    | `#2B2623` | primary text (warm charcoal)                |
| `--color-text-secondary` / `--ink-2`        | `#6B6156` | supporting text                             |
| `--color-text-tertiary` / `--ink-3`         | `#98907F` | quiet metadata, section markers             |
| `--color-accent` / `--terracotta`           | `#A24B34` | CTAs, section markers, moments of weight    |
| `--color-accent-press`                      | `#8A3D29` | hover / pressed                             |
| `--color-letter` / `--plum`                 | `#7A2E39` | letters, keepsake attribution               |
| `--color-keepsake` / `--foil`               | `#B0862E` | keepsake wax-seal gold                      |
| `--color-border`                            | `#E4DCC9` | quiet hairline dividers                     |

Only one accent is ever used at a time. Also: `--radius-input:8px`, `--radius-card:12px`, `--radius-pill:999px`; spacing `--space-*` (4px base); motion `--ease-troth` (ease-out, never bounce), `--dur-quick:250ms` / `--dur-considered:380ms`; `--shadow-float` for the sticky bar only (cards are flat).

### Dark mode ("Lamplight")

Warm, low-contrast, deep browns/burgundies (`#1E1712` bg) — never OLED-black. Toggled by the `.troth-dark` class on `<html>` (also `[data-theme="dark"]`), persisted to `localStorage["troth-theme"]`, applied pre-paint by the FOUC script in `Layout.astro`. Light is the default. The "Sealed for two" section is always dark (it carries its own `.troth-dark` class).

### Fonts

| Token          | Font           | Usage                                                                    |
| -------------- | -------------- | ------------------------------------------------------------------------ |
| `--font-serif` | Newsreader     | headers, hero, letters, pull quotes (emphasis is **italic, never bold**) |
| `--font-sans`  | Hanken Grotesk | labels, metadata, buttons, UI chrome                                     |

No third family.

### Voice (from the design system)

Editorial, warm, unhurried, founder-authored. Address the couple as **"the two of you"** (never "users"/"customers"). Sentence case; small-caps only for quiet section markers. **No exclamation points, no emoji, no AI/"smart" language** (Troth has no AI). Prefer: sealed, kept, held, home, room, chapter, promise, borrowed rooms. Marketing closes with "— Clark". Founders: **Clark and Carrie Sell**.

## Style

- Match the design's inline-`var(--token)` styling inside `TrothLanding.jsx`; use Tailwind utilities for anything new outside the ported page.
- `npx prettier --write .` before committing.
