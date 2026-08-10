// Loops mailing-list configuration — server-side only.
//
// The browser never names a mailing list. It sends a guide *slug*; this file is
// the only place that maps a slug to Loops list IDs. Adding a new lead magnet
// means adding one entry here alongside the .mdx file in src/content/guides/.

/** Everyone who joins the product waitlist lands on both of these. */
export const WAITLIST_LISTS = [
  "cmrpalrap06m50ju5bz1a73sb",
  "cmrpammmt08z30jzj0rl7cz2g",
];

export interface GuideList {
  /** Loops mailing list ID for this lead magnet. */
  listId: string;
  /** Optional override for the Loops `source` field. */
  source?: string;
}

/**
 * Guide slug (the .mdx filename) → its Loops list.
 *
 * A slug that isn't listed here still captures the email, tagged with its
 * source, but joins no list — so a new guide page can never silently drop a
 * signup because someone forgot to add a row.
 */
export const GUIDE_LISTS: Record<string, GuideList> = {
  "were-building": { listId: "cmsnna9pw00a00j0b84ixcz43" },
};

/** Slug shape we're willing to echo into Loops as a source string. */
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

export function isGuideSlug(value: unknown): value is string {
  return typeof value === "string" && SLUG.test(value);
}

/**
 * Lists a guide signup should join, plus the Loops `source` to record.
 * `waitlist` reflects the "add me to the waitlist" checkbox.
 */
export function listsForGuide(slug: string, waitlist: boolean) {
  const guide = GUIDE_LISTS[slug];
  const lists = new Set<string>();

  if (guide?.listId) lists.add(guide.listId);
  if (waitlist) WAITLIST_LISTS.forEach((id) => lists.add(id));

  return {
    mailingLists: Array.from(lists),
    source: guide?.source ?? `joinTroth.co/guides/${slug}`,
    configured: Boolean(guide?.listId),
  };
}
