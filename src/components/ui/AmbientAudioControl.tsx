'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, CloudRain, Waves, Trees, Moon } from 'lucide-react';
import { soundEngine } from '@/utils/audio';
import { AmbientSoundType } from '@/types';

export default function AmbientAudioControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSound, setActiveSound] = useState<AmbientSoundType>('off');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);

  useEffect(() => {
    if (soundEngine) {
      setActiveSound(soundEngine.getCurrentType());
      setIsMuted(soundEngine.getMuted());
    }
  }, []);

  const handleSelectSound = (type: AmbientSoundType) => {
    if (activeSound === type) {
      soundEngine?.stop();
      setActiveSound('off');
    } else {
      soundEngine?.play(type);
      setActiveSound(type);
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    const muted = soundEngine?.toggleMute() ?? false;
    setIsMuted(muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine?.setVolume(val);
  };

  const soundOptions = [
    { id: 'tropical', label: 'Rainforest', icon: Trees, desc: 'Jungle rustle & birds' },
    { id: 'ocean', label: 'Andaman Sea', icon: Waves, desc: 'Gentle coastal swell' },
    { id: 'rain', label: 'Tropical Rain', icon: CloudRain, desc: 'Warm island showers' },
    { id: 'night', label: 'City Dusk', icon: Moon, desc: 'Warm ambient glow' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-medium transition-all shadow-glass ${
          activeSound !== 'off'
            ? 'bg-lotus-pine text-lotus-cream border-lotus-gold/60 ring-2 ring-lotus-gold/30'
            : 'bg-lotus-forest/80 hover:bg-lotus-forest text-lotus-cream/80 border-lotus-rose/20'
        }`}
        title="Ambient Sounds"
      >
        {isMuted || activeSound === 'off' ? (
          <VolumeX className="w-4 h-4 text-lotus-cream/60" />
        ) : (
          <Volume2 className="w-4 h-4 text-lotus-gold animate-pulse" />
        )}
        <span className="hidden sm:inline">
          {activeSound === 'off' ? 'Ambience' : soundOptions.find((s) => s.id === activeSound)?.label}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 w-64 p-3.5 rounded-2xl bg-lotus-forest/95 backdrop-blur-xl border border-lotus-rose/25 shadow-glass-lg z-50 text-lotus-cream animate-fade-in">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-lotus-rose/15">
            <span className="text-xs font-semibold uppercase tracking-wider text-lotus-gold">
              Malaysian Atmosphere
            </span>
            <button
              onClick={handleToggleMute}
              className="text-xs text-lotus-cream/60 hover:text-white flex items-center gap-1"
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {soundOptions.map((opt) => {
              const Icon = opt.icon;
              const isCurrent = activeSound === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectSound(opt.id as AmbientSoundType)}
                  className={`flex flex-col items-start p-2 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? 'bg-lotus-pine border-lotus-gold text-lotus-cream shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 border-lotus-rose/15 text-lotus-cream/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-lotus-gold' : 'text-lotus-cream/60'}`} />
                    <span className="text-xs font-medium">{opt.label}</span>
                  </div>
                  <span className="text-[10px] text-lotus-cream/50 leading-tight">{opt.desc}</span>
                </button>
              );
            })}
          </div>

          {activeSound !== 'off' && (
            <div className="flex items-center gap-2 pt-2 border-t border-lotus-rose/15">
              <span className="text-[10px] text-lotus-cream/50 uppercase">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-lotus-gold h-1.5 rounded-lg bg-white/20 cursor-pointer"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
