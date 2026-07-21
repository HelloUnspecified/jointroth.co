# CLAUDE.md

## Project

Astro 5.x marketing site for re/Human (Unspecified Software Co.) with React interactive components, Tailwind CSS, and MDX content.

## Commands

- `npm run dev` — dev server on localhost:4321
- `npm run build` — production build to ./dist/
- `npx prettier --write .` — format all files
- `npm run astro -- check` — check for errors

## Key Patterns

- Astro components (.astro) for static content, React (.jsx) for interactive elements
- Content managed via MDX files in /src/content with frontmatter
- Astro 5 Content Layer API for fetching content (not the deprecated getEntryBySlug)
- Form submissions use web3forms.com API
- Animations use gsap library

## Style

- Use Tailwind classes for styling
- Follow existing component organization patterns

## Design System

### Brand Color Tokens (defined in `src/css/tailwind.css`)

All brand colors use the `rh-` prefix. **Never use raw hex values** — always use these tokens:

| Token              | Hex       | Usage                                    |
|--------------------|-----------|------------------------------------------|
| `rh-ember`         | `#ff5733` | Primary accent, CTAs, highlights         |
| `rh-ink`           | `#121212` | Dark backgrounds, light-mode text        |
| `rh-chalk`         | `#ebe9e4` | Light backgrounds, dark-mode text        |
| `rh-warm-light`    | `#f9f8f6` | Light section backgrounds                |
| `rh-warm-dark`     | `#1a1918` | Dark section backgrounds                 |
| `rh-terracotta`    | `#e07856` | Secondary warm accent                    |

Most sections use `bg-rh-warm-light dark:bg-rh-warm-dark` with text `text-rh-ink dark:text-rh-chalk`. The site defaults to dark mode (`<html class="dark">`).

### Fonts

| Token       | Font           | Usage          |
|-------------|----------------|----------------|
| `font-body` | Inter          | Body copy      |
| `font-heading` | Inter Tight | Headings       |
| `font-mono` | JetBrains Mono | Labels, code   |

### Reusable Elements (`src/elements/`)

Always use these elements instead of writing raw markup for these patterns:

**`SectionLabel`** — Terminal-style mono label (e.g. `> SYS.CORE // ONLINE`)
```astro
import SectionLabel from "../elements/SectionLabel.astro";
<SectionLabel text="> SYS.MODULE // LABEL" />
<SectionLabel text="> SYS.MODULE // LABEL" centered />
<SectionLabel text="> SYS.MODULE // LABEL" dot />
```
Props: `text` (string), `centered` (bool), `dot` (bool, adds pulsing ember dot), `class` (string)

**`Heading`** — Section heading with size presets
```astro
import Heading from "../elements/Heading.astro";
<Heading size="xl" as="h1">Hero Text</Heading>
<Heading>Default h2/lg</Heading>
<Heading size="md">Smaller heading</Heading>
<Heading size="sm">Card heading</Heading>
```
Props: `as` ("h1"|"h2"|"h3", default "h2"), `size` ("xl"|"lg"|"md"|"sm", default "lg"), `centered` (bool), `class` (string). Sizes: xl = hero, lg = section, md = subsection, sm = card.

**`BodyText`** — Standard paragraph
```astro
import BodyText from "../elements/BodyText.astro";
<BodyText>Paragraph content here.</BodyText>
<BodyText class="mb-6">With spacing.</BodyText>
```
Props: `class` (string). Renders as `<p>` with `text-lg md:text-xl text-rh-ink/70 dark:text-rh-chalk/70 leading-relaxed`.

**`CTAButton`** — Call-to-action link
```astro
import CTAButton from "../elements/CTAButton.astro";
<CTAButton href="/apply">Apply Now</CTAButton>
<CTAButton href="/book" variant="contrast">Read More →</CTAButton>
```
Props: `href` (string), `variant` ("solid"|"contrast", default "solid"), `class` (string). Solid = ember bg, rounded-full. Contrast = ink/chalk flip, rounded-xl.

### Dark-only Sections

Some sections (e.g. Manifesto) are always dark regardless of mode. When using elements in these sections, override light-mode colors with `!text-rh-chalk/50` etc.
