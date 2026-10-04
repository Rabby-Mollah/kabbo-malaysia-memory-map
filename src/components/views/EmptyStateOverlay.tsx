'use client';

import React from 'react';
import { Plus, Sparkles, MapPin } from 'lucide-react';
import { soundEngine } from '@/utils/audio';

interface EmptyStateOverlayProps {
  onAddFirstMemory: () => void;
  friendName: string;
}

export default function EmptyStateOverlay({
  onAddFirstMemory,
  friendName,
}: EmptyStateOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-lotus-forest/85 backdrop-blur-xl border border-lotus-rose/30 shadow-glass-lg text-center text-lotus-cream pointer-events-auto space-y-5 animate-fade-in">
        <div className="w-14 h-14 mx-auto rounded-full bg-lotus-gold/20 border border-lotus-gold/40 flex items-center justify-center text-2xl shadow-gold-glow">
          📍
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-lotus-gold block">
            Welcome, {friendName}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-lotus-cream">
            Your map is waiting for memories.
          </h2>
          <p className="text-xs sm:text-sm text-lotus-blush font-serif italic">
            &ldquo;Start with the first place you visit.&rdquo;
          </p>
        </div>

        <p className="text-xs text-lotus-cream/70 leading-relaxed max-w-xs mx-auto">
          Explore the 3D islands below. As you pin locations, taste dishes, and take photos, the map will blossom into your personal Malaysian story.
        </p>

        <button
          onClick={() => {
            soundEngine?.playChime('click');
            onAddFirstMemory();
          }}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-lotus-gold to-lotus-stamenGold text-lotus-forest font-bold text-xs shadow-gold-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>＋ Add First Memory</span>
        </button>
      </div>
    </div>
  );
}
