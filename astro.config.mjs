// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

// Astro 6+ runs `astro dev` inside the Cloudflare workerd runtime. That runtime
// crashes with "Missing field moduleType" as soon as a React island's
// fast-refresh wrapper is loaded (withastro/astro#16229) — dev-only; production
// builds are unaffected. We only need workerd for build/preview/deploy, so run
// local dev on Astro's Node dev server and enable the Cloudflare adapter for
// everything else.
const isDev =
  process.env.npm_lifecycle_event === "dev" || process.argv.includes("dev");

// https://astro.build/config
export default defineConfig({
  site: "https://jointroth.co",
  integrations: [mdx(), react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  output: "static",
  ...(isDev ? {} : { adapter: cloudflare({ imageService: "compile" }) }),
});
