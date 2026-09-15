/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Worker bindings. Read them in server routes with:
//   import { env } from "cloudflare:workers";
// (`Astro.locals.runtime` is deprecated in the Astro 7 Cloudflare adapter.)
//
// LOOPS_API_KEY is a Cloudflare secret (`npx wrangler secret put LOOPS_API_KEY`);
// locally it comes from .env.local, which the Cloudflare vite plugin loads as
// dev secrets. Optional on purpose — without it /api/subscribe falls back to the
// public Loops form endpoint, which needs no credentials.
interface Env {
  LOOPS_API_KEY?: string;
}

// Minimal stand-in for @cloudflare/workers-types, which this project doesn't
// install. The module is provided by the workerd runtime in dev and in prod.
declare module "cloudflare:workers" {
  export const env: Env;
}
