# CLAUDE.md

## Project

Astro 5/7 marketing site for **Troth** (jointroth.co) — a private, encrypted iPhone app for married couples. One page family: full-bleed editorial pages on the shared `GuideLayout` shell — the **homepage** (`/`, the waitlist pitch), **`/welcome`** (post-signup, spouse invite), the **`/guides` lead magnets** and the **`/newsletter`** pages. Deployed to Cloudflare (Workers + static assets) via `@astrojs/cloudflare`.

The homepage was rebuilt in September 2026. The first version was a scroll-snapping iPhone frame that simulated using the app; visitors read it as a prototype and couldn't tell what Troth was. The frame (`PhoneFrame.astro`) is gone — commit `3efca82` ("newsletter page") is the last one that still has it, if a piece is ever wanted.

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
- `src/layouts/Layout.astro` — minimal shell: `<head>`, SEO, a pre-paint `is:inline` script (applies the saved Lamplight preference), global body styles. `src/layouts/GuideLayout.astro` wraps it with the sticky header (`GuideHeader`: wordmark, optional `nav` links, Lamplight toggle, a CTA that fades in on scroll), the footer, and `troth-guide.css`. Every page uses `GuideLayout`; pass `ogType="website"` for non-article pages. The nav links live in `src/lib/nav.ts` (`getSiteNav()`); the homepage, `/pricing` and `/privacy` pass them, and the guide, newsletter and thank-you pages deliberately don't, so each keeps its one form as the only way forward. The nav is desktop-only; on phones the footer carries the links.
- `src/components/functional/SEO.astro` — site-wide meta/OG/JSON-LD. Site URL `https://jointroth.co`.
- **Reusable component library** — this is the pattern to extend for future sections (testimonials, instructions, etc.):
  - `src/elements/` — primitives with scoped styles: `LanternMark`, `Eyebrow` (tone: accent/letter/tertiary), `Button` (variant/size, CSS hover/press, renders `<a>` when `href` set), `TextField` (CSS focus glow), `Avatar`.
  - `src/components/troth/` — the app's content components, used to draw pieces of the product on the homepage: `MessageBubble`, `QuestionCard`, `OnThisDayCard`, `ManifestoEntry`, `KeepsakeSeal`.
  - `src/components/home/AppStoreBadge.astro` — Apple's official **"Pre-order on the App Store"** badge in the hero (`public/app-store/pre-order-black.svg`, the white variant in Lamplight; from Apple's marketing-badge kit, never redrawn or recoloured, min 40px tall with clear space) + its `<dialog>`: pre-orders open before the 2026 release, the waitlist hears first, form. Until the App Store listing exists the badge opens that notice; once pre-orders are live, point it at the store URL and drop the dialog. Without JS the badge is a link to `#join`.
  - `src/components/home/PhoneMock.astro` — an iPhone drawn as an illustration (bezel, status bar, app header, tab row); whatever is slotted in is "the screen". `role="img"` with a label, so the mock's text is never read as page content. **To use a real screenshot, pass `src="/app/<screen>.png"`** (drop the file in `public/app/`, any 9:19.5 image such as 1179×2556) — the drawn chrome disappears and the image fills the screen. The homepage currently draws three screens (Today in the hero, the first Foundation exercise in "What Troth is", the Story timeline in "Where you end up"); the plan is to replace all three, plus the rail and layered diagrams in "What Troth is", with screenshots from the app.
- `src/pages/index.astro` — the homepage, built as a **journey**, because nobody arrives looking for a place to keep their marriage (it's a new idea) and the page has to create the recognition before it shows the product. Top to bottom: hero ("A year planning the wedding. Then the marriage just happens.", inline waitlist form, beside the `PhoneMock`) → the part nobody plans ("Nobody builds a marriage on purpose. What if you did?", three scenes in their words + the iMessage-thread vignette, closing with "this isn't a marriage in trouble, it's every marriage") → the turn ("What if your marriage had a place?", the brand line, the definition of _troth_) → the app ("One place, built in layers": three roomy rows — the foundation (vows, values, troth — built with guided exercises inside the app; the phone shows the first one, "We're building a relationship where we…", each spouse's lines and the one chosen together, and the paper version is offered in one line), the timeline everything runs through (messages, pictures, places, letters, milestones, events), and the view you get laying one over the other, with the outcomes reflect / plan / check in / work through; then "how it starts" as a three-step row) → where you end up (next anniversary, you read the year back; a second `PhoneMock` on the Story tab) → "but we already have…" (iMessage/Photos, Facebook, nothing; ends on "borrowed rooms") → Clark and Carrie → Sealed for two (always Lamplight) → six-question FAQ (also `FAQPage` JSON-LD) → closing form with links to the exercise and the letter. Phone-only `StickyBar`. All copy lives in the constants at the top of the file. The waitlist forms are `GuideForm` with no `guide`/`newsletter` prop (posts `{ email }`) and `redirect="/welcome"`. **Keep the order**: problem before product, product before result, objections after result.
- `src/pages/welcome.astro` — the confirmation page: spouse invite (posts `{ email, ref: "spouse" }`) + copy-link buttons, its own `<script>`. Handles `?already=1` like the newsletter thank-you page ("you're already on the list", no confirm instructions). The invite copy promises only what Loops sends today: the confirm email, then Clark's note.
- `src/pages/pricing.astro` — the pricing manifesto, before there's a price (Sunsama-style: say the uncomfortable part first, then the principles). Troth is **not a five-dollar app and doesn't compete on price**: one price a year for the two of you, "more than you expect an app to cost, less than an hour with a counselor". The nine principles live in the `principles` array; when the number is set, fill `price` at the top and it replaces the "shape" list. Linked from the nav, the footer and the cost FAQ.
- `src/pages/privacy.astro` — "How Troth keeps it sealed": where the data lives, what Apple can and can't see, what Troth can see (nothing), what happens if Troth goes away, what isn't done yet. Copy is in the `sections` array. Linked from the homepage's "Sealed for two" section, the FAQ, the nav and the footer.
- `src/pages/api/subscribe.ts` — the single email-capture route (server route, `prerender = false`) → **Loops**. Three request shapes: `{ email }` (waitlist — landing + spouse invite, which adds `ref: "spouse"` and is recorded in Loops under the source `joinTroth.co/spouse` instead of `joinTroth.co`, so a spouse-specific note can be built there as its own workflow), `{ email, guide, waitlist }` (a `/guides` lead magnet) and `{ email, newsletter: true, waitlist }` (the `/newsletter` page). **The client never sends mailing-list IDs** — `guide` is a slug resolved server-side against `src/lib/loops.ts`, `newsletter` is a flag resolved the same way. It picks one of two paths into Loops — see "Loops: two paths in" below.
- Self-hosted fonts via `@fontsource` (no Google Fonts CDN — sub-1s LCP).
- CSS layering: design tokens in `src/css/troth-tokens.css`, shared UI/motion in `src/css/troth-ui.css` (both imported by `tailwind.css`, global); `src/css/troth-guide.css` (the editorial page vocabulary: `.g-wrap`, `.g-section`, `.g-h1/2/3`, `.g-lede`, `.g-body`, `.g-band`, `.g-split`, `.g-steps`, `.g-note`, `.g-reveal`, sticky bar) is imported by `GuideLayout.astro`. Page-specific rules live in each page's scoped `<style>`. The `troth/` content components carry inline `style="…var(--…)…"` (ported from the design); everything else uses scoped `<style>` with `var(--token)` values.

## Loops: two paths in

The **"Contact added to list"** workflow trigger fires on a _change_ in subscription state, not on a form submission. Re-posting the form for someone already on the list is a silent no-op — no trigger, no email, and the site still shows success. So `/api/subscribe` branches on whether the contact is already on the list that delivers what they just asked for:

- **Not on it** (new, pending, or never subscribed) → the public **form endpoint**, exactly as before. This is the only Loops endpoint gated behind [double opt-in](https://loops.so/docs/contacts/double-opt-in), so new contacts get the confirmation email; the list subscription — and the workflow that delivers the PDF — happen when they confirm.
- **Already on it** → `POST /v1/events/send` with a custom event (`guideRequested` / `waitlistRequested`, in `src/lib/loops.ts`). Events fire every time. Any list they're _not_ yet on rides along in the same request, so the subscription and the trigger can't disagree — that's why there's no two-step and no race. Membership is only ever granted on confirmation, so nobody reaches this path unconfirmed.

`src/lib/loops-api.ts` is the API client (`findContact`, `sendEvent`). It needs **`LOOPS_API_KEY`** — a Worker secret (`npx wrangler secret put LOOPS_API_KEY`), and `.env.local` for dev. **Without the key the route behaves exactly as it did before**, so local dev and previews need no secrets; the re-send path simply doesn't run.

`guideRequested` carries `guide`, `guideTitle` and `pdfUrl` properties (read from the guide's own frontmatter), so **one** re-send workflow serves every lead magnet and adding a guide stays one `.mdx` file plus one row in `loops.ts`.

Setup this depends on, in the Loops dashboard:

1. Create the event properties `guide`, `guideTitle`, `pdfUrl` — the API won't invent them.
2. A workflow triggered by **Event received: `guideRequested`**, frequency **Every time**, whose email links `{{pdfUrl}}`. This is the re-send, so the copy can differ from the first delivery.
3. A workflow triggered by **Event received: `waitlistRequested`**, frequency **Every time**.
4. **No workflow is needed for `newsletterRequested`.** When someone already on the newsletter re-submits `/newsletter`, the event just carries any list they ticked but aren't on (the waitlist), and the route answers `already: true`; the form forwards that as `?already=1` and the thank-you page says "you're already on the list" instead of "check your inbox". Attach a workflow only if you ever want a repeat signup to receive the latest letter.
5. Leave the existing "Contact added to list" workflows alone — they still handle every first-time signup.

Check the **trigger frequency** on the existing list-triggered workflows too: set to "One time" they won't re-fire even on a genuine remove-and-re-add.

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

## Newsletter (`/newsletter`)

The letter is a **publication, not an offer** — the pages are shaped differently from the lead magnets on purpose. The writing is the pitch, so the newest issue is rendered in full on the front page.

- **Adding an issue is adding one `.mdx` file** — `src/content/letters/<slug>.mdx` with `title` (the subject line), `date`, `summary`, and the letter as the body, exactly as it went out. `---` in the body is a section break (a short terracotta rule). Nothing else to touch: the front page picks up the newest by date, the archive list appears once there are two, and the issue gets its own indexed page at `/newsletter/<slug>/` with `Article` JSON-LD.
- `src/lib/newsletter.ts` — the letter's **name, tagline and cadence** in one place (`NAME`, `TAGLINE`, `CADENCE`), plus `getLetters()` (newest first). Every page reads from here, so renaming the letter is a one-line edit.
- `src/pages/newsletter/index.astro` — read top to bottom it makes one argument, one section each: masthead (name, tagline, pitch, **inline form** with the waitlist box ticked by default) → drift (what a "fine" marriage quietly loses) → what you'll get (three kinds of letter as paragraphs, plus a candid note that the voice is still forming; deliberately not a formula) → **the shelf** (every letter as a paper card via `LetterCard`, newest featured with a "Latest" mark; clicking opens the full letter in `LetterModal`, one native `<dialog>` fed by per-letter `<template>`s, with a form after the sign-off; without JS the card is a plain link to the issue page) → who it's for → what readers say (`Testimonial` cards; **placeholder slots until real quotes land**, flagged `placeholder: true` which renders a visible tag) → who's writing (photo + two paragraphs + a link that opens the first letter) → four FAQ items (also `FAQPage` JSON-LD) → closing inline form. No bridge, no sticky bar.
- The photo is `public/newsletter/clark-and-carrie.jpg` (840×1050, 4:5) + `-small.jpg` (420w), cropped from the original with `sharp` (already a dependency). Swap both files to change it.
- `src/pages/newsletter/[slug].astro` — one issue, built to be found and shared. Title is `<title or seoTitle> — Brick by Brick`; description is frontmatter `description` else `summary`; the social card is frontmatter `ogImage`, else the **per-letter card baked at `public/og/letters/<slug>.png`** (if it exists), else the shared newsletter card. Emits `article:*` meta, the RSS `<link rel="alternate">`, and JSON-LD: `Article` (image, dates, wordCount, `isPartOf` the Periodical) with the `Organization` and `WebSite` nodes repeated inline so the publisher resolves on this page alone, plus a `BreadcrumbList`. Ends with a share row (copy link, email) and one form.
- The front page shows the newest **`SHELF_LIMIT` (5)** letters. **`/newsletter/archive/`** (`archive.astro`) is every letter as a reading list, grouped by year once they span more than one, with `CollectionPage`/`ItemList` JSON-LD and a closing form. It's linked wherever someone is already reading, once there's more than one letter: the front page shelf ("All N letters"), the reader modal's bar, the "More letters" block at the foot of every issue page, and the newsletter thank-you page under the latest letter. Deliberately **not** in the nav or footer, which carry the front page (the pitch). An issue page's back link goes to the front page until there are more letters than the shelf shows, then flips to the archive. (A letter file named `archive.mdx` would be shadowed by this route.)
- `src/pages/newsletter/rss.xml.ts` — hand-rolled RSS 2.0 (no dependency), newest first, summaries + links. Linked from the front page and every issue.
- Optional letter frontmatter for SEO: `description`, `seoTitle`, `ogImage`/`ogImageAlt`, `updated`. See the `letters` schema in `src/content.config.mjs`.
- `Layout.astro` has a `head` named slot (passed through `GuideLayout`) for page-specific head tags.
- `src/pages/newsletter/thank-you.astro` — `noindex`, handles `?w=1` like the guide one, and `?already=1` (already subscribed: "you're already on the list", no inbox instructions, and the waitlist acknowledgement drops its confirm-link line). Shows the newest letter either way.
- `src/components/guides/LetterArticle.astro` — dateline, title, and the reading-width body styles; the rendered MDX goes in the slot. `LetterCard.astro` is the sheet on the shelf; `LetterModal.astro` is the reader; `Testimonial.astro` is one reader's quote (reusable on the guide pages too). `GuideForm` grew an `inline` prop (email + button on one row from 640px) and a `newsletter` flag; `StickyBar` and `WaitlistAsk` are shared with the guide pages.
- The form posts `{ email, newsletter: true, waitlist }`; the list IDs live in `src/lib/loops.ts` (`NEWSLETTER_LIST`, `listsForNewsletter`).
- Social cards: the `newsletter` entry in `scripts/build-og.mjs` → `public/og/newsletter.png` for the front page; **`node scripts/build-og.mjs letters`** bakes one card per issue from its frontmatter into `public/og/letters/`. Run it after adding a letter — without it the issue falls back to the shared card, which still unfurls, just without the letter's title.

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

The tokens, typefaces, voice and the `src/elements/` + `src/components/troth/` library come from the Claude Design project **"Troth waitlist landing page"** and its design system. Pull design files with the `claude-design` MCP (`DesignSync` tool) — project id `e4995b13-c9e2-4e36-9183-0331506b3373`. The `.dc.html` component format (`<x-dc>`, `<x-import>`, `<sc-if>`, `{{ }}` bindings) and its React design-system bundle were translated into native Astro. The original phone-framed landing layout from that project is no longer used (see "Project" above); the current homepage is an editorial page built on the same system.

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

### Privacy claims

The architecture is Core Data + `NSPersistentCloudKitContainer`; couples are paired with a `CKShare`. So the data syncs through **the couple's own iCloud**, under Apple's encryption, and Troth runs no servers. Copy must be exactly true of that — one technical reader disproving "no cloud" costs more than any softer claim:

- **Say:** "in your own iCloud, never on our servers", "we can't read it", "no AI, no ads", "Troth has no servers of its own".
- **Don't say:** "no cloud", "never leaves your devices", "your phones hold the only keys", or "end-to-end encrypted" as a blanket claim. E2E is only true with **Advanced Data Protection** on (both spouses, for a shared room) — say so in that form.
- Be candid about what isn't done (no audit yet, no formal policy yet, no export yet). `/privacy` (`src/pages/privacy.astro`, "How Troth keeps it sealed") is the plain-English page every privacy mention links to; update its date when anything there changes.

## Style

- New sections get scoped `<style>` with `var(--token)` values and the `.g-*` vocabulary from `troth-guide.css`; never raw hex.
- `npx prettier --write .` before committing.
