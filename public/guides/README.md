# Lead-magnet assets

Drop each guide's PDF (and any photos it uses) in this folder. Everything here
is served from the site root, so `public/guides/were-building.pdf` is live at
`https://jointroth.co/guides/were-building.pdf`.

Two rules:

1. **The filename must match the `pdf:` field** in the guide's frontmatter
   (`src/content/guides/<slug>.mdx`). That value is the URL to paste into the
   Loops confirmation email.
2. **Don't link the PDF from the site.** The asset only travels through the
   confirmation email — that's what makes the double opt-in mean something.

Photos go in a subfolder named for the guide, e.g.
`public/guides/were-building/kitchen-table.jpg`, and get wired up through the
`image:` block in the same frontmatter.

This README is excluded from the deployed assets via `public/.assetsignore`.
