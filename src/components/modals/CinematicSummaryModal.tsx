'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { X, Sparkles, Heart, MapPin, Share2, Download, Check } from 'lucide-react';
import { Memory, TripProfile } from '@/types';
import { soundEngine } from '@/utils/audio';

interface CinematicSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  profile: TripProfile;
  onShare: () => void;
}

export default function CinematicSummaryModal({
  isOpen,
  onClose,
  memories,
  profile,
  onShare,
}: CinematicSummaryModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      soundEngine?.playChime('achievement');

      // Trigger celebratory Lotus confetti in petal pink and gold
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#cf6b7d', '#eaafb9', '#dfad40', '#f7dee2', '#f7f4ee'],
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPlaces = new Set(memories.map((m) => m.location.name)).size;
  const totalFoods = memories.filter((m) => m.type === 'food' || m.tags.includes('Food')).length;
  const totalPhotos = memories.reduce((acc, m) => acc + (m.photos?.length || 0), 0);
  const totalUnforgettable = memories.filter((m) => m.unforgettable).length;

  const highlightPhotos = memories
    .flatMap((m) => m.photos || [])
    .slice(0, 6);

  const handleCopyStory = () => {
    soundEngine?.playChime('click');
    const storyText = `🌸 ${profile.friendName}'s Malaysia (${profile.tripDates})\n${totalPlaces} places • ${totalFoods} foods • ${totalPhotos} photos • ${totalUnforgettable} unforgettable moments.\n"Some places become memories. Some memories become stories."\nMade with love by Rabby ❤️`;
    navigator.clipboard.writeText(storyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-3 sm:p-4 animate-fade-in text-lotus-cream select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-lotus-greenDark via-lotus-greenDeep to-[#041a13] border-2 border-lotus-blush/35 p-5 sm:p-10 shadow-2xl space-y-6 sm:space-y-8 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 flex items-center justify-center transition-colors text-lotus-cream"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Crown Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-lotus-blush/15 border border-lotus-rose/50 text-lotus-blush text-[11px] sm:text-xs font-bold tracking-widest uppercase shadow-rose-glow">
          <Sparkles className="w-3.5 h-3.5 text-lotus-gold" />
          <span>SACRED KEEPSAKE EMBLEM</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-1.5 sm:space-y-2">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-lotus-cream tracking-tight uppercase">
            {profile.friendName}&apos;s Malaysia
          </h1>
          <p className="text-base sm:text-xl text-lotus-blush font-serif italic">
            {profile.tripDates}
          </p>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-lotus-blush/15">
          <div className="p-3 rounded-2xl bg-white/5 border border-lotus-blush/15">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-lotus-gold block">
              {totalPlaces}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-lotus-cream/60">
              places
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-lotus-blush/15">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-lotus-pink block">
              {totalFoods}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-lotus-cream/60">
              foods
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-lotus-blush/15">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-lotus-blush block">
              {totalPhotos}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-lotus-cream/60">
              photos
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-lotus-blush/15">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-lotus-rose block">
              {totalUnforgettable}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-lotus-cream/60">
              unforgettable
            </span>
          </div>
        </div>

        {/* Floating Mini Photo Collage */}
        {highlightPhotos.length > 0 && (
          <div className="flex items-center justify-center gap-2 overflow-hidden py-2">
            {highlightPhotos.map((photoUrl, idx) => (
              <div
                key={idx}
                className="relative w-14 sm:w-20 h-16 sm:h-24 rounded-xl overflow-hidden shrink-0 border-2 border-lotus-blush/30 shadow-md transform hover:scale-110 transition-transform"
              >
                <Image src={photoUrl} alt="highlight" fill sizes="80px" className="object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Emotional Poem Quote */}
        <div className="py-2 space-y-2">
          <p className="text-lg sm:text-2xl font-serif italic text-lotus-cream leading-snug">
            &ldquo;Some places become memories.<br />Some memories become stories.&rdquo;
          </p>
          <span className="text-xs text-lotus-blush/80 tracking-widest uppercase block font-medium">
            A little piece of Malaysia, saved forever.
          </span>
          <span className="text-[11px] text-lotus-rose font-medium block">
            Made with love by Rabby ❤️
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleCopyStory}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-lotus-blush/30 text-lotus-cream text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-lotus-gold" />}
            <span>{copied ? 'Story Copied!' : 'SAVE MY MALAYSIA STORY'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onShare();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-lotus-rose via-lotus-pink to-lotus-gold text-lotus-greenDark text-xs font-bold shadow-rose-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-lotus-blush/40"
          >
            <Share2 className="w-4 h-4 text-lotus-greenDark" />
            <span>SHARE KEEPSAKE LINK</span>
          </button>
        </div>
      </div>
    </div>
  );
}
