/**
 * Web Audio API Chime & Sound Alert Synthesizer
 * Plays crisp, pleasant notification chimes without external MP3 assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
   * Play standard pleasant 2-tone notification chime
   */
  public playChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";

      // Frequencies: G5 (783.99 Hz) -> C6 (1046.50 Hz)
      osc1.frequency.setValueAtTime(783.99, now);
      osc2.frequency.setValueAtTime(1046.5, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.12);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn("Chime playback error:", e);
    }
  }

  /**
   * Play urgent turn call alert (3 rapid distinct beeps)
   */
  public playUrgentAlert() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const times = [0, 0.15, 0.3];
      const freqs = [880, 1108.73, 1318.51]; // A5, C#6, E6

      times.forEach((t, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freqs[idx], now + t);

        gain.gain.setValueAtTime(0.2, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + 0.12);
      });
    } catch (e) {
      console.warn("Urgent alert playback error:", e);
    }
  }
}

export const soundEngine = new SoundEngine();
