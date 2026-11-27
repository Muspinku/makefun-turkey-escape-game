// Gobble Run — all sound, made on the spot with WebAudio.
// One clear job: every beep, gobble and jingle. No audio files are shipped,
// so the game never needs the network for sound. Sound starts only after
// the player's first gesture, as browsers require.

export class SoundFX {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  // Call from a user gesture (key press, click) so the browser allows audio.
  unlock() {
    if (!this.context) {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        this.context = new Ctor();
      } catch {
        this.context = null;
      }
    }
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // A short oscillator blip: frequency slides from `from` to `to`.
  blip(from, to, seconds, type = 'sine', volume = 0.16) {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + seconds);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + seconds);
    osc.connect(gain).connect(this.context.destination);
    osc.start(now);
    osc.stop(now + seconds + 0.02);
  }

  jump() {
    this.blip(280, 620, 0.16, 'sine', 0.14);
  }

  duck() {
    this.blip(320, 170, 0.12, 'triangle', 0.1);
  }

  corn() {
    this.blip(880, 1320, 0.09, 'sine', 0.14);
    setTimeout(() => this.blip(1320, 1760, 0.08, 'sine', 0.1), 70);
  }

  feather() {
    [660, 880, 1100].forEach((f, i) =>
      setTimeout(() => this.blip(f, f * 1.2, 0.1, 'triangle', 0.12), i * 80),
    );
  }

  stumble() {
    this.blip(220, 70, 0.28, 'sawtooth', 0.18);
  }

  spotted() {
    this.blip(1500, 900, 0.12, 'square', 0.07);
  }

  // The turkey's own gobble: three quick low warbles.
  gobble() {
    [0, 110, 220].forEach((delay, i) => {
      setTimeout(() => this.blip(i % 2 ? 340 : 260, 180, 0.12, 'sawtooth', 0.12), delay);
    });
  }

  caught() {
    [392, 330, 262, 196].forEach((f, i) =>
      setTimeout(() => this.blip(f, f * 0.94, 0.22, 'triangle', 0.16), i * 170),
    );
  }

  escaped() {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => this.blip(f, f, 0.24, 'triangle', 0.16), i * 130),
    );
  }
}
