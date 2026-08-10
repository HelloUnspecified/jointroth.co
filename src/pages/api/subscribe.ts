// src/pages/api/subscribe.ts
//
// Email capture — proxies to a Loops custom form
// (https://loops.so/docs/forms/custom-form). The Loops newsletter-form endpoint
// is public (no API key), so this works in every environment, including local
// dev. We forward JSON as application/x-www-form-urlencoded.
//
// Two shapes of request land here:
//   { email }                      → the product waitlist (landing + welcome)
//   { email, guide, waitlist }     → a /guides lead magnet, optionally also
//                                    joining the waitlist via its checkbox
//
// The client never sends mailing-list IDs; `guide` is a slug resolved against
// the server-side registry in src/lib/loops.ts.
import type { APIRoute } from "astro";
import { WAITLIST_LISTS, isGuideSlug, listsForGuide } from "../../lib/loops";

export const prerender = false;

const LOOPS_FORM_ENDPOINT =
  "https://app.loops.so/api/newsletter-form/cmrp99o22011o0jzln10zb8mm";

const LOOPS_SOURCE = "joinTroth.co";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = (await request.json().catch(() => ({}))) as {
      email?: unknown;
      guide?: unknown;
      waitlist?: unknown;
    };
    const email = typeof data.email === "string" ? data.email.trim() : "";

    if (!email) {
      return json({ success: false, message: "Email is required" }, 400);
    }
    if (!EMAIL.test(email)) {
      return json({ success: false, message: "Enter a valid email" }, 400);
    }

    // A guide signup, or a plain waitlist signup?
    let mailingLists: string[];
    let source: string;

    if (data.guide !== undefined) {
      if (!isGuideSlug(data.guide)) {
        return json({ success: false, message: "Unknown guide" }, 400);
      }
      const resolved = listsForGuide(data.guide, data.waitlist === true);
      mailingLists = resolved.mailingLists;
      source = resolved.source;
      if (!resolved.configured) {
        console.warn(
          `No Loops list configured for guide "${data.guide}" — subscribing by source only. Add it to src/lib/loops.ts.`,
        );
      }
    } else {
      mailingLists = WAITLIST_LISTS;
      source = LOOPS_SOURCE;
    }

    const body = new URLSearchParams({ email, source });
    if (mailingLists.length) {
      body.set("mailingLists", mailingLists.join(","));
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
