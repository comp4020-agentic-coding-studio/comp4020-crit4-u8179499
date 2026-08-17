// Wires pointer, touch and keyboard input to the synth and the visual glow.
// Kept as a single wiring module rather than tested: the math it calls
// (scale.ts) is tested directly, and this file is the DOM/AudioContext glue
// around it.
import { GestureSynth } from "../lib/synth";
import {
  buildScaleFrequencies,
  filterCutoffForFraction,
  noteIndexForFraction,
  noteIndexForKey,
} from "../lib/scale";

const surface = document.querySelector<HTMLElement>('[data-testid="surface"]');
const hint = document.querySelector<HTMLElement>('[data-testid="hint"]');

if (surface) {
  const synth = new GestureSynth();
  const frequencies = buildScaleFrequencies();

  let pointerDown = false;
  const heldKeys = new Set<string>();

  const isEngaged = (): boolean => pointerDown || heldKeys.size > 0;

  const dismissHint = (): void => {
    hint?.setAttribute("data-dismissed", "true");
  };

  const setVisual = (xFraction: number, yFraction: number, active: boolean): void => {
    surface.style.setProperty("--x", `${xFraction * 100}%`);
    surface.style.setProperty("--y", `${yFraction * 100}%`);
    surface.style.setProperty("--hue", `${190 + (1 - yFraction) * 150}`);
    surface.classList.toggle("is-active", active);
    surface.classList.add("has-played");
  };

  const playAtFraction = (xFraction: number, yFraction: number, isNewNote: boolean): void => {
    const brightnessFraction = 1 - yFraction; // up = brighter
    const noteIndex = noteIndexForFraction(xFraction, frequencies.length);
    const frequency = frequencies[noteIndex];
    const cutoff = filterCutoffForFraction(brightnessFraction, frequency);
    if (isNewNote) synth.noteOn(frequency, cutoff);
    else synth.update(frequency, cutoff);
    setVisual(xFraction, yFraction, true);
  };

  const fractionsFromPointer = (event: PointerEvent): { xFraction: number; yFraction: number } => {
    const rect = surface.getBoundingClientRect();
    return {
      xFraction: (event.clientX - rect.left) / rect.width,
      yFraction: (event.clientY - rect.top) / rect.height,
    };
  };

  const releaseIfDisengaged = (): void => {
    if (isEngaged()) return;
    synth.noteOff();
    surface.classList.remove("is-active");
  };

  surface.addEventListener("pointerdown", (event) => {
    pointerDown = true;
    surface.setPointerCapture(event.pointerId);
    dismissHint();
    const { xFraction, yFraction } = fractionsFromPointer(event);
    playAtFraction(xFraction, yFraction, true);
  });

  surface.addEventListener("pointermove", (event) => {
    if (!pointerDown) return;
    const { xFraction, yFraction } = fractionsFromPointer(event);
    playAtFraction(xFraction, yFraction, false);
  });

  surface.addEventListener("pointerup", () => {
    pointerDown = false;
    releaseIfDisengaged();
  });

  surface.addEventListener("pointercancel", () => {
    pointerDown = false;
    releaseIfDisengaged();
  });

  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    const noteIndex = noteIndexForKey(event.key, frequencies.length);
    if (noteIndex === null) return;
    dismissHint();
    const wasEngaged = isEngaged();
    heldKeys.add(event.key.toLowerCase());
    const xFraction = frequencies.length > 1 ? noteIndex / (frequencies.length - 1) : 0.5;
    playAtFraction(xFraction, 0.5, !wasEngaged);
  });

  window.addEventListener("keyup", (event) => {
    heldKeys.delete(event.key.toLowerCase());
    releaseIfDisengaged();
  });
}
