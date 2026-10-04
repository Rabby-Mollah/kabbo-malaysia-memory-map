'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import AppHeader from '@/components/ui/AppHeader';
import { MobileBottomNav, DesktopSidebarNav } from '@/components/ui/NavigationBars';
import MemoryCardHUD from '@/components/ui/MemoryCardHUD';
import LandingOverlay from '@/components/views/LandingOverlay';
import JourneyTimelineView from '@/components/views/JourneyTimelineView';
import MemoriesGalleryView from '@/components/views/MemoriesGalleryView';
import UnforgettableView from '@/components/views/UnforgettableView';
import PassportView from '@/components/views/PassportView';
import MemoryStatsView from '@/components/views/MemoryStatsView';
import MemoryDetailModal from '@/components/modals/MemoryDetailModal';
import PhotoViewerModal from '@/components/modals/PhotoViewerModal';
import CinematicSummaryModal from '@/components/modals/CinematicSummaryModal';
import ShareModal from '@/components/modals/ShareModal';

import { Memory, TripProfile, ActiveTab } from '@/types';
import {
  loadMemoriesFromStorage,
  loadProfileFromStorage,
  computePassportStamps,
  computeAchievements,
} from '@/utils/storage';
import { soundEngine } from '@/utils/audio';
import { Lock, Map as MapIcon, Box } from 'lucide-react';

const MalaysiaRealMap = dynamic(() => import('@/components/canvas/MalaysiaRealMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#062c21] text-malay-gold">
      <div className="w-12 h-12 rounded-full border-2 border-malay-gold border-t-transparent animate-spin mb-3" />
      <span className="font-serif text-sm tracking-widest uppercase">
        Loading Real Map of Malaysia...
      </span>
    </div>
  ),
});

const Malaysia3DMap = dynamic(() => import('@/components/canvas/Malaysia3DMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#062c21] text-malay-gold">
      <div className="w-12 h-12 rounded-full border-2 border-malay-gold border-t-transparent animate-spin mb-3" />
      <span className="font-serif text-sm tracking-widest uppercase">
        Loading Keepsake Map...
      </span>
    </div>
  ),
});

export default function SharedMemoryPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'her-malaysia-2026';

  const [memories, setMemories] = useState<Memory[]>([]);
  const [profile, setProfile] = useState<TripProfile>(loadProfileFromStorage());
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isLandingMode, setIsLandingMode] = useState<boolean>(true);
  const [mapViewMode, setMapViewMode] = useState<'real' | '3d'>('real');
  const [isSummaryMode, setIsSummaryMode] = useState<boolean>(false);
  const [detailMemory, setDetailMemory] = useState<Memory | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passError, setPassError] = useState<boolean>(false);

  const [photoViewer, setPhotoViewer] = useState<{
    isOpen: boolean;
    photos: string[];
    initialIdx: number;
  }>({
    isOpen: false,
    photos: [],
    initialIdx: 0,
  });

  useEffect(() => {
    const loadedMemories = loadMemoriesFromStorage();
    const loadedProfile = loadProfileFromStorage();

    let derivedName = loadedProfile.friendName;
    if (slug.includes('her-malaysia')) {
      derivedName = loadedProfile.friendName;
    } else {
      const parts = slug.split('-');
      if (parts[0]) {
        derivedName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
    }

    setMemories(loadedMemories);
    setProfile({
      ...loadedProfile,
      friendName: derivedName,
      tripTitle: `${derivedName}'s Malaysia`,
    });

    if (loadedProfile.privacy === 'password' && loadedProfile.password) {
      setIsUnlocked(false);
    }
  }, [slug]);

  // Global Button Click SFX & Auto-play initialization
  useEffect(() => {
    soundEngine?.initHeavenly();

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const clickable = target.closest('button, [role="button"], a[href]');
      if (clickable) {
        soundEngine?.playButtonClick();
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, []);

  const passportStamps = useMemo(() => computePassportStamps(memories), [memories]);
  const achievements = useMemo(() => computeAchievements(memories), [memories]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === profile.password) {
      soundEngine?.playChime('stamp');
      setIsUnlocked(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  if (!isUnlocked) {
    return (
      <main className="w-screen h-screen flex items-center justify-center bg-[#062c21] text-white p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-malay-emeraldDark/90 backdrop-blur-xl border border-white/20 shadow-glass-lg text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-malay-gold/20 border border-malay-gold/40 flex items-center justify-center text-malay-gold shadow-gold-glow">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-malay-gold font-bold">
              Protected Keepsake
            </span>
            <h1 className="text-2xl font-serif font-bold">
              {profile.friendName}&apos;s Malaysia Story
            </h1>
            <p className="text-xs text-white/60">
              This digital keepsake is private. Enter the secret passcode to view.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter passcode..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/20 text-center text-white text-sm outline-none focus:border-malay-gold"
            />

            {passError && (
              <span className="text-xs text-rose-400 block font-medium">
                Incorrect passcode. Please try again.
              </span>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-malay-gold to-malay-goldLight text-malay-emeraldDark font-bold text-xs shadow-gold-glow hover:opacity-95 transition-all"
            >
              Unlock Keepsake
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#062c21]">
      {/* Map (Real or 3D) */}
      <div className="absolute inset-0 z-0">
        {mapViewMode === 'real' ? (
          <MalaysiaRealMap
            memories={memories}
            selectedMemory={selectedMemory}
            onSelectMemory={setSelectedMemory}
            showJourneyRoute={true}
          />
        ) : (
          <Malaysia3DMap
            memories={memories}
            selectedMemory={selectedMemory}
            onSelectMemory={setSelectedMemory}
            isLandingMode={isLandingMode}
            onStartJourney={() => {
              setIsLandingMode(false);
              setActiveTab('map');
            }}
            showJourneyRoute={true}
            isSummaryMode={isSummaryMode}
          />
        )}
      </div>

      {/* Map Mode Switcher Pill */}
      {!isLandingMode && activeTab === 'map' && (
        <div className="absolute top-20 left-4 z-20 flex items-center p-1 rounded-full bg-malay-emeraldDark/90 backdrop-blur-xl border border-white/20 shadow-glass">
          <button
            onClick={() => {
              soundEngine?.playChime('click');
              setMapViewMode('real');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              mapViewMode === 'real'
                ? 'bg-malay-gold text-malay-emeraldDark shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Real Map</span>
          </button>
          <button
            onClick={() => {
              soundEngine?.playChime('click');
              setMapViewMode('3d');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              mapViewMode === '3d'
                ? 'bg-malay-gold text-malay-emeraldDark shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Keepsake</span>
          </button>
        </div>
      )}

      {/* Header (Read-Only) */}
      <AppHeader
        profile={profile}
        onOpenPersonalize={() => {}}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenSummary={() => setIsSummaryMode(true)}
        onAddNew={() => {}}
        onToggleLanding={() => setIsLandingMode(!isLandingMode)}
        isLandingMode={isLandingMode}
        readOnly={true}
      />

      {/* Landing Overlay */}
      {isLandingMode && (
        <LandingOverlay
          profile={profile}
          memoriesCount={memories.length}
          onStartJourney={() => {
            soundEngine?.playHeavenly();
            setIsLandingMode(false);
            setActiveTab('map');
          }}
        />
      )}

      {/* Views */}
      {!isLandingMode && (
        <>
          {activeTab === 'map' && selectedMemory && (
            <MemoryCardHUD
              memory={selectedMemory}
              onClose={() => setSelectedMemory(null)}
              onOpenDetails={(mem) => setDetailMemory(mem)}
              onOpenPhotos={(photos, idx) =>
                setPhotoViewer({ isOpen: true, photos, initialIdx: idx || 0 })
              }
            />
          )}

          {activeTab !== 'map' && (
            <div className="absolute inset-0 z-10 overflow-y-auto pt-20 pb-20 bg-malay-emeraldDark/80 backdrop-blur-md">
              {activeTab === 'journey' && (
                <JourneyTimelineView
                  memories={memories}
                  onOpenDetails={(mem) => setDetailMemory(mem)}
                  onJumpToMap={(mem) => {
                    setActiveTab('map');
                    setSelectedMemory(mem);
                  }}
                  friendName={profile.friendName}
                />
              )}

              {activeTab === 'memories' && (
                <MemoriesGalleryView
                  memories={memories}
                  onOpenDetails={(mem) => setDetailMemory(mem)}
                  onOpenPhotos={(photos, idx) =>
                    setPhotoViewer({ isOpen: true, photos, initialIdx: idx || 0 })
                  }
                  onAddNew={() => {}}
                  friendName={profile.friendName}
                />
              )}

              {activeTab === 'unforgettable' && (
                <UnforgettableView
                  memories={memories}
                  onOpenDetails={(mem) => setDetailMemory(mem)}
                  onOpenPhotos={(photos, idx) =>
                    setPhotoViewer({ isOpen: true, photos, initialIdx: idx || 0 })
                  }
                  friendName={profile.friendName}
                />
              )}

              {activeTab === 'passport' && (
                <PassportView
                  stamps={passportStamps}
                  achievements={achievements}
                  friendName={profile.friendName}
                />
              )}

              {activeTab === 'stats' && (
                <MemoryStatsView
                  memories={memories}
                  friendName={profile.friendName}
                />
              )}
            </div>
          )}

          {/* Navigations (Read-Only) */}
          <DesktopSidebarNav
            activeTab={activeTab}
            onChangeTab={(t) => {
              setActiveTab(t);
              if (t === 'map') setSelectedMemory(null);
            }}
            onAddNew={() => {}}
            readOnly={true}
          />

          <MobileBottomNav
            activeTab={activeTab}
            onChangeTab={(t) => {
              setActiveTab(t);
              if (t === 'map') setSelectedMemory(null);
            }}
            onAddNew={() => {}}
            readOnly={true}
          />
        </>
      )}

      {/* Memory Details */}
      <MemoryDetailModal
        memory={detailMemory}
        onClose={() => setDetailMemory(null)}
        onEdit={() => {}}
        onDelete={() => {}}
        onOpenPhotos={(photos, idx) =>
          setPhotoViewer({ isOpen: true, photos, initialIdx: idx || 0 })
        }
        readOnly={true}
      />

      {/* Fullscreen Photo Lightbox */}
      <PhotoViewerModal
        photos={photoViewer.photos}
        initialIndex={photoViewer.initialIdx}
        isOpen={photoViewer.isOpen}
        onClose={() => setPhotoViewer((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Cinematic Summary */}
      <CinematicSummaryModal
        isOpen={isSummaryMode}
        onClose={() => setIsSummaryMode(false)}
        memories={memories}
        profile={profile}
        onShare={() => setIsShareModalOpen(true)}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
        onUpdatePrivacy={() => {}}
      />
    </main>
  );
}
