'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, MapPin, Calendar, Star, Sparkles } from 'lucide-react';
import { Memory } from '@/types';
import { soundEngine } from '@/utils/audio';

interface UnforgettableViewProps {
  memories: Memory[];
  onOpenDetails: (memory: Memory) => void;
  onOpenPhotos: (photos: string[], initialIdx?: number) => void;
  friendName: string;
}

export default function UnforgettableView({
  memories,
  onOpenDetails,
  onOpenPhotos,
  friendName,
}: UnforgettableViewProps) {
  const unforgettableList = memories.filter((m) => m.unforgettable);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 pb-28 text-lotus-cream space-y-10 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lotus-blush/20 border border-lotus-rose/50 text-lotus-blush text-xs font-semibold backdrop-blur-md">
          <Heart className="w-3.5 h-3.5 fill-lotus-rose text-lotus-rose" />
          <span>SACRED BOTANICAL GALLERY</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-lotus-cream">
          The Moments That Stayed
        </h2>
        <p className="text-xs sm:text-base text-lotus-blush/90 font-serif italic max-w-lg mx-auto">
          &ldquo;Like the lotus rising from tranquil waters, these memories blossom forever.&rdquo;
        </p>
      </div>

      {unforgettableList.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-lotus-greenDeep/80 backdrop-blur-md border border-lotus-blush/20 max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-lotus-blush/20 text-lotus-rose flex items-center justify-center mx-auto text-2xl shadow-rose-glow">
            🌸
          </div>
          <h3 className="text-lg font-serif font-bold text-lotus-cream">No unforgettable moments yet</h3>
          <p className="text-xs text-lotus-cream/60">
            Tap the heart icon when adding or editing a memory to preserve your most profound experiences in this botanical keepsake album.
          </p>
        </div>
      ) : (
        /* Floating Polaroid Cards Grid styled like the Lotus editorial poster */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {unforgettableList.map((mem, idx) => {
            const rotationAngles = [-2, 1.5, -1, 2, -1.8, 1.2];
            const rot = rotationAngles[idx % rotationAngles.length];

            return (
              <div
                key={mem.id}
                onClick={() => {
                  soundEngine?.playChime('click');
                  onOpenDetails(mem);
                }}
                style={{
                  transform: `rotate(${rot}deg)`,
                }}
                className="group relative cursor-pointer bg-lotus-cream text-lotus-greenDeep p-4 pb-6 rounded-2xl shadow-2xl hover:shadow-lotus-glow hover:scale-105 hover:rotate-0 transition-all duration-300 border border-lotus-sand/60"
              >
                {/* Lotus Petal Tape Motif */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-lotus-blush/80 backdrop-blur-sm border border-lotus-pink/50 rotate-1 shadow-sm rounded-sm" />

                {/* Photo frame */}
                <div className="relative h-60 w-full rounded-xl overflow-hidden bg-lotus-greenDark border border-lotus-sand">
                  {mem.photos && mem.photos.length > 0 ? (
                    <Image
                      src={mem.photos[0]}
                      alt={mem.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 350px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🌸
                    </div>
                  )}

                  {/* Lotus Rose heart badge */}
                  <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-lotus-rose/90 backdrop-blur-md text-white shadow-md">
                    <Heart className="w-3.5 h-3.5 fill-white" />
                  </div>

                  {/* Rating pill */}
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-lotus-greenDark/80 backdrop-blur-md text-lotus-gold text-[11px] font-bold flex items-center gap-1 border border-lotus-gold/30">
                    <Star className="w-3 h-3 fill-lotus-gold text-lotus-gold" />
                    <span>{mem.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Editorial typography */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-lotus-green/70">
                    <span className="flex items-center gap-1 text-lotus-greenDeep font-bold truncate max-w-[160px]">
                      <MapPin className="w-3 h-3 text-lotus-gold" />
                      {mem.location.name}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-lotus-green/60">
                      <Calendar className="w-3 h-3 text-lotus-rose" />
                      {mem.date}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-lotus-greenDeep tracking-tight line-clamp-1 group-hover:text-lotus-rose transition-colors">
                    {mem.title}
                  </h3>

                  <p className="text-xs text-stone-700 font-serif italic line-clamp-2 leading-relaxed">
                    &ldquo;{mem.description}&rdquo;
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-lotus-sand/60 text-[11px]">
                    <span className="text-lotus-rose font-bold">
                      View memory →
                    </span>
                    <span className="text-stone-500">
                      📸 {mem.photos?.length || 1} photos
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
