'use client';

import React from 'react';
import Image from 'next/image';
import { X, MapPin, Calendar, Star, Heart, Music, Edit3, Trash2, Maximize2 } from 'lucide-react';
import { Memory } from '@/types';
import { soundEngine } from '@/utils/audio';

interface MemoryDetailModalProps {
  memory: Memory | null;
  onClose: () => void;
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
  onOpenPhotos: (photos: string[], initialIdx?: number) => void;
  readOnly?: boolean;
}

export default function MemoryDetailModal({
  memory,
  onClose,
  onEdit,
  onDelete,
  onOpenPhotos,
  readOnly = false,
}: MemoryDetailModalProps) {
  if (!memory) return null;

  const handleDelete = () => {
    if (window.confirm('Delete this precious memory?')) {
      soundEngine?.playChime('click');
      onDelete(memory.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-lotus-forest/95 border border-lotus-rose/30 text-lotus-cream shadow-glass-lg p-5 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-lotus-cream/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Photography Showcase */}
        {memory.photos && memory.photos.length > 0 && (
          <div className="space-y-2">
            <div
              onClick={() => onOpenPhotos(memory.photos, 0)}
              className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden cursor-pointer group border border-lotus-rose/20 shadow-md"
            >
              <Image
                src={memory.photos[0]}
                alt={memory.title}
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-xs font-medium text-lotus-cream flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-lotus-gold" />
                <span>View Fullscreen</span>
              </div>
            </div>

            {/* Thumbnail carousel if multiple photos */}
            {memory.photos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {memory.photos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => onOpenPhotos(memory.photos, idx)}
                    className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 cursor-pointer border border-lotus-rose/25 hover:border-lotus-gold transition-all"
                  >
                    <Image src={photoUrl} alt="thumb" fill sizes="80px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Memory Content Details */}
        <div className="space-y-4">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lotus-rose/15 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-lotus-gold/20 border border-lotus-gold/40 text-lotus-gold text-xs font-semibold capitalize">
                {memory.type}
              </span>
              {memory.unforgettable && (
                <span className="px-3 py-1 rounded-full bg-lotus-rose/25 border border-lotus-rose/50 text-lotus-blush text-xs font-semibold flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-lotus-rose" />
                  <span>Unforgettable Moment</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-lotus-gold font-semibold text-sm">
              <Star className="w-4 h-4 fill-lotus-gold" />
              <span>{memory.rating.toFixed(1)} / 5.0</span>
            </div>
          </div>

          {/* Location & Date */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-lotus-cream/75">
            <div className="flex items-center gap-1.5 text-lotus-cream font-medium">
              <MapPin className="w-4 h-4 text-lotus-rose" />
              <span className="text-sm font-semibold text-lotus-cream">{memory.location.name}</span>
              {memory.location.state && <span className="text-lotus-blush/70">({memory.location.state})</span>}
            </div>

            <div className="flex items-center gap-1 text-lotus-cream/70">
              <Calendar className="w-3.5 h-3.5 text-lotus-gold" />
              <span>{memory.date}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-lotus-cream tracking-tight">
            {memory.title}
          </h1>

          {/* Narrative Story */}
          <div className="p-4 rounded-2xl bg-white/5 border border-lotus-rose/15">
            <p className="text-base text-lotus-cream/95 font-serif italic leading-relaxed whitespace-pre-line">
              &ldquo;{memory.description}&rdquo;
            </p>
          </div>

          {/* Song Badge */}
          {memory.song && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/20 border border-lotus-rose/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-lotus-rose/20 flex items-center justify-center text-lotus-blush">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-lotus-rose tracking-wider font-semibold block">
                    Song of the Moment
                  </span>
                  <span className="text-sm font-medium text-lotus-cream">
                    {memory.song.title} {memory.song.artist ? `• ${memory.song.artist}` : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {memory.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-lotus-blush border border-lotus-rose/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!readOnly && (
          <div className="flex items-center justify-between pt-4 border-t border-lotus-rose/15">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-lotus-blush/80 hover:bg-lotus-rose/20 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4 text-lotus-rose" />
              <span>Delete Memory</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(memory);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lotus-rose hover:bg-lotus-rose/90 text-lotus-cream text-xs font-semibold shadow-md transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Memory</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
