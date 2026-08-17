import { describe, expect, it } from "vitest";
import {
  buildScaleFrequencies,
  filterCutoffForFraction,
  frequencyForFraction,
  noteIndexForKey,
  NOTE_KEYS,
  OCTAVE_SPAN,
  PENTATONIC_SEMITONES,
} from "./scale";

describe("buildScaleFrequencies", () => {
  it("builds one frequency per pentatonic degree per octave", () => {
    const frequencies = buildScaleFrequencies();
    expect(frequencies).toHaveLength(PENTATONIC_SEMITONES.length * OCTAVE_SPAN);
  });

  it("is strictly increasing, low to high", () => {
    const frequencies = buildScaleFrequencies();
    for (let i = 1; i < frequencies.length; i++) {
      expect(frequencies[i]).toBeGreaterThan(frequencies[i - 1]);
    }
  });

  it("doubles the root frequency exactly one octave up", () => {
    const frequencies = buildScaleFrequencies(220);
    expect(frequencies[PENTATONIC_SEMITONES.length]).toBeCloseTo(440, 5);
  });
});

describe("frequencyForFraction", () => {
  const frequencies = buildScaleFrequencies();

  it("quantizes to a note in the scale, not a continuous glissando", () => {
    expect(frequencies).toContain(frequencyForFraction(0.37, frequencies));
  });

  it("maps fraction 0 to the lowest note and fraction 1 to the highest", () => {
    expect(frequencyForFraction(0, frequencies)).toBe(frequencies[0]);
    expect(frequencyForFraction(1, frequencies)).toBe(frequencies.at(-1));
  });

  it("clamps out-of-range fractions instead of throwing", () => {
    expect(frequencyForFraction(-0.5, frequencies)).toBe(frequencies[0]);
    expect(frequencyForFraction(1.5, frequencies)).toBe(frequencies.at(-1));
  });
});

describe("filterCutoffForFraction", () => {
  it("scales with the note's own frequency, not a fixed absolute range", () => {
    expect(filterCutoffForFraction(0, 440, 0.5, 8)).toBeCloseTo(220, 5);
    expect(filterCutoffForFraction(1, 440, 0.5, 8)).toBeCloseTo(3520, 5);
  });

  it("is monotonically increasing with fraction", () => {
    expect(filterCutoffForFraction(0.75, 440)).toBeGreaterThan(filterCutoffForFraction(0.25, 440));
  });

  it("stays within sane absolute bounds for very low or very high notes", () => {
    expect(filterCutoffForFraction(0, 40)).toBeGreaterThanOrEqual(50);
    expect(filterCutoffForFraction(1, 20000)).toBeLessThanOrEqual(16000);
  });
});

describe("noteIndexForKey", () => {
  it("maps a mapped key to its position in the row", () => {
    expect(noteIndexForKey("a", NOTE_KEYS.length)).toBe(0);
    expect(noteIndexForKey("D", NOTE_KEYS.length)).toBe(2);
  });

  it("returns null for a key that isn't part of the instrument", () => {
    expect(noteIndexForKey("q", NOTE_KEYS.length)).toBeNull();
    expect(noteIndexForKey("Enter", NOTE_KEYS.length)).toBeNull();
  });

  it("clamps to the available note count if there are fewer notes than keys", () => {
    expect(noteIndexForKey("l", 3)).toBe(2);
  });

  it("spreads the key row across the full note range when there are more notes than keys", () => {
    expect(noteIndexForKey("l", 25)).toBe(24);
    expect(noteIndexForKey("a", 25)).toBe(0);
  });
});
