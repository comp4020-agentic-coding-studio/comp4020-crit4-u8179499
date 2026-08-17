// Pure pitch/timbre mapping for the gesture instrument -- no DOM, no
// AudioContext, so this is tested directly (see scale.test.ts).

export const ROOT_FREQUENCY = 55; // A1 -- low enough to add two extra octaves
// of scale degrees below the previous root (220) without moving the previous
// top note at all, so the previously-tuned high end is untouched.
// Major pentatonic intervals (semitones from the root): every degree is
// consonant against every other, so an exploratory gesture can't land on a
// dissonant interval.
export const PENTATONIC_SEMITONES = [0, 2, 4, 7, 9];
export const OCTAVE_SPAN = 5;

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

const CUTOFF_FLOOR_HZ = 50;
const CUTOFF_CEILING_HZ = 16000;

// Logarithmic mapping so equal steps in gesture position feel like equal
// steps in perceived brightness (frequency perception is logarithmic) --
// scaled by the note's own frequency rather than a fixed absolute Hz range.
// A fixed absolute range makes "brightness" mean something different for a
// low note than a high note (a cutoff that opens up a bass note can already
// sit below a treble note's fundamental), which compresses the audibly
// useful part of a vertical drag into a narrow band. Tying the range to the
// note's own frequency keeps the same sweep meaningful wherever you're
// playing horizontally.
export function filterCutoffForFraction(
  fraction: number,
  frequency: number,
  minRatio: number = 0.6,
  maxRatio: number = 9,
): number {
  const clamped = clamp01(fraction);
  const ratio = minRatio * (maxRatio / minRatio) ** clamped;
  const hz = frequency * ratio;
  return Math.min(Math.max(hz, CUTOFF_FLOOR_HZ), CUTOFF_CEILING_HZ);
}

// A row of home-adjacent keys, left to right, so the keyboard reads like a
// small keyboard-instrument -- no pointer required to play a scale.
export const NOTE_KEYS = ["a", "s", "d", "f", "g", "h", "j", "k", "l"] as const;

// Spreads the key row evenly across the full note range rather than mapping
// key position directly to note index: with more notes than keys, a direct
// mapping would strand every note past the ninth key unreachable from the
// keyboard.
export function noteIndexForKey(key: string, noteCount: number): number | null {
  const keyIndex = NOTE_KEYS.indexOf(key.toLowerCase() as (typeof NOTE_KEYS)[number]);
  if (keyIndex === -1) return null;
  if (noteCount <= 1) return 0;
  const fraction = keyIndex / (NOTE_KEYS.length - 1);
  return noteIndexForFraction(fraction, noteCount);
}
