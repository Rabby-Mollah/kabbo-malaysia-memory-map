import { Memory, PassportStamp, Achievement, TripProfile } from '@/types';
import {
  DEFAULT_MEMORIES,
  DEFAULT_PASSPORT_STAMPS,
  INITIAL_ACHIEVEMENTS,
  DEFAULT_TRIP_PROFILE,
} from '@/data/defaultMemories';
import { syncToCloud } from './supabase';

const STORAGE_KEYS = {
  MEMORIES: 'malaysia_memories_v2',
  PROFILE: 'malaysia_profile_v1',
  UNLOCKED_ACHIEVEMENTS: 'malaysia_achievements_v1',
  FRESH_RESET: 'malaysia_memories_cleared_v2',
};

export function loadMemoriesFromStorage(): Memory[] {
  if (typeof window === 'undefined') return [];
  try {
    // One-time fresh wipe so existing sessions receive the clean, fresh look
    if (localStorage.getItem(STORAGE_KEYS.FRESH_RESET) !== 'true') {
      localStorage.removeItem('malaysia_memories_v1');
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.FRESH_RESET, 'true');
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load memories from localStorage', e);
    return [];
  }
}

export function saveMemoriesToStorage(memories: Memory[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    syncToCloud({ memories, profile: loadProfileFromStorage() });
  } catch (e) {
    console.error('Failed to save memories to localStorage', e);
  }
}

export function loadProfileFromStorage(): TripProfile {
  if (typeof window === 'undefined') return DEFAULT_TRIP_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_TRIP_PROFILE));
      return DEFAULT_TRIP_PROFILE;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load profile', e);
    return DEFAULT_TRIP_PROFILE;
  }
}

export function saveProfileToStorage(profile: TripProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    syncToCloud({ memories: loadMemoriesFromStorage(), profile });
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

/**
 * Calculates which passport stamps are unlocked based on memories recorded.
 */
export function computePassportStamps(memories: Memory[]): PassportStamp[] {
  return DEFAULT_PASSPORT_STAMPS.map((stamp) => {
    // Find if any memory matches this location
    const matchingMemories = memories.filter((m) =>
      m.location.name.toLowerCase().includes(stamp.locationName.toLowerCase()) ||
      stamp.locationName.toLowerCase().includes(m.location.name.toLowerCase()) ||
      (stamp.state && m.location.state && m.location.state.toLowerCase() === stamp.state.toLowerCase())
    );

    if (matchingMemories.length > 0) {
      // Sort to get earliest date
      const earliest = [...matchingMemories].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )[0];
      return {
        ...stamp,
        unlockedAt: earliest.date,
      };
    }
    return stamp;
  });
}

/**
 * Dynamically computes achievement statuses and progress.
 */
export function computeAchievements(memories: Memory[]): Achievement[] {
  const totalMemories = memories.length;
  const foodCount = memories.filter((m) => m.type === 'food' || m.tags.includes('Food')).length;
  const totalPhotos = memories.reduce((acc, m) => acc + (m.photos?.length || 0), 0);
  const uniquePlaces = new Set(memories.map((m) => m.location.name)).size;
  const unforgettableCount = memories.filter((m) => m.unforgettable).length;

  const hasPeninsula = memories.some((m) => (m.location.longitude || 101) < 105);
  const hasBorneo = memories.some((m) => (m.location.longitude || 101) >= 105);
  const completedBoth = hasPeninsula && hasBorneo;

  return INITIAL_ACHIEVEMENTS.map((ach) => {
    let unlocked = false;
    let currentValue = 0;
    let maxProgress = ach.maxProgress;

    switch (ach.id) {
      case 'ach-first-memory':
        currentValue = totalMemories;
        maxProgress = 1;
        unlocked = totalMemories >= 1;
        break;
      case 'ach-food-explorer':
        currentValue = foodCount;
        maxProgress = 5;
        unlocked = foodCount >= 5;
        break;
      case 'ach-memory-collector':
        currentValue = totalPhotos;
        maxProgress = 15;
        unlocked = totalPhotos >= 15;
        break;
      case 'ach-explorer':
        currentValue = uniquePlaces;
        maxProgress = 5;
        unlocked = uniquePlaces >= 5;
        break;
      case 'ach-unforgettable':
        currentValue = unforgettableCount;
        maxProgress = 1;
        unlocked = unforgettableCount >= 1;
        break;
      case 'ach-malaysia-journey':
        currentValue = completedBoth ? 1 : 0;
        maxProgress = 1;
        unlocked = completedBoth;
        break;
    }

    const progress = Math.min(1, currentValue / (maxProgress || 1));

    return {
      ...ach,
      currentValue,
      maxProgress,
      progress,
      unlocked,
    };
  });
}

/**
 * Resets storage back to default sample memories.
 */
export function resetToSampleData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(DEFAULT_MEMORIES));
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_TRIP_PROFILE));
}

/**
 * Clears memories to true empty state (Requirement 22).
 */
export function clearToEmptyState(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify([]));
}
