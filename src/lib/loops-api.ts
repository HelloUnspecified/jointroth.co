// Loops REST API client — server-side only, needs LOOPS_API_KEY.
//
// The public form endpoint (see src/pages/api/subscribe.ts) stays the default
// way in, because it is the only Loops endpoint gated behind double opt-in.
// This client covers the one thing that endpoint cannot do: re-deliver to a
// contact who is *already* on the mailing list.
//
// Why that's needed: the "Contact added to list" workflow trigger fires on a
// change in subscription state, not on a form submission. Re-posting the form
// for someone already subscribed is a silent no-op, so they get nothing back.
// A custom event fires every time — and POST /v1/events/send carries mailing
// list subscriptions in the same request, so the event and the membership can
// never disagree.
//
// Docs: https://loops.so/docs/api-reference/find-contact
//       https://loops.so/docs/api-reference/send-event

const API = "https://app.loops.so/api/v1";

export interface LoopsContact {
  id: string;
  email: string;
  /** False once they've opted out of the audience. Never email these people. */
  subscribed: boolean;
  /** Only lists they *are* on appear here, each mapped to true. */
  mailingLists?: Record<string, boolean>;
  /** null unless the contact was created through a form with double opt-in on. */
  optInStatus?: "accepted" | "pending" | "rejected" | null;
}

function headers(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

/**
 * The contact, or null if Loops doesn't know this address.
 *
 * Also null when the lookup itself fails — a dead API key or a blip should
 * degrade to the form endpoint, not lose the signup.
 */
export async function findContact(
  apiKey: string,
  email: string,
): Promise<LoopsContact | null> {
  try {
    const res = await fetch(
      `${API}/contacts/find?email=${encodeURIComponent(email)}`,
      { headers: headers(apiKey) },
    );

    if (!res.ok) {
      console.warn(
        `Loops contact lookup failed (${res.status}) — falling back to the form endpoint.`,
      );
      return null;
    }

    const found = (await res.json()) as LoopsContact[];
    return Array.isArray(found) && found.length > 0 ? found[0] : null;
  } catch (error) {
    console.warn(
      "Loops contact lookup errored — falling back to the form endpoint.",
      error,
    );
    return null;
  }
}

export interface LoopsEvent {
  email: string;
  eventName: string;
  /** Available as variables in the emails this event sends. */
  eventProperties?: Record<string, string | number | boolean>;
  /** Lists to join in the same request — `{ id: true }`, atomic with the event. */
  mailingLists?: Record<string, true>;
}

/**
 * Fire a custom event. Resolves to the HTTP status so the caller can map a
 * Loops rate limit (429) onto its own response.
 */
export async function sendEvent(
  apiKey: string,
  event: LoopsEvent,
): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(`${API}/events/send`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(
      `Loops event "${event.eventName}" failed (${res.status})`,
      detail,
    );
  }

  return { ok: res.ok, status: res.status };
}
