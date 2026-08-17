#!/usr/bin/env node
// GitHub Pages serves this site at astro.config.mjs's `base`, but the build
// emits every asset flat into dist/ (see `build.format: "file"` there). A
// plain `linkinator ./dist` scan has no base subfolder on disk to find, so
// it treats every base-prefixed absolute href (e.g. "/comp4020-ass1-.../
// global.css") as a 404 -- a false failure that has nothing to do with
// whether the deployed site's links actually resolve. Rewriting the base
// prefix away before linkinator resolves paths makes the local/CI scan match
// what Pages actually serves, without touching the hrefs themselves (the
// deployed URLs still need that prefix) or skipping/suppressing any real
// broken-link check.
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import astroConfig from "../astro.config.mjs";

export function buildLinkinatorArgs(base: string | undefined): string[] {
  if (!base) throw new Error("astro.config.mjs must set `base`");
  return [
    "dlx",
    "linkinator",
    "./dist",
    "--silent",
    "--check-fragments",
    "--url-rewrite-search",
    `${base}/`,
    "--url-rewrite-replace",
    "/",
  ];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = spawnSync("pnpm", buildLinkinatorArgs(astroConfig.base), { stdio: "inherit" });
  process.exit(result.status ?? 1);
}
