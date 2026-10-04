'use client';

import React from 'react';
import { Sparkles, Share2, Settings, Plus, RotateCcw } from 'lucide-react';
import AmbientAudioControl from './AmbientAudioControl';
import { TripProfile } from '@/types';
import { soundEngine } from '@/utils/audio';

interface AppHeaderProps {
  profile: TripProfile;
  onOpenPersonalize: () => void;
  onOpenShare: () => void;
  onOpenSummary: () => void;
  onAddNew: () => void;
  onToggleLanding: () => void;
  isLandingMode: boolean;
  readOnly?: boolean;
}

export default function AppHeader({
  profile,
  onOpenPersonalize,
  onOpenShare,
  onOpenSummary,
  onAddNew,
  onToggleLanding,
  isLandingMode,
  readOnly = false,
}: AppHeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 sm:p-5 pointer-events-none">
      {/* Brand & Traveler Tag */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        <button
          onClick={onToggleLanding}
          className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-lotus-greenDeep/90 hover:bg-lotus-green backdrop-blur-xl border border-lotus-blush/30 text-lotus-cream shadow-glass transition-all hover:scale-105"
        >
          <span className="text-base sm:text-lg">🌸</span>
          <div className="text-left">
            <span className="font-serif font-bold text-xs sm:text-sm text-lotus-cream tracking-tight block max-w-[110px] sm:max-w-none truncate">
              {profile.tripTitle}
            </span>
            <span className="text-[9px] sm:text-[10px] text-lotus-blush uppercase tracking-wider hidden sm:block">
              For {profile.friendName} • With love by Rabby ❤️
            </span>
          </div>
        </button>

        {!readOnly && (
          <button
            onClick={() => {
              soundEngine?.playChime('click');
              onOpenPersonalize();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-lotus-greenDeep/90 hover:bg-lotus-green backdrop-blur-xl border border-lotus-blush/25 flex items-center justify-center text-lotus-blush hover:text-white transition-all shadow-glass shrink-0"
            title="Personalize & Cloud Keys"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Ambient Sound control */}
        <AmbientAudioControl />

        {/* Share Button */}
        <button
          onClick={() => {
            soundEngine?.playChime('click');
            onOpenShare();
          }}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-lotus-greenDeep/90 hover:bg-lotus-green backdrop-blur-xl border border-lotus-blush/25 text-lotus-cream shadow-glass flex items-center gap-1.5 text-xs font-medium transition-all"
          title="Share memory link"
        >
          <Share2 className="w-4 h-4 text-lotus-gold" />
          <span className="hidden md:inline">Share</span>
        </button>

        {/* Quick Refresh Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundEngine?.playChime('click');
            window.location.reload();
          }}
          data-no-pull-refresh="true"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-lotus-greenDeep/90 hover:bg-lotus-green backdrop-blur-xl border border-lotus-blush/25 text-lotus-gold shadow-glass flex items-center justify-center transition-all active:scale-95 touch-manipulation"
          title="Refresh page"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Complete Journey CTA button with Lotus Rose Gradient */}
        <button
          onClick={() => {
            soundEngine?.playChime('click');
            onOpenSummary();
          }}
          className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-lotus-rose via-lotus-pink to-lotus-gold text-lotus-greenDark font-bold text-xs shadow-rose-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 border border-lotus-blush/40"
        >
          <Sparkles className="w-3.5 h-3.5 text-lotus-greenDark shrink-0" />
          <span className="hidden sm:inline">Complete Journey</span>
        </button>

        {/* Add Memory quick button (desktop) */}
        {!readOnly && (
          <button
            onClick={() => {
              soundEngine?.playChime('click');
              onAddNew();
            }}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-lotus-green hover:bg-lotus-greenLight border border-lotus-blush/30 text-lotus-cream font-semibold text-xs shadow-glass transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 text-lotus-gold" />
            <span>Add Memory</span>
          </button>
        )}
      </div>
    </header>
  );
}
