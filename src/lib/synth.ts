// Thin Web Audio wrapper -- no pure logic here, so it isn't unit tested (see
// scale.ts for the tested math). One persistent voice per instance, gated by
// gain rather than created/destroyed per note: recreating nodes on every
// gesture is what causes audible clicks and perceived latency.
//
// Voice design: a plain sine core carries the pitch and is never routed
// through the filter, so a note stays warm and clearly audible at every
// brightness position. A quiet triangle layer sits on top of it and is what
// the brightness gesture sweeps through the filter -- triangle rather than
// sawtooth because its harmonics fall off much faster, so the brightness
// change reads as gentle shimmer rather than an electronic buzz. That layer
// also gets its own short decay on every new note: a brief flash right at
// onset settling down to a much quieter sustain, the way a mallet or bell
// is bright at the strike and warm afterwards, rather than a held synth pad.
const CORE_GAIN = 0.8; // sine core, unfiltered -- the warm body of the tone
const COLOR_STRIKE_GAIN = 0.32; // brief overtone flash right at the strike
const COLOR_SUSTAIN_GAIN = 0.1; // settles low -- held tone stays close to the sine
const COLOR_DECAY_TIME = 0.16; // time constant, strike settling to sustain
const COLOR_DETUNE_CENTS = 0; // even a few cents read as an obvious synth chorus

const ATTACK_LEVEL = 0.24;
const ATTACK_TIME = 0.014; // time constant -- fast onset, no click
const RELEASE_TIME = 0.22; // time constant -- soft, mallet-like decay, not a hard cutoff

// Frequency smoothing, not portamento: short enough that scale degrees still
// read as distinct notes, long enough that a quantized jump doesn't sound
// like an abrupt electronic step.
const PITCH_GLIDE_TIME = 0.035;
const FILTER_GLIDE_TIME = 0.06;

const FILTER_Q = 0.7;

// A bare hint of room rather than an audible echo -- low feedback and a dark
// repeat so it thickens the tone without reading as a delay effect.
const DELAY_TIME = 0.24;
const DELAY_FEEDBACK = 0.14;
const DELAY_FILTER_HZ = 2000;
const DELAY_WET_GAIN = 0.07;

export class GestureSynth {
  private context: AudioContext | null = null;
  private core: OscillatorNode | null = null;
  private color: OscillatorNode | null = null;
  private colorGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private envelope: GainNode | null = null;

  private ensureGraph() {
    if (!this.context) {
      const context = new AudioContext();
      const core = context.createOscillator();
      const color = context.createOscillator();
      const coreGain = context.createGain();
      const colorGain = context.createGain();
      const filter = context.createBiquadFilter();
      const envelope = context.createGain();
      const delay = context.createDelay(1);
      const delayFilter = context.createBiquadFilter();
      const feedback = context.createGain();
      const wet = context.createGain();

      core.type = "sine";
      color.type = "triangle";
      color.detune.value = COLOR_DETUNE_CENTS;
      coreGain.gain.value = CORE_GAIN;
      colorGain.gain.value = 0;
      filter.type = "lowpass";
      filter.Q.value = FILTER_Q;
      envelope.gain.value = 0;

      delay.delayTime.value = DELAY_TIME;
      delayFilter.type = "lowpass";
      delayFilter.frequency.value = DELAY_FILTER_HZ;
      feedback.gain.value = DELAY_FEEDBACK;
      wet.gain.value = DELAY_WET_GAIN;

      core.connect(coreGain);
      coreGain.connect(envelope);

      color.connect(colorGain);
      colorGain.connect(filter);
      filter.connect(envelope);

      envelope.connect(context.destination);
      envelope.connect(delay);
      delay.connect(delayFilter);
      delayFilter.connect(feedback);
      feedback.connect(delay);
      delayFilter.connect(wet);
      wet.connect(context.destination);

      core.start();
      color.start();

      this.context = context;
      this.core = core;
      this.color = color;
      this.colorGain = colorGain;
      this.filter = filter;
      this.envelope = envelope;
    }
    return {
      context: this.context,
      core: this.core!,
      color: this.color!,
      colorGain: this.colorGain!,
      filter: this.filter!,
      envelope: this.envelope!,
    };
  }

  noteOn(frequency: number, cutoffHz: number): void {
    const { context, core, color, colorGain, filter, envelope } = this.ensureGraph();
    if (context.state === "suspended") void context.resume();
    const now = context.currentTime;
    core.frequency.setTargetAtTime(frequency, now, PITCH_GLIDE_TIME);
    color.frequency.setTargetAtTime(frequency, now, PITCH_GLIDE_TIME);
    filter.frequency.setTargetAtTime(cutoffHz, now, FILTER_GLIDE_TIME);
    colorGain.gain.cancelScheduledValues(now);
    colorGain.gain.setValueAtTime(COLOR_STRIKE_GAIN, now);
    colorGain.gain.setTargetAtTime(COLOR_SUSTAIN_GAIN, now, COLOR_DECAY_TIME);
    envelope.gain.cancelScheduledValues(now);
    envelope.gain.setTargetAtTime(ATTACK_LEVEL, now, ATTACK_TIME);
  }

  update(frequency: number, cutoffHz: number): void {
    if (!this.context) return;
    const now = this.context.currentTime;
    this.core!.frequency.setTargetAtTime(frequency, now, PITCH_GLIDE_TIME);
    this.color!.frequency.setTargetAtTime(frequency, now, PITCH_GLIDE_TIME);
    this.filter!.frequency.setTargetAtTime(cutoffHz, now, FILTER_GLIDE_TIME);
  }

  noteOff(): void {
    if (!this.context) return;
    const now = this.context.currentTime;
    this.envelope!.gain.setTargetAtTime(0, now, RELEASE_TIME);
  }
}
