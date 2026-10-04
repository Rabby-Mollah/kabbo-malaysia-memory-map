'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, MapPin, Star, Heart, Music, ArrowDown, Eye, Compass } from 'lucide-react';
import { Memory } from '@/types';
import { soundEngine } from '@/utils/audio';

interface JourneyTimelineViewProps {
  memories: Memory[];
  onOpenDetails: (memory: Memory) => void;
  onJumpToMap: (memory: Memory) => void;
  friendName: string;
}

export default function JourneyTimelineView({
  memories,
  onOpenDetails,
  onJumpToMap,
  friendName,
}: JourneyTimelineViewProps) {
  // Sort chronologically
  const sortedMemories = [...memories].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group by date
  const grouped: Record<string, Memory[]> = {};
  sortedMemories.forEach((m) => {
    if (!grouped[m.date]) grouped[m.date] = [];
    grouped[m.date].push(m);
  });

  const dates = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const formatDayHeader = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 pb-28 text-lotus-cream space-y-8 animate-fade-in">
      {/* Cinematic Section Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lotus-gold/20 border border-lotus-gold/40 text-lotus-gold text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>CHRONOLOGICAL TRAVEL FILM</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-lotus-cream">
          {friendName}&apos;s Journey
        </h2>
        <p className="text-xs sm:text-sm text-lotus-blush/80 font-serif italic max-w-md mx-auto">
          &ldquo;Every stop, a chapter. Every moment, a verse.&rdquo;
        </p>
      </div>

      {/* Arrival badge */}
      <div className="flex flex-col items-center">
        <div className="px-4 py-2 rounded-full bg-lotus-pine/90 border border-lotus-rose/30 text-lotus-blush text-xs font-semibold flex items-center gap-2 shadow-glass">
          <span>✈️</span>
          <span>Arrived in Malaysia • Touchdown in the Tropics</span>
        </div>
        <div className="w-0.5 h-8 bg-gradient-to-b from-lotus-rose/50 to-lotus-gold/50 my-2" />
      </div>

      {/* Timeline nodes */}
      <div className="relative border-l-2 border-lotus-gold/30 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12">
        {dates.map((dateStr, dIdx) => {
          const dayMemories = grouped[dateStr];
          return (
            <div key={dateStr} className="relative space-y-6">
              {/* Day Milestone Badge on the spine */}
              <div className="absolute -left-[35px] sm:-left-[51px] top-0 flex items-center justify-center">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-lotus-gold border-2 border-lotus-forest flex items-center justify-center text-[10px] sm:text-xs font-bold text-lotus-forest shadow-gold-glow">
                  {dIdx + 1}
                </div>
              </div>

              {/* Day Header */}
              <div className="flex items-center gap-3">
                <span className="text-base sm:text-lg font-serif font-bold text-lotus-gold uppercase tracking-wider">
                  {formatDayHeader(dateStr)}
                </span>
                <span className="text-xs text-lotus-cream/60">
                  {dayMemories.length} {dayMemories.length === 1 ? 'memory' : 'memories'}
                </span>
              </div>

              {/* Cards for this day */}
              <div className="grid grid-cols-1 gap-4">
                {dayMemories.map((mem) => {
                  return (
                    <div
                      key={mem.id}
                      className="group relative rounded-2xl bg-lotus-pine/80 hover:bg-lotus-forest/90 backdrop-blur-xl border border-lotus-rose/20 hover:border-lotus-gold/50 p-4 transition-all duration-300 shadow-glass overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Thumbnail */}
                        {mem.photos && mem.photos.length > 0 && (
                          <div className="relative w-full sm:w-36 h-32 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-lotus-rose/20">
                            <Image
                              src={mem.photos[0]}
                              alt={mem.title}
                              fill
                              sizes="(max-width: 640px) 100vw, 150px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {mem.unforgettable && (
                              <div className="absolute top-1.5 left-1.5 p-1 rounded-full bg-lotus-rose/90 text-white">
                                <Heart className="w-3 h-3 fill-white" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex items-center justify-between text-xs text-lotus-cream/70 mb-1">
                              <span className="flex items-center gap-1 text-lotus-gold font-medium">
                                <MapPin className="w-3 h-3 text-lotus-rose" />
                                {mem.location.name}
                              </span>
                              <span className="flex items-center gap-1 text-lotus-gold font-semibold">
                                <Star className="w-3 h-3 fill-lotus-gold" />
                                {mem.rating.toFixed(1)}
                              </span>
                            </div>

                            <h4 className="text-base font-serif font-semibold text-lotus-cream tracking-tight group-hover:text-lotus-gold transition-colors">
                              {mem.title}
                            </h4>

                            <p className="text-xs text-lotus-cream/80 font-serif italic line-clamp-2 mt-1">
                              &ldquo;{mem.description}&rdquo;
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-lotus-rose/15 text-xs">
                            {mem.song ? (
                              <span className="flex items-center gap-1 text-lotus-blush text-[11px] truncate max-w-[180px]">
                                <Music className="w-3 h-3 text-lotus-rose" />
                                <span className="truncate">{mem.song.title}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-lotus-cream/50">
                                {mem.tags.join(' • ')}
                              </span>
                            )}

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  soundEngine?.playChime('click');
                                  onJumpToMap(mem);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-lotus-cream/80 text-[11px] font-medium transition-colors"
                              >
                                View on 3D Map
                              </button>
                              <button
                                onClick={() => {
                                  soundEngine?.playChime('click');
                                  onOpenDetails(mem);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-lotus-rose hover:bg-lotus-rose/90 text-lotus-cream text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Details</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Connecting arrow down */}
              {dIdx < dates.length - 1 && (
                <div className="flex items-center gap-2 text-lotus-gold/50 text-xs py-1">
                  <ArrowDown className="w-3.5 h-3.5 animate-bounce text-lotus-gold" />
                  <span className="text-[10px] uppercase tracking-widest font-mono">NEXT CHAPTER</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trip Conclusion */}
      <div className="text-center pt-8 border-t border-lotus-rose/20 space-y-2">
        <span className="text-xs uppercase tracking-widest text-lotus-gold font-semibold">
          JOURNEY COMPLETE
        </span>
        <p className="text-sm text-lotus-cream/80 italic font-serif">
          &ldquo;Some places become memories. Some memories become stories.&rdquo;
        </p>
      </div>
    </div>
  );
}
