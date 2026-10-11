// Web Audio API Synthesized Sound Generator for Institutional HUD & Whale Sonar

class SoundService {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Plays a high-tech acoustic submarine/radar sonar ping
   */
  public playSonarPing(freq = 980) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    } catch {
      // ignore
    }
  }

  /**
   * Double acoustic ping for detected Iceberg / Hidden Order
   */
  public playIcebergAlert() {
    if (!this.enabled) return;
    this.playSonarPing(1100);
    setTimeout(() => {
      this.playSonarPing(1350);
    }, 140);
  }

  /**
   * Deep bass sweep alarm for large Whale Absorption (>300 lots)
   */
  public playWhaleAbsorptionAlarm() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    } catch {
      // ignore
    }
  }

  /**
   * Subtle futuristic HUD tick
   */
  public playHudClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(2400, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // ignore
    }
  }

  /**
   * Ascending dual-tone futuristic chime for successful verification
   */
  public playSuccessChime() {
    if (!this.enabled) return;
    this.playSonarPing(880);
    setTimeout(() => {
      this.playSonarPing(1320);
    }, 120);
  }

  public playChime() {
    this.playSuccessChime();
  }

  public playSonarPulse() {
    this.playSonarPing(740);
  }

  /**
   * Low warning tone for validation error
   */
  public playBeepError() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch {
      // ignore
    }
  }
}

export const soundFx = new SoundService();
