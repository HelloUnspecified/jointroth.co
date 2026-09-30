// The newsletter's identity, in one place. Every page that mentions the letter
// reads from here, so renaming it or changing the cadence is a one-line edit.
import { getCollection, type CollectionEntry } from "astro:content";

/** The masthead. */
export const NAME = "Brick by Brick";

/** One line under the masthead — what it is and who writes it. */
export const TAGLINE =
  "Letters on building a marriage on purpose, from Clark and Carrie Sell.";

/** How often it goes out, as it should read in a sentence. */
export const CADENCE = "every other week";

export const SITE_URL = "https://jointroth.co";

/** How many letters the front page shows (the featured one included). */
export const SHELF_LIMIT = 5;

/**
 * Every letter, in order. Linked from the front page shelf, the reader modal,
 * the issue pages and the newsletter thank-you page once there's more than one
 * letter; the issue page's back link points here once the shelf overflows.
 */
export const ARCHIVE_URL = "/newsletter/archive/";

/** Published issues, newest first. */
export async function getLetters() {
  const letters = await getCollection("letters", ({ data }) => !data.draft);
  return letters.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export type Letter = CollectionEntry<"letters">;

export const letterUrl = (letter: Letter) => `/newsletter/${letter.id}/`;

/** ISO date (YYYY-MM-DD) for datetime attributes and structured data. */
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/** The meta/social description: frontmatter `description`, else the summary. */
export const letterDescription = (letter: Letter) =>
  letter.data.description ?? letter.data.summary;

/**
 * The per-letter cards that `node scripts/build-og.mjs letters` has baked.
 * Resolved by Vite at build time (the glob is never imported, only listed), so
 * this works wherever the pages render — no filesystem access at runtime.
 */
const BAKED_CARDS = new Set(
  Object.keys(import.meta.glob("/public/og/letters/*.png")).map((k) =>
    k.replace(/^\/public/, ""),
  ),
);

/**
 * The letter's social card. Frontmatter wins; otherwise the baked per-letter
 * card if it exists; else the newsletter's shared card, so a link never
 * unfurls without an image.
 */
export function letterOgImage(letter: Letter) {
  if (letter.data.ogImage) return letter.data.ogImage;
  const baked = `/og/letters/${letter.id}.png`;
  return BAKED_CARDS.has(baked) ? baked : "/og/newsletter.png";
}

export const letterOgAlt = (letter: Letter) =>
  letter.data.ogImageAlt ??
  `${letter.data.title} — ${NAME}, a letter from Clark and Carrie Sell.`;

/** Rough word count of the MDX body, for the Article structured data. */
export const wordCount = (body: string | undefined) =>
  (body ?? "")
    .replace(/^---[\s\S]*?---/, "")
    .replace(/[#*_>`\[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
