import { describe, expect, it } from "vitest";
import { buildLinkinatorArgs } from "./check-links.ts";

describe("buildLinkinatorArgs", () => {
  it("rewrites the base prefix away so a flat dist/ resolves absolute hrefs correctly", () => {
    const args = buildLinkinatorArgs("/comp4020-crit4-u8179499");
    expect(args).toContain("--url-rewrite-search");
    expect(args[args.indexOf("--url-rewrite-search") + 1]).toBe("/comp4020-crit4-u8179499/");
    expect(args).toContain("--url-rewrite-replace");
    expect(args[args.indexOf("--url-rewrite-replace") + 1]).toBe("/");
  });

  it("still validates same-page fragments, not just file paths", () => {
    expect(buildLinkinatorArgs("/comp4020-crit4-u8179499")).toContain("--check-fragments");
  });

  it("refuses to build a check that would silently scan without a base prefix", () => {
    expect(() => buildLinkinatorArgs(undefined)).toThrow();
  });
});
