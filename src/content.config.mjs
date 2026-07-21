import { defineCollection } from "astro:content";

const collections = {
  index: defineCollection({ type: "content" }),
  apply: defineCollection({ type: "content" }),
  pages: defineCollection({ type: "content" }),
};

export { collections };
