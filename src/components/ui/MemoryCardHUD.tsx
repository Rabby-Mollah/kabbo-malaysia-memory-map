'use client';

import React from 'react';
import Image from 'next/image';
import { X, MapPin, Star, Calendar, Music, Heart, Eye } from 'lucide-react';
import { Memory } from '@/types';
import { soundEngine } from '@/utils/audio';

interface MemoryCardHUDProps {
  memory: Memory;
  onClose: () => void;
  onOpenDetails: (memory: Memory) => void;
  onOpenPhotos: (photos: string[], initialIdx?: number) => void;
}

export default function MemoryCardHUD({
  memory,
  onClose,
  onOpenDetails,
  onOpenPhotos,
}: MemoryCardHUDProps) {
  const typeIcons: Record<string, string> = {
    food: '🍜',
    photo: '📸',
    moment: '🌸',
    place: '📍',
  };

  return (
    <div className="absolute bottom-24 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-24 sm:w-96 z-30 max-h-[75vh] flex flex-col animate-fade-in pointer-events-auto">
      <div className="relative rounded-3xl overflow-hidden bg-lotus-greenDeep/95 backdrop-blur-2xl border border-lotus-blush/30 shadow-glass-lg text-lotus-cream max-h-[75vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            soundEngine?.playChime('click');
            onClose();
          }}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md flex items-center justify-center text-lotus-cream/80 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Photo preview */}
        {memory.photos && memory.photos.length > 0 && (
          <div
            onClick={() => onOpenPhotos(memory.photos, 0)}
            className="relative h-36 sm:h-44 w-full cursor-pointer group overflow-hidden"
          >
            <Image
              src={memory.photos[0]}
              alt={memory.title}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-lotus-greenDeep via-transparent to-black/30" />

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-lotus-greenDeep/90 border border-lotus-blush/30 text-lotus-cream backdrop-blur-md flex items-center gap-1">
                <span>{typeIcons[memory.type] || '📍'}</span>
                <span className="capitalize">{memory.type}</span>
              </span>

              {memory.unforgettable && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-lotus-rose/30 border border-lotus-rose/60 text-lotus-blush backdrop-blur-md flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-lotus-rose text-lotus-rose" />
                  <span>Unforgettable</span>
                </span>
              )}
            </div>

            <div className="absolute bottom-2 right-3 text-xs text-lotus-cream/90 font-medium px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
              📸 {memory.photos.length} photos
            </div>
          </div>
        )}

        {/* Content Details */}
        <div className="p-4 sm:p-5 space-y-2.5">
          {/* Location & Rating */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-lotus-gold font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[180px]">{memory.location.name}</span>
            </div>
            <div className="flex items-center gap-1 text-lotus-gold font-semibold">
              <Star className="w-3.5 h-3.5 fill-lotus-gold text-lotus-gold" />
              <span>{memory.rating.toFixed(1)}/5</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-serif font-bold text-lotus-cream tracking-tight">
            {memory.title}
          </h3>

          {/* Description Excerpt */}
          <p className="text-xs sm:text-sm text-lotus-cream/85 italic font-serif leading-relaxed line-clamp-3">
            &ldquo;{memory.description}&rdquo;
          </p>

          {/* Date & Song badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-lotus-cream/60">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-lotus-blush" />
              <span>{memory.date}</span>
            </div>

            {memory.song && (
              <div className="flex items-center gap-1 text-lotus-blush font-medium truncate max-w-[160px]">
                <Music className="w-3 h-3 text-lotus-rose" />
                <span className="truncate">{memory.song.title}</span>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => onOpenDetails(memory)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-lotus-rose via-lotus-pink to-lotus-gold text-lotus-greenDark font-bold text-xs flex items-center justify-center gap-2 shadow-rose-glow hover:opacity-95 active:scale-95 transition-all border border-lotus-blush/40"
            >
              <Eye className="w-3.5 h-3.5 text-lotus-greenDark" />
              <span>VIEW FULL MEMORY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
