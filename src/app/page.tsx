'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import AppHeader from '@/components/ui/AppHeader';
import { MobileBottomNav, DesktopSidebarNav } from '@/components/ui/NavigationBars';
import MemoryCardHUD from '@/components/ui/MemoryCardHUD';
import LandingOverlay from '@/components/views/LandingOverlay';
import JourneyTimelineView from '@/components/views/JourneyTimelineView';
import MemoriesGalleryView from '@/components/views/MemoriesGalleryView';
import UnforgettableView from '@/components/views/UnforgettableView';
import PassportView from '@/components/views/PassportView';
import MemoryStatsView from '@/components/views/MemoryStatsView';
import EmptyStateOverlay from '@/components/views/EmptyStateOverlay';

import AddMemoryModal from '@/components/modals/AddMemoryModal';
import MemoryDetailModal from '@/components/modals/MemoryDetailModal';
import PhotoViewerModal from '@/components/modals/PhotoViewerModal';
import CinematicSummaryModal from '@/components/modals/CinematicSummaryModal';
import ShareModal from '@/components/modals/ShareModal';
import PersonalizationModal from '@/components/modals/PersonalizationModal';

import { Memory, TripProfile, ActiveTab } from '@/types';
import {
  loadMemoriesFromStorage,
  saveMemoriesToStorage,
  loadProfileFromStorage,
  saveProfileToStorage,
  computePassportStamps,
  computeAchievements,
  resetToSampleData,
  clearToEmptyState,
} from '@/utils/storage';
import { syncMemoriesToSupabase, fetchMemoriesFromSupabase } from '@/utils/supabaseClient';
import { soundEngine } from '@/utils/audio';
import { Map as MapIcon, Box } from 'lucide-react';

// Dynamic import for Real Map (Leaflet)
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

// Dynamic import for 3D Keepsake Canvas (Three.js)
const Malaysia3DMap = dynamic(() => import('@/components/canvas/Malaysia3DMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#062c21] text-malay-gold">
      <div className="w-12 h-12 rounded-full border-2 border-malay-gold border-t-transparent animate-spin mb-3" />
      <span className="font-serif text-sm tracking-widest uppercase">
        Rendering 3D Miniature Malaysia...
      </span>
    </div>
  ),
});

function MainContent() {
  const searchParams = useSearchParams();
  const isReadOnlyQuery = searchParams.get('view') === 'story';
  const travelerParam = searchParams.get('traveler');

  // Application State
  const [memories, setMemories] = useState<Memory[]>([]);
  const [profile, setProfile] = useState<TripProfile>(loadProfileFromStorage());
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isLandingMode, setIsLandingMode] = useState<boolean>(true);
  const [mapViewMode, setMapViewMode] = useState<'real' | '3d'>('real'); // Real map by default
  const [isSummaryMode, setIsSummaryMode] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [detailMemory, setDetailMemory] = useState<Memory | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Photo viewer modal state
  const [photoViewer, setPhotoViewer] = useState<{
    isOpen: boolean;
    photos: string[];
    initialIdx: number;
  }>({
    isOpen: false,
    photos: [],
    initialIdx: 0,
  });

  // Load memories & sync on mount
  useEffect(() => {
    setIsMounted(true);
    const loadedMemories = loadMemoriesFromStorage();
    setMemories(loadedMemories);

    const loadedProfile = loadProfileFromStorage();
    if (travelerParam) {
      setProfile({
        ...loadedProfile,
        friendName: travelerParam.charAt(0).toUpperCase() + travelerParam.slice(1),
        tripTitle: `${travelerParam.charAt(0).toUpperCase() + travelerParam.slice(1)}'s Malaysia`,
      });
    } else {
      setProfile(loadedProfile);
    }

    // Try background sync with Supabase cloud if available
    fetchMemoriesFromSupabase().then((cloudMems) => {
      if (cloudMems && cloudMems.length > 0) {
        setMemories(cloudMems);
        saveMemoriesToStorage(cloudMems);
      }
    });
  }, [travelerParam]);

  // Derived calculations
  const passportStamps = useMemo(() => computePassportStamps(memories), [memories]);
  const achievements = useMemo(() => computeAchievements(memories), [memories]);

  // Handlers
  const handleStartJourney = () => {
    setIsLandingMode(false);
    setActiveTab('map');
  };

  const handleSelectMemory = (mem: Memory | null) => {
    setSelectedMemory(mem);
  };

  const handleOpenDetails = (mem: Memory) => {
    soundEngine?.playChime('click');
    setDetailMemory(mem);
  };

  const handleOpenPhotos = (photos: string[], initialIdx: number = 0) => {
    soundEngine?.playChime('click');
    setPhotoViewer({
      isOpen: true,
      photos,
      initialIdx,
    });
  };

  const handleSaveMemory = (newOrUpdated: Memory) => {
    let updatedList: Memory[];
    const exists = memories.some((m) => m.id === newOrUpdated.id);
    if (exists) {
      updatedList = memories.map((m) => (m.id === newOrUpdated.id ? newOrUpdated : m));
    } else {
      updatedList = [newOrUpdated, ...memories];
    }

    setMemories(updatedList);
    saveMemoriesToStorage(updatedList);
    syncMemoriesToSupabase(updatedList); // Sync to Supabase

    setSelectedMemory(newOrUpdated);
    setIsLandingMode(false);
    setActiveTab('map');
  };

  const handleDeleteMemory = (id: string) => {
    const updatedList = memories.filter((m) => m.id !== id);
    setMemories(updatedList);
    saveMemoriesToStorage(updatedList);
    syncMemoriesToSupabase(updatedList);
    if (selectedMemory?.id === id) {
      setSelectedMemory(null);
    }
  };

  const handleJumpToMap = (mem: Memory) => {
    setActiveTab('map');
    setSelectedMemory(mem);
    setIsLandingMode(false);
  };

  const handleResetToSample = () => {
    resetToSampleData();
    const refreshed = loadMemoriesFromStorage();
    setMemories(refreshed);
    setProfile(loadProfileFromStorage());
    setSelectedMemory(null);
  };

  const handleClearToEmpty = () => {
    clearToEmptyState();
    setMemories([]);
    setSelectedMemory(null);
  };

  const handleUpdatePrivacy = (privacy: 'private' | 'link' | 'password', password?: string) => {
    const updated = { ...profile, privacy, password };
    setProfile(updated);
    saveProfileToStorage(updated);
  };

  const handleSaveProfile = (newProfile: TripProfile) => {
    setProfile(newProfile);
    saveProfileToStorage(newProfile);
  };

  if (!isMounted) return null;

  const showEmptyState = memories.length === 0 && !isLandingMode && activeTab === 'map';

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#062c21]">
      {/* 1. Map Canvas (Real Leaflet Map or 3D Keepsake Map) */}
      <div className="absolute inset-0 z-0">
        {mapViewMode === 'real' ? (
          <MalaysiaRealMap
            memories={memories}
            selectedMemory={selectedMemory}
            onSelectMemory={handleSelectMemory}
            showJourneyRoute={true}
          />
        ) : (
          <Malaysia3DMap
            memories={memories}
            selectedMemory={selectedMemory}
            onSelectMemory={handleSelectMemory}
            isLandingMode={isLandingMode}
            onStartJourney={handleStartJourney}
            showJourneyRoute={true}
            isSummaryMode={isSummaryMode}
          />
        )}
      </div>

      {/* Map Mode Switcher Pill (Real Map vs 3D Keepsake) */}
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

      {/* 2. Top Header Navigation */}
      <AppHeader
        profile={profile}
        onOpenPersonalize={() => setIsPersonalizeOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenSummary={() => setIsSummaryMode(true)}
        onAddNew={() => {
          setEditingMemory(null);
          setIsAddModalOpen(true);
        }}
        onToggleLanding={() => setIsLandingMode(!isLandingMode)}
        isLandingMode={isLandingMode}
        readOnly={isReadOnlyQuery}
      />

      {/* 3. Landing Page Mode Overlay */}
      {isLandingMode && (
        <LandingOverlay
          profile={profile}
          memoriesCount={memories.length}
          onStartJourney={handleStartJourney}
        />
      )}

      {/* 4. Interactive Views according to activeTab (when not in landing mode) */}
      {!isLandingMode && (
        <>
          {/* MAP TAB: Map is visible full-canvas */}
          {activeTab === 'map' && (
            <>
              {/* Selected Pin Floating 3D Card HUD */}
              {selectedMemory && (
                <MemoryCardHUD
                  memory={selectedMemory}
                  onClose={() => setSelectedMemory(null)}
                  onOpenDetails={handleOpenDetails}
                  onOpenPhotos={handleOpenPhotos}
                />
              )}

              {/* Requirement 22 Empty State Overlay */}
              {showEmptyState && (
                <EmptyStateOverlay
                  onAddFirstMemory={() => {
                    setEditingMemory(null);
                    setIsAddModalOpen(true);
                  }}
                  friendName={profile.friendName}
                />
              )}
            </>
          )}

          {/* OTHER TABS: Overlay scrollable glass cards on top of canvas */}
          {activeTab !== 'map' && (
            <div className="absolute inset-0 z-10 overflow-y-auto pt-20 pb-20 bg-malay-emeraldDark/80 backdrop-blur-md">
              {activeTab === 'journey' && (
                <JourneyTimelineView
                  memories={memories}
                  onOpenDetails={handleOpenDetails}
                  onJumpToMap={handleJumpToMap}
                  friendName={profile.friendName}
                />
              )}

              {activeTab === 'memories' && (
                <MemoriesGalleryView
                  memories={memories}
                  onOpenDetails={handleOpenDetails}
                  onOpenPhotos={handleOpenPhotos}
                  onAddNew={() => {
                    setEditingMemory(null);
                    setIsAddModalOpen(true);
                  }}
                  friendName={profile.friendName}
                />
              )}

              {activeTab === 'unforgettable' && (
                <UnforgettableView
                  memories={memories}
                  onOpenDetails={handleOpenDetails}
                  onOpenPhotos={handleOpenPhotos}
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

          {/* Navigation Bars (Desktop Sidebar + Mobile Bottom Navigation) */}
          <DesktopSidebarNav
            activeTab={activeTab}
            onChangeTab={(t) => {
              setActiveTab(t);
              if (t === 'map') setSelectedMemory(null);
            }}
            onAddNew={() => {
              setEditingMemory(null);
              setIsAddModalOpen(true);
            }}
            readOnly={isReadOnlyQuery}
          />

          <MobileBottomNav
            activeTab={activeTab}
            onChangeTab={(t) => {
              setActiveTab(t);
              if (t === 'map') setSelectedMemory(null);
            }}
            onAddNew={() => {
              setEditingMemory(null);
              setIsAddModalOpen(true);
            }}
            readOnly={isReadOnlyQuery}
          />
        </>
      )}

      {/* 5. Modals & Overlays */}
      {/* Add / Edit Memory Modal */}
      <AddMemoryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMemory(null);
        }}
        onSave={handleSaveMemory}
        editingMemory={editingMemory}
      />

      {/* Memory Detail Modal */}
      <MemoryDetailModal
        memory={detailMemory}
        onClose={() => setDetailMemory(null)}
        onEdit={(mem) => {
          setEditingMemory(mem);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteMemory}
        onOpenPhotos={handleOpenPhotos}
        readOnly={isReadOnlyQuery}
      />

      {/* Full-Screen Photo Experience Lightbox */}
      <PhotoViewerModal
        photos={photoViewer.photos}
        initialIndex={photoViewer.initialIdx}
        isOpen={photoViewer.isOpen}
        onClose={() => setPhotoViewer((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Cinematic Final Summary Modal (✨ Complete My Journey) */}
      <CinematicSummaryModal
        isOpen={isSummaryMode}
        onClose={() => setIsSummaryMode(false)}
        memories={memories}
        profile={profile}
        onShare={() => setIsShareModalOpen(true)}
      />

      {/* Shareable Link & Privacy Settings Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
        onUpdatePrivacy={handleUpdatePrivacy}
      />

      {/* Personalization Modal with Cloud & ImgBB Config */}
      <PersonalizationModal
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
        onResetToSample={handleResetToSample}
        onClearToEmpty={handleClearToEmpty}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen flex items-center justify-center bg-[#062c21] text-malay-gold">
          <div className="w-10 h-10 border-2 border-malay-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MainContent />
    </Suspense>
  );
}
