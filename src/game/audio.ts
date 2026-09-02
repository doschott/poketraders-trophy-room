/** Procedural SFX. Unlock from the Start gesture. */
export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  muted = false;

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.sfx.gain.value = 0.45;
      this.master.gain.value = 0.7;
      this.sfx.connect(this.master);
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  resume() {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  setMuted(v: boolean) {
    this.muted = v;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v ? 0 : 0.7, this.ctx.currentTime, 0.02);
    }
  }

  collect(high = false) {
    this.beep(high ? 880 : 660, 0.09, "triangle", 0.18);
    this.beep(high ? 1320 : 990, 0.07, "sine", 0.1, 0.04);
  }

  board() {
    this.beep(220, 0.12, "sine", 0.16);
    this.beep(330, 0.1, "triangle", 0.1, 0.05);
  }

  complete() {
    this.beep(523, 0.16, "triangle", 0.18);
    this.beep(659, 0.16, "triangle", 0.16, 0.12);
    this.beep(784, 0.22, "sine", 0.2, 0.24);
  }

  thump() {
    this.beep(90, 0.08, "sine", 0.22);
  }

  private beep(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    delay = 0,
  ) {
    if (!this.ctx || !this.sfx || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq * (0.97 + Math.random() * 0.06), t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.sfx);
    osc.start(t);
    osc.stop(t + dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }
}
