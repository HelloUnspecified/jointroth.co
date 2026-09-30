// src/pages/api/subscribe.ts
//
// Email capture. Two ways into Loops, chosen by whether the contact is already
// on the list that delivers what they just asked for:
//
//   Not on it — new, pending, or simply never subscribed
//     → the public Loops form endpoint (https://loops.so/docs/forms/custom-form).
//       This is the only Loops endpoint gated behind double opt-in, so new
//       contacts get the confirmation email, and the list subscription (plus the
//       "Contact added to list" workflow that delivers the goods) happens when
//       they confirm. Unchanged from how this has always worked.
//
//   Already on it
//     → POST /v1/events/send with a custom event. The list trigger fires on a
//       *change* in subscription state, so re-posting the form for someone
//       already subscribed is a silent no-op and they'd get nothing back. The
//       event fires every time. Any list they're not yet on rides along in the
//       same request, so the subscription and the trigger can't disagree.
//       The response carries `already: true` so the thank-you page can say
//       "you're already on the list" instead of "check your inbox" — for the
//       newsletter that's the whole story (no workflow needed); for a guide the
//       `guideRequested` workflow re-sends the PDF, so the inbox line holds.
//
// Nobody reaches the event path without having confirmed already — list
// membership is only granted on confirmation — so double opt-in still holds.
//
// Without LOOPS_API_KEY set, only the first path runs, which is exactly the old
// behaviour: local dev needs no secrets.
//
// Three shapes of request land here:
//   { email }                        → the product waitlist (landing + welcome)
//   { email, ref: "spouse" }         → the same waitlist, from the spouse invite
//                                      on /welcome; recorded under its own
//                                      Loops `source` so the invite can be told
//                                      apart from a signup they made themselves
//   { email, guide, waitlist }       → a /guides lead magnet, optionally also
//                                      joining the waitlist via its checkbox
//   { email, newsletter, waitlist }  → /newsletter, optionally also joining the
//                                      waitlist via its (pre-ticked) checkbox
//
// The client never sends mailing-list IDs; `guide` is a slug resolved against
// the server-side registry in src/lib/loops.ts, and `newsletter` is a flag.
import type { APIRoute } from "astro";
import { getEntry } from "astro:content";
import { env } from "cloudflare:workers";
import {
  EVENT_GUIDE,
  EVENT_NEWSLETTER,
  EVENT_WAITLIST,
  WAITLIST_LISTS,
  isGuideSlug,
  listsForGuide,
  listsForNewsletter,
} from "../../lib/loops";
import { findContact, sendEvent } from "../../lib/loops-api";

export const prerender = false;

const LOOPS_FORM_ENDPOINT =
  "https://app.loops.so/api/newsletter-form/cmrp99o22011o0jzln10zb8mm";

const LOOPS_SOURCE = "joinTroth.co";
const LOOPS_SOURCE_SPOUSE = "joinTroth.co/spouse";

const SITE = "https://jointroth.co";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** What this submission is asking for, in Loops terms. */
interface Plan {
  /** Every list the submission wants them on. */
  lists: string[];
  /**
   * The list(s) whose workflow delivers this particular ask. Already being on
   * all of them is what makes the event path the right one. Empty means there's
   * no list behind this ask, so only the form endpoint applies.
   */
  delivers: string[];
  source: string;
  eventName: string;
  eventProperties: Record<string, string>;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = (await request.json().catch(() => ({}))) as {
      email?: unknown;
      guide?: unknown;
      newsletter?: unknown;
      waitlist?: unknown;
      ref?: unknown;
    };
    const email = typeof data.email === "string" ? data.email.trim() : "";

    if (!email) {
      return json({ success: false, message: "Email is required" }, 400);
    }
    if (!EMAIL.test(email)) {
      return json({ success: false, message: "Enter a valid email" }, 400);
    }

    // A guide signup, a newsletter signup, or a plain waitlist signup?
    let plan: Plan;

    if (data.guide !== undefined) {
      if (!isGuideSlug(data.guide)) {
        return json({ success: false, message: "Unknown guide" }, 400);
      }
      const slug = data.guide;
      const resolved = listsForGuide(slug, data.waitlist === true);

      if (!resolved.configured) {
        console.warn(
          `No Loops list configured for guide "${slug}" — subscribing by source only. Add it to src/lib/loops.ts.`,
        );
      }

      // The guide's own frontmatter is the single source of truth for the
      // asset, so the one re-send workflow can link it without a second copy of
      // the path living in loops.ts.
      const entry = await getEntry("guides", slug);

      plan = {
        lists: resolved.mailingLists,
        delivers: resolved.listId ? [resolved.listId] : [],
        source: resolved.source,
        eventName: EVENT_GUIDE,
        eventProperties: {
          guide: slug,
          guideTitle: entry?.data.headline ?? slug,
          pdfUrl: entry?.data.pdf ? `${SITE}${entry.data.pdf}` : "",
        },
      };
    } else if (data.newsletter === true) {
      const resolved = listsForNewsletter(data.waitlist === true);

      plan = {
        lists: resolved.mailingLists,
        delivers: [resolved.listId],
        source: resolved.source,
        eventName: EVENT_NEWSLETTER,
        eventProperties: {},
      };
    } else {
      plan = {
        lists: WAITLIST_LISTS,
        delivers: WAITLIST_LISTS,
        source: data.ref === "spouse" ? LOOPS_SOURCE_SPOUSE : LOOPS_SOURCE,
        eventName: EVENT_WAITLIST,
        eventProperties: {},
      };
    }

    const apiKey = env.LOOPS_API_KEY;

    if (apiKey && plan.delivers.length > 0) {
      const contact = await findContact(apiKey, email);
      const on = (id: string) => contact?.mailingLists?.[id] === true;

      // `subscribed: false` means they opted out of the audience. Loops won't
      // send them marketing mail anyway, and we're not going to try to talk
      // them back in — let it fall through to the form endpoint, as before.
      if (contact && contact.subscribed !== false && plan.delivers.every(on)) {
        const missing = plan.lists.filter((id) => !on(id));

        const result = await sendEvent(apiKey, {
          email,
          eventName: plan.eventName,
          eventProperties: plan.eventProperties,
          ...(missing.length
            ? {
                mailingLists: Object.fromEntries(
                  missing.map((id) => [id, true as const]),
                ),
              }
            : {}),
        });

        if (!result.ok) {
          const status = result.status === 429 ? 429 : 502;
          return json(
            { success: false, message: "Subscription failed" },
            status,
          );
        }

        return json({ success: true, already: true }, 200);
      }
    }

    const body = new URLSearchParams({ email, source: plan.source });
    if (plan.lists.length) {
      body.set("mailingLists", plan.lists.join(","));
    }

    const loopsResponse = await fetch(LOOPS_FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const result = (await loopsResponse.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };

    if (!loopsResponse.ok || result.success === false) {
      const status = loopsResponse.status === 429 ? 429 : 502;
      return json(
        { success: false, message: result.message || "Subscription failed" },
        status,
      );
    }

    return json({ success: true }, 200);
  } catch (error) {
    console.error("Subscription error:", error);
    return json({ success: false, message: "Internal Server Error" }, 500);
  }
};
