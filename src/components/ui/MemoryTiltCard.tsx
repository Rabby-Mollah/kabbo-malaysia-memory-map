'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { MapPin, Star, Calendar, Music, Heart, Eye } from 'lucide-react';
import { Memory } from '@/types';

interface MemoryTiltCardProps {
  memory: Memory;
  onOpenDetails: (memory: Memory) => void;
  onOpenPhotos?: (photos: string[], initialIdx?: number) => void;
  compact?: boolean;
}

export default function MemoryTiltCard({
  memory,
  onOpenDetails,
  onOpenPhotos,
  compact = false,
}: MemoryTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -10;
    const tiltY = ((x - centerX) / centerX) * 10;
    setRotX(tiltX);
    setRotY(tiltY);
  };

  const handleMouseLeave = () => {
    setRotX(0);
    setRotY(0);
    setIsHovered(false);
  };

  const typeBadgeColors: Record<string, { bg: string; text: string; icon: string }> = {
    moment: { bg: 'bg-lotus-rose/25 border-lotus-rose/50', text: 'text-lotus-blush', icon: '🌸' },
    food: { bg: 'bg-lotus-gold/25 border-lotus-gold/50', text: 'text-lotus-goldLight', icon: '🍜' },
    photo: { bg: 'bg-lotus-pink/25 border-lotus-pink/50', text: 'text-lotus-blush', icon: '📸' },
    place: { bg: 'bg-lotus-green/45 border-lotus-blush/30', text: 'text-lotus-cream', icon: '📍' },
  };

  const badge = typeBadgeColors[memory.type] || typeBadgeColors.place;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${
          isHovered ? 1.02 : 1
        }, ${isHovered ? 1.02 : 1}, 1)`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
      }}
      className={`group relative rounded-3xl overflow-hidden bg-lotus-greenDeep/90 backdrop-blur-xl border border-lotus-blush/25 shadow-glass-lg transition-all duration-300 ${
        compact ? 'w-72 sm:w-80' : 'w-full'
      }`}
    >
      {/* Top Image Banner */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-lotus-greenDark">
        {memory.photos && memory.photos.length > 0 ? (
          <Image
            src={memory.photos[0]}
            alt={memory.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lotus-greenDeep to-lotus-greenDark">
            <span className="text-4xl">🌸</span>
          </div>
        )}

        {/* Ambient Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-lotus-greenDark via-lotus-greenDark/30 to-black/20" />

        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${badge.bg} ${badge.text}`}
          >
            <span>{badge.icon}</span>
            <span className="capitalize">{memory.type}</span>
          </span>

          {memory.unforgettable && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-lotus-rose/30 border border-lotus-rose/60 text-lotus-blush backdrop-blur-md">
              <Heart className="w-3 h-3 fill-lotus-rose text-lotus-rose" />
              <span>Unforgettable</span>
            </span>
          )}
        </div>

        {/* Photos count pill */}
        {memory.photos && memory.photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenPhotos?.(memory.photos, 0);
            }}
            className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-[11px] font-medium text-lotus-cream border border-lotus-blush/20 transition-colors"
          >
            📸 {memory.photos.length} photos
          </button>
        )}

        {/* Star Rating & Date banner at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-lotus-cream/90">
          <div className="flex items-center gap-1 text-lotus-gold font-semibold">
            <Star className="w-3.5 h-3.5 fill-lotus-gold text-lotus-gold" />
            <span>{memory.rating.toFixed(1)}/5</span>
          </div>

          <div className="flex items-center gap-1 text-lotus-cream/70">
            <Calendar className="w-3 h-3 text-lotus-blush" />
            <span>{memory.date}</span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Location Pin */}
          <div className="flex items-center gap-1.5 text-lotus-blush text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-lotus-gold" />
            <span className="truncate">{memory.location.name}</span>
            {memory.location.state && (
              <span className="text-lotus-cream/40">• {memory.location.state}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-serif font-bold text-lotus-cream tracking-tight line-clamp-1 group-hover:text-lotus-blush transition-colors">
            {memory.title}
          </h3>

          {/* Quote / Memory excerpt */}
          <p className="text-xs sm:text-sm text-lotus-cream/80 italic font-serif line-clamp-2 leading-relaxed">
            &ldquo;{memory.description}&rdquo;
          </p>

          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {memory.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-lotus-blush/10 text-lotus-blush border border-lotus-blush/20"
                >
                  #{tag}
                </span>
              ))}
              {memory.tags.length > 3 && (
                <span className="text-[10px] text-lotus-cream/50 self-center">
                  +{memory.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Song Badge if attached */}
          {memory.song && (
            <div className="flex items-center gap-1.5 text-[11px] text-lotus-blush/80 pt-1">
              <Music className="w-3 h-3 text-lotus-rose" />
              <span className="truncate">
                {memory.song.title} {memory.song.artist ? `— ${memory.song.artist}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* View Memory CTA Button */}
        <div className="pt-4 border-t border-lotus-blush/15 mt-3 flex items-center justify-between">
          <button
            onClick={() => onOpenDetails(memory)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-lotus-green hover:bg-lotus-greenLight border border-lotus-blush/30 text-lotus-cream text-xs font-semibold shadow-sm transition-all hover:shadow-lotus-glow active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-lotus-gold" />
            <span>VIEW MEMORY</span>
          </button>
        </div>
      </div>
    </div>
  );
}
