'use client';

import React, { useState } from 'react';
import MemoryTiltCard from '@/components/ui/MemoryTiltCard';
import { Memory, MemoryType, MemoryTag } from '@/types';
import { Filter, Sparkles, Plus } from 'lucide-react';
import { soundEngine } from '@/utils/audio';

interface MemoriesGalleryViewProps {
  memories: Memory[];
  onOpenDetails: (memory: Memory) => void;
  onOpenPhotos: (photos: string[], initialIdx?: number) => void;
  onAddNew: () => void;
  friendName: string;
}

export default function MemoriesGalleryView({
  memories,
  onOpenDetails,
  onOpenPhotos,
  onAddNew,
  friendName,
}: MemoriesGalleryViewProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const filterTypes = [
    { id: 'all', label: 'All Memories' },
    { id: 'place', label: '📍 Places' },
    { id: 'food', label: '🍜 Foods' },
    { id: 'photo', label: '📸 Photos' },
    { id: 'moment', label: '❤️ Moments' },
  ];

  const filterTags: MemoryTag[] = [
    'Food',
    'Adventure',
    'Shopping',
    'Nature',
    'Friends',
    'Funny',
    'Relaxing',
    'Unforgettable',
  ];

  const filteredMemories = memories.filter((m) => {
    const matchesType = selectedType === 'all' || m.type === selectedType;
    const matchesTag = selectedTag === 'all' || m.tags.includes(selectedTag as MemoryTag);
    return matchesType && matchesTag;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 pb-28 text-lotus-cream space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-lotus-rose/15 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-lotus-gold">
            The Digital Keepsake
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-lotus-cream">
            {friendName}&apos;s Memory Album
          </h2>
          <p className="text-xs text-lotus-blush/70 mt-1">
            {memories.length} memories preserved • Swipe or move mouse to experience 3D perspective
          </p>
        </div>

        <button
          onClick={() => {
            soundEngine?.playChime('click');
            onAddNew();
          }}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-lotus-gold to-lotus-stamenGold text-lotus-forest font-semibold text-xs shadow-gold-glow flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Memory</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-3">
        {/* Type pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundEngine?.playChime('click');
                setSelectedType(t.id);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedType === t.id
                  ? 'bg-lotus-pine text-lotus-cream border border-lotus-gold/60 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-lotus-cream/70 border border-lotus-rose/20'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tag pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => {
              soundEngine?.playChime('click');
              setSelectedTag('all');
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 transition-all ${
              selectedTag === 'all'
                ? 'bg-lotus-gold text-lotus-forest font-bold'
                : 'bg-white/5 text-lotus-cream/50 hover:text-white'
            }`}
          >
            #All Tags
          </button>
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                soundEngine?.playChime('click');
                setSelectedTag(tag);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 transition-all ${
                selectedTag === tag
                  ? 'bg-lotus-gold text-lotus-forest font-bold'
                  : 'bg-white/5 text-lotus-cream/50 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-lotus-pine/60 border border-lotus-rose/20 max-w-md mx-auto space-y-3">
          <p className="text-sm text-lotus-cream/60">
            {memories.length === 0
              ? 'Your photo album is fresh and ready for memories.'
              : 'No memories found in this category.'}
          </p>
          {memories.length === 0 && (
            <button
              onClick={() => {
                soundEngine?.playChime('click');
                onAddNew();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-lotus-gold to-lotus-stamenGold text-lotus-forest text-xs font-bold shadow-gold-glow hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pin First Memory</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredMemories.map((mem) => (
            <MemoryTiltCard
              key={mem.id}
              memory={mem}
              onOpenDetails={onOpenDetails}
              onOpenPhotos={onOpenPhotos}
            />
          ))}
        </div>
      )}
    </div>
  );
}
