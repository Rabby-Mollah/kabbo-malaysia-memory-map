export type MemoryType = 'place' | 'food' | 'photo' | 'moment';

export type MemoryTag =
  | 'Food'
  | 'Adventure'
  | 'Shopping'
  | 'Nature'
  | 'Friends'
  | 'Funny'
  | 'Relaxing'
  | 'Unforgettable';

export interface LocationCoordinates {
  name: string;
  state?: string;
  latitude: number;
  longitude: number;
  // 3D scene coordinates normalized to our Malaysia model
  x?: number;
  z?: number;
}

export interface SongInfo {
  title: string;
  artist?: string;
  url?: string;
}

export interface Memory {
  id: string;
  title: string;
  type: MemoryType;
  location: LocationCoordinates;
  date: string; // ISO date string or formatted (e.g., "2026-10-04")
  description: string;
  rating: number; // 1 - 5
  photos: string[]; // URLs or base64 data URIs
  tags: MemoryTag[];
  song?: SongInfo;
  unforgettable: boolean;
  createdAt: string;
}

export interface PassportStamp {
  id: string;
  name: string;
  locationName: string;
  state: string;
  icon: string;
  landmark: string;
  stampColor: string;
  description: string;
  unlockedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  category: 'memories' | 'food' | 'photos' | 'explorer' | 'special';
  unlocked: boolean;
  progress: number; // 0 to 1
  maxProgress: number;
  currentValue: number;
}

export interface TripProfile {
  friendName: string;
  tripTitle: string;
  tripDates: string;
  subtitle: string;
  dedicationMessage: string;
  avatarUrl: string;
  privacy: 'private' | 'link' | 'password';
  password?: string;
}

export type ActiveTab = 'map' | 'journey' | 'memories' | 'unforgettable' | 'passport' | 'stats';

export type AmbientSoundType = 'off' | 'rain' | 'ocean' | 'tropical' | 'night';
