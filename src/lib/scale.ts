// Pure pitch/timbre mapping for the gesture instrument -- no DOM, no
// AudioContext, so this is tested directly (see scale.test.ts).

export const ROOT_FREQUENCY = 220; // A3
// Major pentatonic intervals (semitones from the root): every degree is
// consonant against every other, so an exploratory gesture can't land on a
// dissonant interval.
export const PENTATONIC_SEMITONES = [0, 2, 4, 7, 9];
export const OCTAVE_SPAN = 3;

export function buildScaleFrequencies(
  root: number = ROOT_FREQUENCY,
  semitoneSteps: readonly number[] = PENTATONIC_SEMITONES,
  octaves: number = OCTAVE_SPAN,
): number[] {
  const frequencies: number[] = [];
  for (let octave = 0; octave < octaves; octave++) {
    for (const semitone of semitoneSteps) {
      frequencies.push(root * 2 ** (octave + semitone / 12));
    }
  }
  return frequencies;
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

// Quantizes a horizontal position to the nearest scale degree rather than
// sliding continuously, so exploratory drags land on notes, not glissandi.
export function noteIndexForFraction(fraction: number, noteCount: number): number {
  const clamped = clamp01(fraction);
  return Math.min(noteCount - 1, Math.floor(clamped * noteCount));
}

export function frequencyForFraction(fraction: number, frequencies: readonly number[]): number {
  return frequencies[noteIndexForFraction(fraction, frequencies.length)];
}

// Logarithmic mapping so equal steps in gesture position feel like equal
// steps in perceived brightness (frequency perception is logarithmic).
export function filterCutoffForFraction(
  fraction: number,
  minHz: number = 200,
  maxHz: number = 6000,
): number {
  const clamped = clamp01(fraction);
  return minHz * (maxHz / minHz) ** clamped;
}

// A row of home-adjacent keys, left to right, so the keyboard reads like a
// small keyboard-instrument -- no pointer required to play a scale.
export const NOTE_KEYS = ["a", "s", "d", "f", "g", "h", "j", "k", "l"] as const;

export function noteIndexForKey(key: string, noteCount: number): number | null {
  const index = NOTE_KEYS.indexOf(key.toLowerCase() as (typeof NOTE_KEYS)[number]);
  if (index === -1) return null;
  return Math.min(index, noteCount - 1);
}
