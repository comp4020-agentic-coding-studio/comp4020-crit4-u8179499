# Process overview

## What I built

Aurora: a full-screen, one-screen gesture instrument. Dragging or tapping the
surface plays a pentatonic scale — x maps to pitch, y maps to brightness/timbre
— so there is no wrong note, and the keyboard plays the same scale for anyone
without a mouse. No menus, no visible controls: the whole interface is the
dark surface and its glow.

## The moments that mattered

1. **Setup: carrying the harness forward, not the source.** Assignment 1's
   `CLAUDE.md` was merged into the Crit 4 template rather than copied wholesale
   ([`aad4850`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-u8179499/commit/aad4850)),
   the stack switched to Astro on top of that
   ([`12f7c76`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-u8179499/commit/12f7c76)),
   and the crit's spec turned into red spec tests before any prototype code
   existed
   ([`23c064f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-u8179499/commit/23c064f)).
   Knowing it was right meant the tests stayed red until the instrument
   actually did what the spec asked, not just until something built.

2. **First playable instrument.** The first version wired pointer, touch and
   keyboard input to a Web Audio synth and a following glow, with the
   pentatonic mapping already in place
   ([`31bb9b6`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-u8179499/commit/31bb9b6)).
   `pnpm check` confirmed it built, typechecked and passed the spec — but that
   only says the wiring is correct, not that it's an instrument worth playing.

3. **Judgement one: it sounded mechanical, not musical.** Playing it by ear,
   the voice read as a bare, detuned sawtooth — electronic rather than warm.
   No automated check catches "sounds mechanical"; only listening did. That
   correction — an unfiltered sine core plus a mallet-style triangle layer and
   a feedback delay, detune removed — landed in
   ([`51cb9c0`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-u8179499/commit/51cb9c0)).
   I knew it had worked because it sounded warmer on replay, not because a
   test changed colour.

4. **Judgement two: still too coarse to feel musically rich.** Play-testing
   the warmer voice surfaced a second, separate problem: too few notes and too
   flat a brightness curve across the range, so most of the keyboard felt the
   same. The fix — widening the scale to 25 notes across 5 octaves and scaling
   filter cutoff relative to each note's own frequency rather than a fixed
   range — was committed alongside judgement one, in the same
   [`51cb9c0`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-u8179499/commit/51cb9c0)
   (both passes were iterated live against the running instrument before
   either was committed). The pentatonic "no wrong note" guarantee was kept
   throughout — `scale.test.ts` still asserts every fraction quantizes onto a
   scale degree — so more resolution never meant more risk of a bad note.

5. **Visual refinement, in service of the sound rather than decorating it.**
   The background gained atmospheric depth, the glow's scale/blur/opacity/hue
   became driven by the same brightness value the synth already used for
   filter cutoff, and a lightweight CSS-only comet-tail trail was added to
   show a gesture's shape
   ([`79fc0eb`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-u8179499/commit/79fc0eb)).
   The same commit also cuts the orb and trail down to roughly half their
   first size after visual play-testing found the initial pass too dominant
   for a "finished instrument" feel rather than a Web Audio demo. `pnpm check`
   and `pnpm check:links` verified the markup and build stayed correct; only
   looking at both viewports told me the proportions were right.

**The ear as the harness.** `pnpm check` and `pnpm check:evidence` verify that
the site builds, typechecks, and does what `spec/` asserts — properties a
computer can check. They cannot hear that a sawtooth reads as harsh, or that a
25-note scale feels richer than a 10-note one, or that an 80px glow dominates a
screen a 40px one doesn't. Every correction in moments 3, 4 and 5 came from
listening and looking at the running instrument, not from a red check turning
green — the checks confirmed the change didn't break anything, they never told
me to make it.
