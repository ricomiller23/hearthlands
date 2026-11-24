class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;
  private ambientInterval: number | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.6;
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = this.isMuted ? 0 : 0.2;
      this.ambientGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
    }
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.2, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playTileSnap() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Wood thock: pitched osc + short noise burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);

    // High click component
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(800, t);
    clickOsc.frequency.exponentialRampToValueAtTime(200, t + 0.02);
    clickGain.gain.setValueAtTime(0.3, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);

    clickOsc.start(t);
    clickOsc.stop(t + 0.03);
  }

  public playTileRotate() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playFollowerPlace(role: string = 'knight') {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (role === 'knight') {
      // Armor clink + wood thud
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.12);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    } else if (role === 'monk') {
      // Small serene bell
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(875, t + 0.5);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    } else if (role === 'thief') {
      // Nimble pop
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.1);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    } else {
      // Farmer rustic thump
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.18);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  public playRoadComplete() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Horn fanfare triad: G3, B3, D4
    const notes = [196.0, 246.94, 293.66];
    notes.forEach((freq, i) => {
      const t = this.ctx!.currentTime + i * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  public playCityComplete() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Medieval castle trumpet heraldry chord: C4, E4, G4, C5
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, i) => {
      const t = this.ctx!.currentTime + i * 0.06;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + 0.75);
    });
  }

  public playMonasteryComplete() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Resonant abbey bell: fundamental with strike transient and slow decay
    const t = this.ctx.currentTime;
    const partials = [
      { f: 220, g: 0.5, d: 2.2 },
      { f: 442, g: 0.3, d: 1.8 },
      { f: 668, g: 0.2, d: 1.2 },
      { f: 910, g: 0.15, d: 0.9 },
    ];

    partials.forEach(({ f, g, d }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(g, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + d);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + d + 0.1);
    });
  }

  public playVictory() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Grand triumphal flourish
    const chordSeq = [
      [261.63, 329.63, 392.0],        // C
      [293.66, 369.99, 440.0],        // D
      [329.63, 415.30, 493.88],       // E
      [523.25, 659.25, 783.99, 1046.5] // C octave full chord
    ];

    chordSeq.forEach((chord, step) => {
      const t = this.ctx!.currentTime + step * 0.22;
      const duration = step === 3 ? 1.6 : 0.3;

      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(t);
        osc.stop(t + duration + 0.1);
      });
    });
  }

  public startAmbient() {
    this.init();
    if (this.isAmbientPlaying || !this.ctx || !this.ambientGain) return;
    this.isAmbientPlaying = true;

    // Random soft birdsong / meadow chimes
    this.ambientInterval = window.setInterval(() => {
      if (!this.isAmbientPlaying || this.isMuted || !this.ctx || !this.ambientGain) return;
      if (Math.random() > 0.4) {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const baseF = 1800 + Math.random() * 800;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseF, t);
        osc.frequency.exponentialRampToValueAtTime(baseF + 250, t + 0.08);
        osc.frequency.exponentialRampToValueAtTime(baseF - 100, t + 0.16);

        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

        osc.connect(gain);
        gain.connect(this.ambientGain);

        osc.start(t);
        osc.stop(t + 0.25);
      }
    }, 4000);
  }

  public stopAmbient() {
    this.isAmbientPlaying = false;
    if (this.ambientInterval !== null) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
