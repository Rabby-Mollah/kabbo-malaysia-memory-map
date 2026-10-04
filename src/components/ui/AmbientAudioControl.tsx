'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { soundEngine } from '@/utils/audio';

export default function AmbientAudioControl() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!soundEngine) return;

    // Initialize Heavenly music on page load
    soundEngine.initHeavenly();

    const updateState = () => {
      setIsMuted(soundEngine.getMuted());
      setIsPlaying(soundEngine.isPlaying());
    };

    updateState();
    const unsubscribe = soundEngine.subscribe(updateState);
    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!soundEngine) return;
    if (!isPlaying) {
      soundEngine.playHeavenly();
    } else {
      soundEngine.toggleMute();
    }
    setIsMuted(soundEngine.getMuted());
    setIsPlaying(soundEngine.isPlaying());
  };

  return (
    <button
      onClick={handleToggleMute}
      type="button"
      className={`group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full backdrop-blur-xl border text-xs font-medium transition-all shadow-glass active:scale-95 ${
        !isMuted && isPlaying
          ? 'bg-lotus-green text-lotus-cream border-lotus-gold/60 ring-2 ring-lotus-gold/25 shadow-gold-glow'
          : 'bg-lotus-greenDeep/90 hover:bg-lotus-green text-lotus-cream/70 border-lotus-blush/25'
      }`}
      title={
        isPlaying
          ? isMuted
            ? 'Unmute Cigarettes After Sex - Heavenly'
            : 'Mute Cigarettes After Sex - Heavenly'
          : 'Play Cigarettes After Sex - Heavenly'
      }
    >
      {/* Dynamic Soundwave / Mute Icon */}
      {!isMuted && isPlaying ? (
        <div className="flex items-center gap-[2px] h-3.5 px-0.5">
          <span className="w-0.5 h-2.5 bg-lotus-gold rounded-full animate-pulse" />
          <span className="w-0.5 h-3.5 bg-lotus-goldLight rounded-full animate-pulse [animation-delay:150ms]" />
          <span className="w-0.5 h-2 bg-lotus-gold rounded-full animate-pulse [animation-delay:300ms]" />
        </div>
      ) : isMuted ? (
        <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lotus-rose/80" />
      ) : (
        <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lotus-gold" />
      )}

      {/* Song title label */}
      <span className="text-[11px] sm:text-xs font-serif font-medium tracking-tight">
        {!isMuted && isPlaying ? (
          <>
            <span className="text-lotus-gold font-semibold">Heavenly</span>
            <span className="text-lotus-blush/80 hidden md:inline ml-1">• CAS</span>
          </>
        ) : isMuted ? (
          <span className="text-lotus-cream/60">Music Muted</span>
        ) : (
          <span className="text-lotus-cream/80">Play Music</span>
        )}
      </span>
    </button>
  );
}
