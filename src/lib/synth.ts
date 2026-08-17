// Thin Web Audio wrapper -- no pure logic here, so it isn't unit tested (see
// scale.ts for the tested math). One persistent oscillator + filter + gain
// envelope, gated per note rather than created/destroyed per note: recreating
// nodes on every gesture is what causes audible clicks and perceived latency.

const ATTACK_LEVEL = 0.25;
const ATTACK_TIME = 0.01;
const RELEASE_TIME = 0.12;
const GLIDE_TIME = 0.015;

export class GestureSynth {
  private context: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private gain: GainNode | null = null;

  private ensureGraph() {
    if (!this.context) {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();

      oscillator.type = "sine";
      filter.type = "lowpass";
      filter.Q.value = 0.7;
      gain.gain.value = 0;

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);
      oscillator.start();

      this.context = context;
      this.oscillator = oscillator;
      this.filter = filter;
      this.gain = gain;
    }
    return {
      context: this.context,
      oscillator: this.oscillator!,
      filter: this.filter!,
      gain: this.gain!,
    };
  }

  noteOn(frequency: number, cutoffHz: number): void {
    const { context, oscillator, filter, gain } = this.ensureGraph();
    if (context.state === "suspended") void context.resume();
    const now = context.currentTime;
    oscillator.frequency.setTargetAtTime(frequency, now, GLIDE_TIME);
    filter.frequency.setTargetAtTime(cutoffHz, now, GLIDE_TIME * 2);
    gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(ATTACK_LEVEL, now, ATTACK_TIME);
  }

  update(frequency: number, cutoffHz: number): void {
    if (!this.context) return;
    const now = this.context.currentTime;
    this.oscillator!.frequency.setTargetAtTime(frequency, now, GLIDE_TIME);
    this.filter!.frequency.setTargetAtTime(cutoffHz, now, GLIDE_TIME * 2);
  }

  noteOff(): void {
    if (!this.context) return;
    const now = this.context.currentTime;
    this.gain!.gain.setTargetAtTime(0, now, RELEASE_TIME);
  }
}
