// /newsletter/rss.xml — the letter as a feed, newest first. Hand-rolled so it
// needs no extra dependency (and no lockfile dance). Each item links to the
// issue's own page; the description is the summary, not the full letter.
import type { APIRoute } from "astro";
import {
  NAME,
  SITE_URL,
  TAGLINE,
  getLetters,
  letterUrl,
} from "../../lib/newsletter";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const GET: APIRoute = async () => {
  const letters = await getLetters();
  const feedUrl = `${SITE_URL}/newsletter/rss.xml`;
  const lastBuild = (letters[0]?.data.date ?? new Date()).toUTCString();

  const items = letters
    .map((letter) => {
      const url = `${SITE_URL}${letterUrl(letter)}`;
      return `    <item>
      <title>${esc(letter.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${letter.data.date.toUTCString()}</pubDate>
      <description>${esc(letter.data.summary)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(NAME)}</title>
    <link>${SITE_URL}/newsletter/</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>${esc(TAGLINE)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <image>
      <url>${SITE_URL}/favicon.png</url>
      <title>${esc(NAME)}</title>
      <link>${SITE_URL}/newsletter/</link>
    </image>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
