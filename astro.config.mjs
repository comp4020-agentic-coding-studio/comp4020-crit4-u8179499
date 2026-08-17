import { defineConfig } from "astro/config";

// Deployed under the org's Pages domain at the repo's path, so every
// generated asset/link URL needs that path prefixed. Get this wrong and the
// site 404s on every asset while looking fine in `astro dev`.
export default defineConfig({
  site: "https://comp4020-agentic-coding-studio.github.io",
  base: "/comp4020-crit4-u8179499",
  // Flat page.html output (not page/index.html), so every page sits beside
  // index.html in dist/ and nav links between them are plain relative
  // filenames -- correct at any base path without rewriting them.
  build: { format: "file" },
});
