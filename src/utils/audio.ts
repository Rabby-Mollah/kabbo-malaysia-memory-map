import { AmbientSoundType } from '@/types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private heavenlyAudio: HTMLAudioElement | null = null;
  private isMusicMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private lastClickTime: number = 0;
  private listeners: Set<() => void> = new Set();
  private volume: number = 0.5;

  constructor() {
    if (typeof window !== 'undefined') {
      // Restore muted preference if previously set
      const savedMute = localStorage.getItem('kabbo_music_muted');
      if (savedMute !== null) {
        this.isMusicMuted = savedMute === 'true';
      }
    }
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Preloads "Cigarettes After Sex - Heavenly" without playing.
   * Playback strictly starts when the user clicks "START MY JOURNEY" or toggles music.
   */
  public initHeavenly() {
    if (typeof window === 'undefined') return;
    if (this.heavenlyAudio) return; // already initialized

    try {
      const audio = new Audio('/audio/heavenly.mp3');
      audio.loop = true;
      audio.volume = this.volume;
      audio.muted = this.isMusicMuted;
      audio.preload = 'auto';

      // Fallback to high-availability CDN if local path fails
      audio.addEventListener('error', () => {
        console.warn('Local heavenly.mp3 failed, falling back to CDN stream');
        audio.src =
          'https://traffic.omny.fm/d/clips/bad5d079-8dcb-4630-8770-aa090049131d/32b2ac38-5a48-4300-9fa6-aa40002038b5/e94ce646-0a16-4e94-8112-aace0011e860/audio.mp3';
        if (!this.isMusicMuted && this.isMusicPlaying) {
          audio.play().catch(() => {});
        }
      });

      audio.addEventListener('play', () => {
        this.isMusicPlaying = true;
        this.notify();
      });

      audio.addEventListener('pause', () => {
        this.isMusicPlaying = false;
        this.notify();
      });

      this.heavenlyAudio = audio;
    } catch (err) {
      console.warn('Failed to initialize Heavenly audio:', err);
    }
  }

  public toggleMute(): boolean {
    this.isMusicMuted = !this.isMusicMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kabbo_music_muted', String(this.isMusicMuted));
    }

    if (this.heavenlyAudio) {
      this.heavenlyAudio.muted = this.isMusicMuted;
      if (!this.isMusicMuted && this.heavenlyAudio.paused) {
        this.initContext();
        this.heavenlyAudio.play().then(() => {
          this.isMusicPlaying = true;
          this.notify();
        }).catch(() => {});
      }
    }

    this.notify();
    return this.isMusicMuted;
  }

  public setMuted(muted: boolean) {
    if (this.isMusicMuted !== muted) {
      this.toggleMute();
    }
  }

  public getMuted(): boolean {
    return this.isMusicMuted;
  }

  public isPlaying(): boolean {
    return this.isMusicPlaying && !this.isMusicMuted;
  }

  public playHeavenly() {
    if (!this.heavenlyAudio) {
      this.initHeavenly();
    }
    this.initContext();
    this.isMusicMuted = false;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kabbo_music_muted', 'false');
    }
    if (this.heavenlyAudio) {
      this.heavenlyAudio.muted = false;
      this.heavenlyAudio.play().then(() => {
        this.isMusicPlaying = true;
        this.notify();
      }).catch((err) => {
        console.warn('Playback error:', err);
      });
    }
  }

  public pauseHeavenly() {
    if (this.heavenlyAudio) {
      this.heavenlyAudio.pause();
      this.isMusicPlaying = false;
      this.notify();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.heavenlyAudio) {
      this.heavenlyAudio.volume = this.volume;
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error(err);
      }
    });
  }

  /**
   * Crisp, tactile UI button click SFX (soft marimba / glass haptic tap)
   */
  public playButtonClick() {
    try {
      this.initContext();
      if (!this.ctx || this.isMusicMuted) return;

      const now = this.ctx.currentTime;
      // Debounce rapid multi-events within 30ms
      if (now - this.lastClickTime < 0.03) return;
      this.lastClickTime = now;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Subtle organic pitch variation
      const baseFreq = 920 + (Math.random() * 80 - 40);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // AudioContext not allowed or uninitialized yet
    }
  }

  /**
   * Plays specific thematic sound effects
   */
  public playChime(kind: 'pin' | 'achievement' | 'click' | 'stamp') {
    if (kind === 'click') {
      this.playButtonClick();
      return;
    }

    try {
      this.initContext();
      if (!this.ctx || this.isMusicMuted) return;

      const now = this.ctx.currentTime;
      if (kind === 'stamp') {
        // Deep rubber stamp thud
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        g.gain.setValueAtTime(0.28, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (kind === 'pin') {
        // Gentle water drop marimba pop
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
        g.gain.setValueAtTime(0.18, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
      } else if (kind === 'achievement') {
        // Ascending harmonic chime: C5 - E5 - G5 - C6
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          const noteTime = now + idx * 0.08;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          g.gain.setValueAtTime(0, noteTime);
          g.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);
          osc.connect(g);
          g.connect(this.ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.42);
        });
      }
    } catch {
      // ignore
    }
  }

  // Legacy ambient compatibility stubs
  public getCurrentType(): AmbientSoundType {
    return 'off';
  }
  public stop() {}
  public play(_type: AmbientSoundType) {}
}

export const soundEngine =
  typeof window !== 'undefined' ? new SoundEngine() : (null as unknown as SoundEngine);
