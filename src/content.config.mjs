// Content collections.
//
// `guides` — lead-magnet landing pages under /guides/<slug>. Each guide is one
// .mdx file whose frontmatter drives the whole page (hero, problem line, steps,
// founder note, bridge, thank-you copy); the MDX body is optional extra prose
// rendered between the steps and the founder note. Adding a guide = adding one
// file. See src/content/guides/were-building.mdx for the canonical example, and
// src/lib/loops.ts for the mailing list each guide subscribes to.
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const guides = defineCollection({
  loader: glob({ base: "./src/content/guides", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    /* ---- Meta / SEO ---- */
    title: z.string(), // browser + OG title
    description: z.string(), // meta description
    // Social card. Bake one with `node scripts/build-og.mjs` and point here;
    // omit and the guide falls back to the site-wide card.
    ogImage: z.string().optional(),
    ogImageAlt: z.string().optional(),
    draft: z.boolean().default(false), // draft guides are not built
    order: z.number().default(0), // ordering on the /guides index

    /* ---- Hero ---- */
    eyebrow: z.string().default("A free exercise for two"),
    // The headline may contain `___` (3+ underscores) — it renders as a ruled
    // blank you could write on, which is the whole point of this exercise.
    headline: z.string(),
    subhead: z.string(),
    // Short reassurance shown under the hero form, e.g. format + time cost.
    facts: z.array(z.string()).default([]),

    /* ---- The problem this guide answers ---- */
    problem: z.string().optional(),

    /* ---- What's inside ---- */
    inside: z
      .object({
        eyebrow: z.string().default("What's inside"),
        heading: z.string().optional(),
        steps: z
          .array(
            z.object({
              title: z.string(),
              body: z.string().optional(),
            }),
          )
          .default([]),
      })
      .optional(),

    /* ---- A paper mock of the thing they're getting ---- */
    preview: z
      .object({
        label: z.string().default("The exercise"),
        prompt: z.string(), // the sentence with the blank
        answers: z
          .array(
            z.object({
              text: z.string(),
              starred: z.boolean().default(false),
            }),
          )
          .default([]),
        blanks: z.number().default(2), // empty ruled lines after the answers
      })
      .optional(),

    /* ---- The offer ---- */
    form: z
      .object({
        heading: z.string().default("Get the exercise"),
        cta: z.string().default("Send it to me"),
        microcopy: z.string().optional(),
        // Short enough for the phone sticky bar — falls back to the eyebrow.
        stickyLabel: z.string().optional(),
        placeholder: z.string().default("Your email"),
        waitlistLabel: z.string().default("Also add me to the Troth waitlist."),
        // Opted in by default — unticking only drops the waitlist list IDs
        // from the Loops POST; the guide signup itself is unaffected.
        waitlistDefault: z.boolean().default(true),
        privacy: z
          .string()
          .default("We'll never share your address. Unsubscribe anytime."),
      })
      .default({}),

    /* ---- Trust block ---- */
    founder: z
      .object({
        eyebrow: z.string().default("A note from Clark"),
        note: z.string(),
        signature: z.string(),
      })
      .optional(),

    /* ---- Optional photo (drop the file in public/guides/) ---- */
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
        caption: z.string().optional(),
      })
      .optional(),

    /* ---- Closing bridge to the product (dark band) ---- */
    bridge: z
      .object({
        eyebrow: z.string().default("There's more"),
        heading: z.string().optional(),
        body: z.string(),
        cta: z
          .object({
            label: z.string(),
            href: z.string().default("/"),
          })
          .optional(),
      })
      .optional(),

    /* ---- The asset itself. Lives in public/, linked from the Loops email
           once they confirm. Never linked from the site (double opt-in). ---- */
    pdf: z.string().optional(),

    /* ---- Confirmation page: /guides/<slug>/thank-you ---- */
    thanks: z
      .object({
        eyebrow: z.string().default("One more step"),
        heading: z.string().default("Check your inbox."),
        body: z
          .string()
          .default(
            "I just sent you an email. Open it and click the confirm link — that is the only way I will send you anything, and it keeps this list clean.",
          ),
        steps: z.array(z.string()).default([]),
        note: z.string().optional(),
        waitlistHeading: z
          .string()
          .default("While you're here — the two of you, and Troth."),
        waitlistBody: z.string().optional(),
        waitlistCta: z.string().default("Join the waitlist"),
      })
      .default({}),
  }),
});

const collections = { guides };

export { collections };
