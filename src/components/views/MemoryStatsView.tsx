'use client';

import React from 'react';
import { MapPin, Utensils, Camera, Heart, Star, Award, Compass, BarChart3 } from 'lucide-react';
import { Memory } from '@/types';

interface MemoryStatsViewProps {
  memories: Memory[];
  friendName: string;
}

export default function MemoryStatsView({ memories, friendName }: MemoryStatsViewProps) {
  const totalPlaces = new Set(memories.map((m) => m.location.name)).size;
  const foodMemories = memories.filter((m) => m.type === 'food' || m.tags.includes('Food'));
  const totalFoods = foodMemories.length;
  const totalPhotos = memories.reduce((acc, m) => acc + (m.photos?.length || 0), 0);
  const unforgettableCount = memories.filter((m) => m.unforgettable).length;
  const avgRating =
    memories.length > 0
      ? (memories.reduce((acc, m) => acc + m.rating, 0) / memories.length).toFixed(1)
      : '5.0';

  // Group by location
  const byLocation: Record<string, number> = {};
  memories.forEach((m) => {
    byLocation[m.location.name] = (byLocation[m.location.name] || 0) + 1;
  });

  // Group by tags / mood
  const byTag: Record<string, number> = {};
  memories.forEach((m) => {
    m.tags.forEach((tag) => {
      byTag[tag] = (byTag[tag] || 0) + 1;
    });
  });

  // Top destinations sorted
  const sortedDestinations = Object.entries(byLocation)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top tags sorted
  const sortedTags = Object.entries(byTag)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const statsCards = [
    { label: 'Places Visited', value: totalPlaces, icon: MapPin, color: 'text-lotus-gold', bg: 'bg-lotus-gold/15 border-lotus-gold/40' },
    { label: 'Foods Tasted', value: totalFoods, icon: Utensils, color: 'text-[#d96c4d]', bg: 'bg-[#d96c4d]/15 border-[#d96c4d]/40' },
    { label: 'Photos Captured', value: totalPhotos, icon: Camera, color: 'text-[#2a8b79]', bg: 'bg-[#2a8b79]/15 border-[#2a8b79]/40' },
    { label: 'Unforgettable', value: unforgettableCount, icon: Heart, color: 'text-lotus-rose', bg: 'bg-lotus-rose/20 border-lotus-rose/50' },
    { label: 'Avg Rating', value: `${avgRating} ★`, icon: Star, color: 'text-lotus-gold', bg: 'bg-lotus-gold/15 border-lotus-gold/40' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-28 text-lotus-cream space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lotus-gold/20 border border-lotus-gold/40 text-lotus-gold text-xs font-semibold">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>JOURNEY ANALYTICS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-lotus-cream uppercase">
          {friendName}&apos;s Malaysia
        </h2>
        <p className="text-xs sm:text-sm text-lotus-blush/80 font-serif italic max-w-md mx-auto">
          &ldquo;Every statistic is a heartbeat from an unforgettable adventure.&rdquo;
        </p>
      </div>

      {/* Main Stats Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statsCards.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-3xl backdrop-blur-xl border ${st.bg} bg-lotus-pine/85 flex flex-col items-center justify-center text-center shadow-glass transition-transform hover:scale-105`}
            >
              <div className={`p-2.5 rounded-2xl bg-white/5 mb-2 ${st.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-3xl sm:text-4xl font-serif font-bold text-lotus-cream tracking-tight">
                {st.value}
              </span>
              <span className="text-[11px] font-medium text-lotus-cream/70 uppercase tracking-wider mt-1">
                {st.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* 1. Places Visited by Destination */}
        <div className="p-6 rounded-3xl bg-lotus-pine/85 backdrop-blur-xl border border-lotus-rose/20 shadow-glass space-y-4">
          <div className="flex items-center justify-between border-b border-lotus-rose/15 pb-3">
            <h3 className="text-base font-serif font-semibold text-lotus-cream flex items-center gap-2">
              <MapPin className="w-4 h-4 text-lotus-gold" />
              <span>Top Destinations</span>
            </h3>
            <span className="text-xs text-lotus-cream/60">{totalPlaces} locations</span>
          </div>

          <div className="space-y-3">
            {sortedDestinations.map(([name, count]) => {
              const percentage = Math.round((count / memories.length) * 100);
              return (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-lotus-cream/90">{name}</span>
                    <span className="text-lotus-cream/60">{count} memories</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-lotus-gold to-lotus-stamenGold transition-all duration-1000"
                      style={{ width: `${Math.max(15, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Journey Mood & Tag Breakdown */}
        <div className="p-6 rounded-3xl bg-lotus-pine/85 backdrop-blur-xl border border-lotus-rose/20 shadow-glass space-y-4">
          <div className="flex items-center justify-between border-b border-lotus-rose/15 pb-3">
            <h3 className="text-base font-serif font-semibold text-lotus-cream flex items-center gap-2">
              <Heart className="w-4 h-4 text-lotus-rose" />
              <span>Trip Vibes & Tags</span>
            </h3>
            <span className="text-xs text-lotus-cream/60">{Object.keys(byTag).length} categories</span>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {sortedTags.map(([tag, count]) => (
              <div
                key={tag}
                className="px-3.5 py-2 rounded-2xl bg-white/10 border border-lotus-rose/15 flex items-center gap-2 text-xs"
              >
                <span className="font-medium text-lotus-cream">{tag}</span>
                <span className="px-2 py-0.5 rounded-full bg-lotus-rose text-white text-[10px] font-bold">
                  {count}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-lotus-rose/15">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-lotus-rose/15 flex items-center justify-between text-xs">
              <span className="text-lotus-cream/70">Unforgettable Moments Ratio</span>
              <span className="font-semibold text-lotus-rose">
                {memories.length > 0 ? Math.round((unforgettableCount / memories.length) * 100) : 0}% of Trip
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
