// The header nav, in one place. The homepage, /pricing and /privacy pass it to
// GuideLayout; the guide, newsletter and thank-you pages deliberately don't, so
// each keeps its one form as the only way forward.
import { getLetters, letterUrl } from "./newsletter";

export interface NavLink {
  label: string;
  href: string;
}

/** The founding letter — "Story" in the nav, and the founders' link home. */
export async function getStoryUrl() {
  const letters = await getLetters();
  const story =
    letters.find((l) => l.id === "where-did-troth-come-from") ?? letters[0];
  return story ? letterUrl(story) : "/newsletter/";
}

export async function getSiteNav(): Promise<NavLink[]> {
  return [
    { label: "Story", href: await getStoryUrl() },
    { label: "Letters", href: "/newsletter/" },
    { label: "Exercises", href: "/guides/" },
    { label: "Pricing", href: "/pricing/" },
    { label: "Privacy", href: "/privacy/" },
  ];
}
