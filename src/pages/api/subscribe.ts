// src/pages/api/subscribe.ts
//
// Waitlist signup — proxies to a Loops custom form
// (https://loops.so/docs/forms/custom-form). The landing and confirmation
// forms POST JSON `{ email }` here; we forward it to Loops as
// application/x-www-form-urlencoded. The Loops newsletter-form endpoint is
// public (no API key), so this works in every environment, including local dev.
import type { APIRoute } from "astro";

export const prerender = false;

const LOOPS_FORM_ENDPOINT =
  "https://app.loops.so/api/newsletter-form/cmrp99o22011o0jzln10zb8mm";

// Every waitlist signup joins both mailing lists (comma-separated per Loops).
const LOOPS_MAILING_LISTS = [
  "cmrpalrap06m50ju5bz1a73sb",
  "cmrpammmt08z30jzj0rl7cz2g",
].join(",");

const LOOPS_SOURCE = "joinTroth.co";

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
    };
    const email = typeof data.email === "string" ? data.email.trim() : "";

    if (!email) {
      return json({ success: false, message: "Email is required" }, 400);
    }

    const body = new URLSearchParams({
      email,
      mailingLists: LOOPS_MAILING_LISTS,
      source: LOOPS_SOURCE,
    });

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
