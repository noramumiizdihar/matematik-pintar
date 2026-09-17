// Web Audio API procedural sound synthesizer
// Zero external assets required — 100% reliable offline!

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  // Soft tactile UI click
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio context might be restricted before first interaction
    }
  }

  // Bubble pop for counting items
  public playPop(pitchModifier: number = 1.0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 400 * pitchModifier;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Ignored
    }
  }

  // Sweet, joyful pentatonic celebration for correct answer
  public playCorrect() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.5)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const noteDelay = 0.07;

      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startTime = this.ctx.currentTime + index * noteDelay;
        const duration = 0.25;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Ignored
    }
  }

  // Gentle, warm encouragement sound — NEVER a loud buzzer or shame sound
  public playGentleRetry() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Soft warm wooden plop: 392Hz (G4) -> 330Hz (E4)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startTime = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(392, startTime);
      osc.frequency.exponentialRampToValueAtTime(320, startTime + 0.18);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    } catch {
      // Ignored
    }
  }

  // Level complete fanfare
  public playFanfare() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // C5, E5, G5, C6 (chord)
      const chords = [
        { freqs: [523.25, 659.25], start: 0, dur: 0.15 },
        { freqs: [587.33, 698.46], start: 0.15, dur: 0.15 },
        { freqs: [659.25, 783.99], start: 0.3, dur: 0.18 },
        { freqs: [523.25, 659.25, 783.99, 1046.5], start: 0.48, dur: 0.6 }
      ];

      chords.forEach(({ freqs, start, dur }) => {
        freqs.forEach(freq => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          const sTime = this.ctx.currentTime + start;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, sTime);

          gain.gain.setValueAtTime(0.12 / freqs.length, sTime);
          gain.gain.exponentialRampToValueAtTime(0.001, sTime + dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(sTime);
          osc.stop(sTime + dur);
        });
      });
    } catch {
      // Ignored
    }
  }
}

export const soundFx = new SoundEngine();
