'use client';

import React from 'react';
import { PassportStamp, Achievement } from '@/types';
import { CheckCircle2, Lock, Award, Sparkles } from 'lucide-react';
import { soundEngine } from '@/utils/audio';

interface PassportViewProps {
  stamps: PassportStamp[];
  achievements: Achievement[];
  friendName: string;
}

export default function PassportView({ stamps, achievements, friendName }: PassportViewProps) {
  const unlockedStamps = stamps.filter((s) => s.unlockedAt);
  const completionPercentage = Math.round((unlockedStamps.length / stamps.length) * 100);

  const handleStampClick = (stamp: PassportStamp) => {
    if (stamp.unlockedAt) {
      soundEngine?.playChime('stamp');
    } else {
      soundEngine?.playChime('click');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-28 text-lotus-cream space-y-10 animate-fade-in">
      {/* Title & Passport Badge */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-lotus-blush/20 border border-lotus-rose/40 text-lotus-blush text-xs font-semibold backdrop-blur-md">
          <span>🌸</span>
          <span className="tracking-wider">OFFICIAL BOTANICAL PASSPORT</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-lotus-cream uppercase">
          {friendName}&apos;s Passport
        </h2>
        <p className="text-xs sm:text-sm text-lotus-blush/90 font-serif italic max-w-md mx-auto">
          &ldquo;Every stamp is a blossom unlocked across the Malaysian map.&rdquo;
        </p>

        {/* Collection progress */}
        <div className="max-w-xs mx-auto pt-2 space-y-1.5">
          <div className="flex justify-between text-xs text-lotus-cream/70">
            <span>Stamps Collected</span>
            <span className="font-semibold text-lotus-rose">
              {unlockedStamps.length} of {stamps.length} ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lotus-rose via-lotus-pink to-lotus-gold transition-all duration-700"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Realistic Vintage Passport Book */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0a3025] to-[#041a13] border-2 border-lotus-blush/30 shadow-2xl p-6 sm:p-10 space-y-8 overflow-hidden">
        {/* Gold Foil Crest / Emblem */}
        <div className="flex flex-col items-center justify-center border-b border-lotus-blush/20 pb-6 text-center space-y-2">
          <div className="w-14 h-14 rounded-full border-2 border-lotus-gold/70 flex items-center justify-center text-2xl shadow-gold-glow">
            🇲🇾
          </div>
          <span className="text-sm uppercase tracking-widest font-serif font-bold text-lotus-gold">
            FEDERATION OF MALAYSIA
          </span>
          <span className="text-[11px] uppercase tracking-wider text-lotus-blush/80">
            PERSONAL TRAVEL RECORD • SACRED LOTUS EDITION
          </span>
        </div>

        {/* Stamps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {stamps.map((stamp) => {
            const isUnlocked = Boolean(stamp.unlockedAt);

            return (
              <div
                key={stamp.id}
                onClick={() => handleStampClick(stamp)}
                className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 text-center flex flex-col items-center justify-between min-h-[160px] cursor-pointer ${
                  isUnlocked
                    ? 'border-dashed border-lotus-rose/60 bg-lotus-rose/10 hover:bg-lotus-rose/20 hover:scale-105 shadow-sm'
                    : 'border-white/10 bg-white/5 opacity-50 hover:opacity-75'
                }`}
              >
                {/* Circular Rubber Stamp Design in Lotus Rose */}
                <div
                  className={`relative w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center p-2 transition-transform duration-500 ${
                    isUnlocked
                      ? 'border-lotus-rose text-lotus-rose group-hover:rotate-6'
                      : 'border-white/20 text-white/40'
                  }`}
                  style={{
                    boxShadow: isUnlocked ? '0 0 16px rgba(207, 107, 125, 0.3)' : 'none',
                  }}
                >
                  <span className="text-2xl mb-0.5">{stamp.icon}</span>
                  <span className="text-[9px] font-bold uppercase tracking-tighter truncate max-w-[70px]">
                    {stamp.locationName.split(' ')[0]}
                  </span>

                  {isUnlocked && (
                    <div className="absolute -bottom-1 text-[8px] bg-lotus-rose text-lotus-cream font-bold px-1.5 rounded-full shadow-sm">
                      VERIFIED
                    </div>
                  )}
                </div>

                {/* Stamp Details */}
                <div className="pt-2 space-y-0.5">
                  <h4 className="text-xs font-serif font-bold text-lotus-cream truncate max-w-[140px]">
                    {stamp.locationName}
                  </h4>
                  <p className="text-[10px] text-lotus-cream/50 truncate max-w-[140px]">
                    {stamp.landmark}
                  </p>

                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-lotus-gold font-medium pt-1">
                      <CheckCircle2 className="w-3 h-3 text-lotus-rose" />
                      <span>{stamp.unlockedAt}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-lotus-cream/40 pt-1">
                      <Lock className="w-3 h-3" />
                      <span>Unvisited</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collectible Achievements Badges */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-lotus-blush/20 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-lotus-gold" />
            <h3 className="text-xl font-serif font-bold text-lotus-cream">
              Expedition Achievements
            </h3>
          </div>
          <span className="text-xs text-lotus-blush/70">
            {achievements.filter((a) => a.unlocked).length} of {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border backdrop-blur-xl transition-all ${
                ach.unlocked
                  ? 'bg-lotus-greenDeep/90 border-lotus-blush/35 shadow-glass'
                  : 'bg-white/5 border-white/10 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shrink-0">
                  {ach.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-serif font-bold text-lotus-cream">
                      {ach.title}
                    </h4>
                    {ach.unlocked ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-lotus-rose/25 text-lotus-blush font-bold border border-lotus-rose/40">
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="text-[10px] text-lotus-cream/40">
                        {Math.round(ach.progress * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-lotus-cream/70 leading-relaxed">
                    {ach.description}
                  </p>
                  <span className="text-[10px] text-lotus-cream/40 block">
                    Target: {ach.requirement}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
