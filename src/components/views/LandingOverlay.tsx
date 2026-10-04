'use client';

import React from 'react';
import { Compass, Sparkles, MapPin, Heart, ArrowRight } from 'lucide-react';
import { TripProfile } from '@/types';
import { soundEngine } from '@/utils/audio';

interface LandingOverlayProps {
  profile: TripProfile;
  memoriesCount: number;
  onStartJourney: () => void;
}

export default function LandingOverlay({
  profile,
  memoriesCount,
  onStartJourney,
}: LandingOverlayProps) {
  const handleStart = () => {
    soundEngine?.playHeavenly();
    soundEngine?.playChime('achievement');
    onStartJourney();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6 md:p-12 bg-gradient-to-t from-lotus-greenDark/95 via-lotus-greenDeep/40 to-lotus-greenDark/70 backdrop-blur-[2px] overflow-hidden">
      {/* Top Header Tag */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-lotus-greenDeep/90 backdrop-blur-xl border border-lotus-blush/30 text-lotus-cream shadow-glass">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-lotus-rose animate-pulse" />
          <span className="text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-lotus-blush">
            🌸 Digital Keepsake • Sacred Botanical Edition
          </span>
        </div>

        <div className="text-right text-lotus-cream/80 text-xs hidden sm:block">
          <div>
            <span>For </span>
            <span className="font-semibold text-lotus-gold text-sm">{profile.friendName}</span>
          </div>
          <span className="text-[11px] text-lotus-blush/80">Made with love by Rabby ❤️</span>
        </div>
      </div>

      {/* Center Cinematic Hero Text */}
      <div className="max-w-xl mx-auto text-center space-y-3.5 sm:space-y-5 my-auto pointer-events-auto px-2">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-lotus-blush/15 border border-lotus-rose/40 text-lotus-blush text-[11px] sm:text-xs font-medium backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-lotus-gold" />
          <span className="tracking-wider">{profile.tripDates} • An Interactive Story</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-lotus-cream tracking-tight font-medium drop-shadow-md leading-tight">
          Malaysia Memory Map
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-lotus-blush/90 font-light italic font-serif max-w-md mx-auto">
          &ldquo;{profile.subtitle}&rdquo;
        </p>

        <p className="text-xs sm:text-sm text-lotus-cream/75 max-w-sm mx-auto leading-relaxed">
          {profile.dedicationMessage}
        </p>

        {/* Start Button */}
        <div className="pt-2 sm:pt-4 flex flex-col items-center gap-2.5 sm:gap-3">
          <button
            onClick={handleStart}
            className="group relative inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-lotus-rose via-lotus-pink to-lotus-gold text-lotus-greenDark font-bold text-sm sm:text-base shadow-rose-glow hover:scale-105 active:scale-95 transition-all duration-300 border border-lotus-blush/50"
          >
            <span className="tracking-wide">START MY JOURNEY</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <span className="text-[10px] sm:text-[11px] text-lotus-blush/60 tracking-widest uppercase font-medium">
            Rotate • Zoom • Explore Malaysia
          </span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto border-t border-lotus-blush/15 pt-4 text-xs text-lotus-cream/70">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-lotus-gold" />
            <span>Peninsular & Borneo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-lotus-rose text-lotus-rose" />
            <span>{memoriesCount > 0 ? `${memoriesCount} Memories Pinned` : 'Ready for Memories'}</span>
          </div>
        </div>

        <div className="text-[11px] text-lotus-blush/80 font-medium">
          For {profile.friendName} • Made with love by Rabby ❤️
        </div>
      </div>
    </div>
  );
}
