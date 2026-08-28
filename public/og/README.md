# Social cards

Generated — **don't hand-edit these PNGs.** They're rendered by

    node scripts/build-og.mjs          # all cards
    node scripts/build-og.mjs default  # just one

from the `CARDS` map at the top of that script, laid out in headless Chrome with
the real design tokens and the real self-hosted webfonts.

Every card is 1200×630 (1.91:1). `SEO.astro` advertises those exact dimensions
in `og:image:width`/`og:image:height`, so a replacement must match.

- `default.png` — the site-wide fallback, used by any page without its own card.
- `<guide-slug>.png` — a guide's card. Point at it from the guide's frontmatter
  with `ogImage: "/og/<slug>.png"` and `ogImageAlt: "..."`.

After changing a card, re-scrape it — the platforms cache aggressively:
Facebook Sharing Debugger, X Card Validator, LinkedIn Post Inspector.
