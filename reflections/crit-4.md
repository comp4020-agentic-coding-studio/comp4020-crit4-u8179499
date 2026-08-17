# Crit 4 reflection

**What was the breakthrough that moved the work forward?**

The first playable version of the instrument worked technically — it built,
typechecked, and passed every automated check — but when I actually listened
to it, the sound felt mechanical and electronic, not musical. That gap was the
breakthrough: `pnpm check` could tell me the wiring was correct, but it had
nothing to say about whether the thing was worth playing. So instead of adding
features, I directed the agent to reduce the synthetic character of the voice.
The sound improved, but listening again surfaced a second problem the checks
also couldn't see: the pitch/timbre mapping was too coarse to feel musically
rich. Another directed pass increased the musical resolution while keeping the
pentatonic "no wrong note" principle intact, and only then did a final visual
pass — atmospheric depth, a gesture trail, glow behaviour, and pulling the orb
down to a less dominant size — make the page feel like a finished instrument
rather than a Web Audio demo. Every one of those corrections came from
listening and playing, not from a check turning green.

**What did this work change about who I want to be as a software developer?**

It sharpened the distinction between "the tests pass" and "the thing is good."
Automated checks verified implementation correctness throughout, but they were
never going to tell me a sound was too electronic or an orb too large — only
my own ear and eye could. I want to keep building that judgement into my
process deliberately: treat passing checks as necessary, not sufficient, and
budget real time for actually using what I build before calling it done.
