import { AmbientSoundType } from '@/types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = 'off';
  private gainNode: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.35;
  private intervalId: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }

  public stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
      setTimeout(() => {
        try {
          this.noiseNode?.disconnect();
          this.filterNode?.disconnect();
          this.lfoNode?.stop();
          this.lfoNode?.disconnect();
        } catch {
          // cleanup
        }
        this.noiseNode = null;
        this.filterNode = null;
        this.lfoNode = null;
      }, 200);
    }
    this.currentType = 'off';
  }

  public play(type: AmbientSoundType) {
    if (type === 'off') {
      this.stop();
      return;
    }

    try {
      this.initContext();
      if (!this.ctx) return;

      this.stop();
      this.currentType = type;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink / brown noise generator
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime + 0.05, 0.4);

      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(gain);
      } else if (type === 'ocean') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);
        filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

        // LFO for periodic wave swell
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec ocean swell
        lfoGain.gain.setValueAtTime(320, this.ctx.currentTime);

        lfo.connect(filter.frequency);
        lfo.start();
        this.lfoNode = lfo;

        noiseSource.connect(filter);
        filter.connect(gain);
      } else if (type === 'tropical') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
        filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(gain);

        // Periodic pleasant chirps
        this.intervalId = window.setInterval(() => {
          if (!this.ctx || this.currentType !== 'tropical' || this.isMuted) return;
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();
          osc.type = 'sine';
          const baseFreq = 2400 + Math.random() * 1200;
          osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, this.ctx.currentTime + 0.12);

          oscGain.gain.setValueAtTime(0, this.ctx.currentTime);
          oscGain.gain.linearRampToValueAtTime(0.04 * this.volume, this.ctx.currentTime + 0.04);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);

          osc.connect(oscGain);
          oscGain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.28);
        }, 3500);
      } else if (type === 'night') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, this.ctx.currentTime);
        filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(gain);
      }

      gain.connect(this.ctx.destination);
      noiseSource.start();

      this.gainNode = gain;
      this.filterNode = filter;
      this.noiseNode = noiseSource;
    } catch (err) {
      console.warn("Web Audio ambient init error:", err);
    }
  }

  // Play a soft bell/chime for achievement unlock or pin drop
  public playChime(kind: 'pin' | 'achievement' | 'click' | 'stamp') {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      if (kind === 'stamp') {
        // Deep satisfying thud + mechanical rubber stamp sound
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (kind === 'pin') {
        // Gentle water drop / marimba pop
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
        g.gain.setValueAtTime(0.2, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (kind === 'achievement') {
        // Golden arpeggio: C5 - E5 - G5 - C6
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          const noteTime = now + idx * 0.08;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          g.gain.setValueAtTime(0, noteTime);
          g.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);
          osc.connect(g);
          g.connect(this.ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.42);
        });
      } else {
        // Subtle soft UI tap
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch {
      // ignore
    }
  }
}

export const soundEngine = typeof window !== 'undefined' ? new SoundEngine() : (null as unknown as SoundEngine);
