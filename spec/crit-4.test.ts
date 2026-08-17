import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// crit-4 "An instrument": https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/04-instrument/
//
// Only the mechanically checkable lines of the spec live here. Judged-by-a-
// person lines (expressive, playable uninstructed, no way to play it wrong)
// aren't testable and are the crit's job, not this file's.

const DIST = resolve("dist");
const home = new JSDOM(readFileSync(join(DIST, "index.html"), "utf8")).window.document;

function jsBundleSource(): string {
  const assetsDir = join(DIST, "assets");
  if (!existsSync(assetsDir)) return "";
  return readdirSync(assetsDir)
    .filter((name) => name.endsWith(".js"))
    .map((name) => readFileSync(join(assetsDir, name), "utf8"))
    .join("\n");
}

describe("crit-4: an instrument", () => {
  it("makes sound live in the page, not by playing back a recording", () => {
    // "the browser is the instrument -- sound is made live in the page by the
    // player, not played back": a <audio>/<video> element with a static src
    // is playback, not synthesis, so its absence is what this can check.
    expect(home.querySelector("audio[src], video[src]")).toBeNull();
  });

  it("synthesizes sound with the Web Audio API", () => {
    expect(
      jsBundleSource(),
      "no AudioContext reference found in the built JS -- see spec/crit-4.test.ts",
    ).toMatch(/AudioContext/);
  });

  it("responds to more than one input modality", () => {
    // "playable with whatever is at hand -- mouse, keyboard or touch": not
    // proof the instrument is good, but a pointer-only or keyboard-only page
    // fails this line outright, so check both families of listener are wired.
    const source = jsBundleSource();
    const hasPointerInput = /pointerdown|mousedown|touchstart/.test(source);
    const hasKeyboardInput = /keydown|keyup/.test(source);
    expect(
      hasPointerInput && hasKeyboardInput,
      "expected listeners for both pointer/touch and keyboard input",
    ).toBe(true);
  });
});
