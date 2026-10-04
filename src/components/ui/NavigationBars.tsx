'use client';

import React from 'react';
import { Map, Compass, Images, Heart, BookOpen, BarChart3, Plus } from 'lucide-react';
import { ActiveTab } from '@/types';
import { soundEngine } from '@/utils/audio';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onAddNew: () => void;
  readOnly?: boolean;
}

export function MobileBottomNav({
  activeTab,
  onChangeTab,
  onAddNew,
  readOnly = false,
}: NavigationProps) {
  const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'map', label: 'Map', icon: Map },
    { id: 'journey', label: 'Journey', icon: Compass },
    { id: 'memories', label: 'Album', icon: Images },
    { id: 'unforgettable', label: 'Moments', icon: Heart },
    { id: 'passport', label: 'Passport', icon: BookOpen },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-3 pointer-events-none lg:hidden">
      <div className="max-w-md mx-auto rounded-3xl bg-lotus-greenDeep/95 backdrop-blur-2xl border border-lotus-blush/25 shadow-glass-lg p-1.5 flex items-center justify-between pointer-events-auto">
        {tabs.slice(0, 3).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine?.playChime('click');
                onChangeTab(tab.id);
              }}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-all ${
                isActive ? 'text-lotus-rose font-bold scale-105' : 'text-lotus-cream/60 hover:text-lotus-cream'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* Center Floating Add Button with Lotus Rose & Gold */}
        {!readOnly && (
          <button
            onClick={() => {
              soundEngine?.playChime('click');
              onAddNew();
            }}
            className="w-11 h-11 mx-1 rounded-2xl bg-gradient-to-tr from-lotus-rose via-lotus-pink to-lotus-gold text-lotus-greenDark flex items-center justify-center shadow-rose-glow hover:scale-105 active:scale-95 transition-all shrink-0 border border-lotus-blush/40"
            title="Add Memory"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {tabs.slice(3).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine?.playChime('click');
                onChangeTab(tab.id);
              }}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-all ${
                isActive ? 'text-lotus-rose font-bold scale-105' : 'text-lotus-cream/60 hover:text-lotus-cream'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DesktopSidebarNav({
  activeTab,
  onChangeTab,
  onAddNew,
  readOnly = false,
}: NavigationProps) {
  const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'map', label: 'Real Map', icon: Map },
    { id: 'journey', label: 'Travel Journey', icon: Compass },
    { id: 'memories', label: 'Memory Album', icon: Images },
    { id: 'unforgettable', label: 'Moments That Stayed', icon: Heart },
    { id: 'passport', label: 'Malaysia Passport', icon: BookOpen },
    { id: 'stats', label: 'Her Malaysia Stats', icon: BarChart3 },
  ];

  return (
    <div className="hidden lg:flex fixed left-5 top-24 bottom-24 z-30 flex-col justify-between pointer-events-none">
      <div className="p-2 rounded-3xl bg-lotus-greenDeep/90 backdrop-blur-xl border border-lotus-blush/25 shadow-glass-lg pointer-events-auto flex flex-col gap-1.5 w-56">
        <span className="text-[10px] font-bold uppercase tracking-widest text-lotus-blush px-3 pt-2">
          🌸 EXPLORE KEEPSAKE
        </span>

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine?.playChime('click');
                onChangeTab(tab.id);
              }}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-lotus-green text-lotus-cream border border-lotus-blush/40 shadow-sm'
                  : 'text-lotus-cream/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-lotus-rose' : 'text-lotus-cream/60'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {!readOnly && (
          <div className="pt-2 border-t border-lotus-blush/15 mt-1">
            <button
              onClick={() => {
                soundEngine?.playChime('click');
                onAddNew();
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-lotus-rose via-lotus-pink to-lotus-gold text-lotus-greenDark font-bold text-xs flex items-center justify-center gap-2 shadow-rose-glow hover:scale-105 active:scale-95 transition-all border border-lotus-blush/40"
            >
              <Plus className="w-4 h-4" />
              <span>＋ Add Memory</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
