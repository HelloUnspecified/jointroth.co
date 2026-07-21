// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://joinrehuman.com",
  integrations: [mdx(), react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  output: "static",
  adapter: cloudflare({ imageService: "compile" }),
});
