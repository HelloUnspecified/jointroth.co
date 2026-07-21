// src/pages/api/subscribe.ts
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const email = data.email;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
      });
    }

    const env = locals.runtime?.env;
    const API_KEY = env?.BEEHIIV_API_KEY;
    const PUB_ID = env?.BEEHIIV_PUBLICATION_ID;

    // Call the Beehiiv API
    const beehiivResponse = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUB_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          email: email,
          reactivate_existing: false, // Set to true if you want to allow unsubscribed users to resubscribe
          send_welcome_email: true,
          utm_source: "astro-website", // Optional: helpful for tracking
        }),
      },
    );

    if (!beehiivResponse.ok) {
      const errorData = await beehiivResponse.json();
      throw new Error(errorData.message || "Failed to subscribe to Beehiiv");
    }

    return new Response(
      JSON.stringify({ message: "Successfully subscribed!" }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Subscription error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
