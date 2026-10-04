'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  Upload,
  Star,
  Music,
  Heart,
  MapPin,
  Sparkles,
  Trash2,
  Search,
  Map as MapIcon,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Memory, MemoryType, MemoryTag, LocationCoordinates } from '@/types';
import { MALAYSIAN_DESTINATIONS, projectGeoTo3D } from '@/utils/coordinates';
import { compressImage } from '@/utils/imageCompression';
import { uploadToImgBB, getStoredImgBBKey } from '@/utils/imgbb';
import { uploadToSupabaseStorage } from '@/utils/supabaseClient';
import {
  searchMalaysiaPlaces,
  GeocodedPlace,
  geocodedToCoordinates,
} from '@/utils/geocoding';
import { soundEngine } from '@/utils/audio';
import dynamic from 'next/dynamic';

const MapLocationPickerModal = dynamic(() => import('./MapLocationPickerModal'), {
  ssr: false,
});

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: Memory) => void;
  editingMemory?: Memory | null;
}

export default function AddMemoryModal({
  isOpen,
  onClose,
  onSave,
  editingMemory,
}: AddMemoryModalProps) {
  const [type, setType] = useState<MemoryType>(editingMemory?.type || 'place');
  const [locationName, setLocationName] = useState(editingMemory?.location.name || 'Kuala Lumpur');
  const [selectedCoordinates, setSelectedCoordinates] = useState<LocationCoordinates>(
    editingMemory?.location || MALAYSIAN_DESTINATIONS[0]
  );
  const [searchQuery, setSearchQuery] = useState(editingMemory?.location.name || '');
  const [searchResults, setSearchResults] = useState<GeocodedPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  const [date, setDate] = useState(editingMemory?.date || '2026-10-04');
  const [title, setTitle] = useState(editingMemory?.title || '');
  const [description, setDescription] = useState(editingMemory?.description || '');
  const [rating, setRating] = useState<number>(editingMemory?.rating || 5);
  const [photos, setPhotos] = useState<string[]>(editingMemory?.photos || []);
  const [tags, setTags] = useState<MemoryTag[]>(editingMemory?.tags || ['Adventure']);
  const [songTitle, setSongTitle] = useState(editingMemory?.song?.title || '');
  const [songArtist, setSongArtist] = useState(editingMemory?.song?.artist || '');
  const [unforgettable, setUnforgettable] = useState<boolean>(editingMemory?.unforgettable || false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on click/touch outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Real-time geocoding search as user types
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchMalaysiaPlaces(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setShowSearchResults(true);
    }, 350);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  if (!isOpen) return null;

  const experienceTypes: { id: MemoryType; label: string; icon: string; desc: string }[] = [
    { id: 'place', label: 'Place', icon: '📍', desc: 'A town, viewpoint or landmark' },
    { id: 'food', label: 'Food', icon: '🍜', desc: 'Street stall, kopi, or delicacy' },
    { id: 'photo', label: 'Photo', icon: '📸', desc: 'A visual postcard captured' },
    { id: 'moment', label: 'Special Moment', icon: '❤️', desc: 'An emotion that stayed' },
  ];

  const availableTags: MemoryTag[] = [
    'Food',
    'Adventure',
    'Shopping',
    'Nature',
    'Friends',
    'Funny',
    'Relaxing',
    'Unforgettable',
  ];

  const handleSelectSearchResult = (place: GeocodedPlace) => {
    soundEngine?.playChime('click');
    const coords = geocodedToCoordinates(place);
    setSelectedCoordinates(coords);
    setLocationName(place.name);
    setSearchQuery(place.name);
    setShowSearchResults(false);
  };

  const handleQuickDestinationSelect = (dest: LocationCoordinates) => {
    soundEngine?.playChime('click');
    setSelectedCoordinates(dest);
    setLocationName(dest.name);
    setSearchQuery(dest.name);
    setShowSearchResults(false);
  };

  const handleMapPickerConfirm = (coords: LocationCoordinates) => {
    setSelectedCoordinates(coords);
    setLocationName(coords.name);
    setSearchQuery(coords.name);
  };

  const handleToggleTag = (tag: MemoryTag) => {
    soundEngine?.playChime('click');
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
      if (tag === 'Unforgettable') setUnforgettable(false);
    } else {
      setTags([...tags, tag]);
      if (tag === 'Unforgettable') setUnforgettable(true);
    }
  };

  const handleToggleUnforgettable = () => {
    soundEngine?.playChime('click');
    const newVal = !unforgettable;
    setUnforgettable(newVal);
    if (newVal && !tags.includes('Unforgettable')) {
      setTags([...tags, 'Unforgettable']);
    } else if (!newVal && tags.includes('Unforgettable')) {
      setTags(tags.filter((t) => t !== 'Unforgettable'));
    }
  };

  // Upload handler supporting ImgBB, Supabase, and local compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadStatus('Optimizing photos...');

    try {
      const imgbbKey = getStoredImgBBKey();
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 1. Try ImgBB if key exists
        if (imgbbKey) {
          setUploadStatus(`Uploading photo ${i + 1} to ImgBB...`);
          const imgbbResult = await uploadToImgBB(file, imgbbKey);
          if (imgbbResult.success && imgbbResult.url) {
            newUrls.push(imgbbResult.url);
            continue;
          }
        }

        // 2. Try Supabase Storage
        setUploadStatus(`Saving photo ${i + 1}...`);
        const supaResult = await uploadToSupabaseStorage(file);
        if (supaResult.success && supaResult.url) {
          newUrls.push(supaResult.url);
          continue;
        }

        // 3. Fallback to client-side compressed format
        const compressedUri = await compressImage(file);
        newUrls.push(compressedUri);
      }

      setPhotos((prev) => [...prev, ...newUrls]);
      soundEngine?.playChime('pin');
      setUploadStatus('✓ Photos ready!');
      setTimeout(() => setUploadStatus(''), 2500);
    } catch (err) {
      console.error('Photo upload error', err);
      setUploadStatus('Saved locally');
      setTimeout(() => setUploadStatus(''), 2500);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Use selected real coordinates or compute for custom name
    let finalCoords: LocationCoordinates = selectedCoordinates;
    if (!finalCoords || finalCoords.name !== locationName) {
      const proj = projectGeoTo3D(3.1478, 101.6953);
      finalCoords = {
        name: locationName || searchQuery || 'Malaysia',
        state: 'Malaysia',
        latitude: selectedCoordinates?.latitude || 3.1478,
        longitude: selectedCoordinates?.longitude || 101.6953,
        ...proj,
      };
    }

    const newMemory: Memory = {
      id: editingMemory?.id || `mem-${Date.now()}`,
      title: title || `${locationName} Memory`,
      type,
      location: finalCoords,
      date,
      description: description || 'A memorable day in Malaysia.',
      rating,
      photos:
        photos.length > 0
          ? photos
          : [
              'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80',
            ],
      tags,
      song: songTitle ? { title: songTitle, artist: songArtist || undefined } : undefined,
      unforgettable,
      createdAt: editingMemory?.createdAt || new Date().toISOString(),
    };

    soundEngine?.playChime('stamp');
    onSave(newMemory);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-fade-in select-none">
        <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-lotus-forest/98 border border-lotus-rose/30 text-lotus-cream shadow-glass-lg p-4 sm:p-7 space-y-5 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-lotus-rose/15">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-lotus-gold">
                Digital Keepsake
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-lotus-cream">
                {editingMemory ? 'Edit Memory' : 'Add New Memory & Photos'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-lotus-cream/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. What did you experience? */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-lotus-cream/80">
                What did you experience?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {experienceTypes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      soundEngine?.playChime('click');
                      setType(t.id);
                    }}
                    className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                      type === t.id
                        ? 'bg-lotus-pine border-lotus-gold ring-2 ring-lotus-gold/30 text-lotus-cream shadow-md'
                        : 'bg-white/5 hover:bg-white/10 border-lotus-rose/15 text-lotus-cream/70'
                    }`}
                  >
                    <span className="text-2xl mb-1">{t.icon}</span>
                    <span className="text-xs font-semibold">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. REAL-TIME PLACE SEARCH & LOCATION PICKER */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-lotus-cream/80 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-lotus-rose" />
                  <span>Real Place in Malaysia</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsMapPickerOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-lotus-rose hover:bg-lotus-rose/90 border border-lotus-rose/50 text-[11px] font-semibold text-lotus-cream shadow-sm transition-all"
                >
                  <MapIcon className="w-3 h-3 text-lotus-gold" />
                  <span>🗺️ Pick on Real Map</span>
                </button>
              </div>

              {/* Real-time Search Box */}
              <div ref={searchContainerRef} className="relative">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 w-4 h-4 text-lotus-cream/50 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Search any place in Malaysia (e.g. Batu Caves, Jalan Alor, KLCC...)"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setLocationName(e.target.value);
                    }}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSearchResults(true);
                    }}
                    className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-black/40 border border-lotus-rose/30 text-white placeholder-lotus-cream/40 text-sm focus:outline-none focus:border-lotus-gold focus:ring-1 focus:ring-lotus-gold/50 shadow-inner"
                  />
                  <div className="absolute right-3 flex items-center gap-1.5">
                    {isSearching && (
                      <Loader2 className="w-4 h-4 text-lotus-gold animate-spin" />
                    )}
                    {searchQuery.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setShowSearchResults(false);
                        }}
                        className="p-1 rounded-full text-lotus-cream/70 hover:text-white hover:bg-white/10 transition-colors"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Real-time Suggestions Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-12 z-50 max-h-64 overflow-y-auto rounded-2xl bg-[#06221a] border-2 border-lotus-gold/60 shadow-[0_16px_50px_rgba(0,0,0,0.95)] p-2 space-y-1.5">
                    <div className="flex items-center justify-between px-2 py-1 border-b border-lotus-rose/25 pb-1.5 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-lotus-gold flex items-center gap-1.5">
                        <span>🇲🇾</span>
                        <span>Matching Places ({searchResults.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSearchResults(false)}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/10 text-lotus-blush hover:text-white hover:bg-white/20 transition-colors"
                      >
                        ✕ Close
                      </button>
                    </div>
                    {searchResults.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSearchResult(item)}
                        className="w-full p-2.5 rounded-xl bg-[#0e4234] hover:bg-[#165845] active:bg-[#1f735b] border border-lotus-gold/25 text-left transition-all flex items-start gap-2.5 shadow-sm group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-lotus-gold/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-lotus-gold/30">
                          <MapPin className="w-4 h-4 text-lotus-gold" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs sm:text-sm font-bold text-white block truncate leading-snug">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-lotus-blush font-medium block truncate mt-0.5 opacity-90">
                            {item.displayName}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Empty State when no results found */}
                {showSearchResults && !isSearching && searchQuery.trim().length > 2 && searchResults.length === 0 && (
                  <div className="absolute left-0 right-0 top-12 z-50 rounded-2xl bg-[#06221a] border-2 border-lotus-rose/40 shadow-2xl p-3.5 text-center space-y-1">
                    <p className="text-xs text-white font-semibold">No places found matching &ldquo;{searchQuery}&rdquo;</p>
                    <p className="text-[11px] text-lotus-blush/80">You can still save this as a custom location or tap &ldquo;Pick on Real Map&rdquo; above.</p>
                  </div>
                )}
              </div>

              {/* Selected Coordinates confirmation pill */}
              {selectedCoordinates && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 border border-lotus-rose/20 text-[11px] text-lotus-cream/80">
                  <span className="truncate">
                    📍 {selectedCoordinates.name}{' '}
                    {selectedCoordinates.state ? `(${selectedCoordinates.state})` : ''}
                  </span>
                  <span className="font-mono text-lotus-gold text-[10px] shrink-0 ml-2">
                    {selectedCoordinates.latitude.toFixed(3)}° N, {selectedCoordinates.longitude.toFixed(3)}° E
                  </span>
                </div>
              )}

              {/* Quick Suggestions Chips */}
              <div className="pt-1">
                <span className="text-[10px] uppercase font-bold text-lotus-cream/50 block mb-1">
                  Popular Destinations:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {MALAYSIAN_DESTINATIONS.slice(0, 8).map((dest) => (
                    <button
                      key={dest.name}
                      type="button"
                      onClick={() => handleQuickDestinationSelect(dest)}
                      className={`px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                        selectedCoordinates?.name === dest.name
                          ? 'bg-lotus-gold text-lotus-forest font-bold border-lotus-gold'
                          : 'bg-white/5 text-lotus-cream/70 border-lotus-rose/20 hover:border-lotus-rose/40'
                      }`}
                    >
                      {dest.name.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Date & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-lotus-cream/80">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 border border-lotus-rose/25 text-lotus-cream text-sm focus:outline-none focus:border-lotus-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-lotus-cream/80">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. First night in Kuala Lumpur"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 border border-lotus-rose/25 text-lotus-cream placeholder-lotus-cream/40 text-sm focus:outline-none focus:border-lotus-gold"
                />
              </div>
            </div>

            {/* 4. Notes & Story */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-lotus-cream/80 flex items-center justify-between">
                <span>Personal Notes & Story</span>
                <span className="text-[10px] text-lotus-cream/50">Saved to website</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe the moments, sights, flavors, or feelings..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 border border-lotus-rose/25 text-lotus-cream placeholder-lotus-cream/40 text-sm focus:outline-none focus:border-lotus-gold resize-none"
              />
            </div>

            {/* 5. Rating & Unforgettable Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-2xl bg-white/5 border border-lotus-rose/20">
              <div>
                <span className="text-xs font-medium text-lotus-cream/80 block mb-1.5">Rating</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        soundEngine?.playChime('click');
                        setRating(star);
                      }}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          rating >= star
                            ? 'fill-lotus-gold text-lotus-gold'
                            : 'text-lotus-cream/30 hover:text-lotus-cream/60'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-lotus-gold ml-2">{rating}/5</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleUnforgettable}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                  unforgettable
                    ? 'bg-lotus-rose/30 border-lotus-rose text-lotus-blush ring-2 ring-lotus-rose/30'
                    : 'bg-white/5 border-lotus-rose/20 text-lotus-cream/60 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${unforgettable ? 'fill-lotus-rose text-lotus-rose' : ''}`} />
                <span>Mark as Unforgettable</span>
              </button>
            </div>

            {/* 6. Photos Upload (ImgBB / Cloud / Local) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-lotus-cream/80">
                <span className="flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-lotus-gold" />
                  <span>Upload Travel Photos</span>
                </span>
                {uploadStatus && (
                  <span className="text-[11px] text-lotus-gold font-semibold animate-pulse">
                    {uploadStatus}
                  </span>
                )}
              </div>

              {/* Photo preview strip */}
              {photos.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {photos.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-lotus-rose/25"
                    >
                      <Image src={url} alt="upload" fill className="object-cover" sizes="80px" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white/80 hover:text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-lotus-rose/30 hover:border-lotus-gold cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                <Upload className="w-5 h-5 text-lotus-gold" />
                <span className="text-xs font-medium text-lotus-cream/80">
                  {isUploading ? 'Uploading photos...' : 'Select Photos from Phone / Computer'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploading}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 7. Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-lotus-cream/80">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-lotus-gold text-lotus-forest border-lotus-gold font-semibold shadow-sm'
                          : 'bg-white/5 text-lotus-cream/70 border-lotus-rose/20 hover:border-lotus-rose/40'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 8. Optional Song */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-lotus-cream/80 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-lotus-gold" />
                <span>Song of the Moment (Optional)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Song title (e.g. Terukir Di Bintang)"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/20 border border-lotus-rose/25 text-lotus-cream placeholder-lotus-cream/40 text-xs focus:outline-none focus:border-lotus-gold"
                />
                <input
                  type="text"
                  placeholder="Artist name (e.g. Yuna)"
                  value={songArtist}
                  onChange={(e) => setSongArtist(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/20 border border-lotus-rose/25 text-lotus-cream placeholder-lotus-cream/40 text-xs focus:outline-none focus:border-lotus-gold"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-3 border-t border-lotus-rose/15 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-lotus-cream/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-lotus-gold to-lotus-stamenGold text-lotus-forest font-bold text-xs shadow-gold-glow hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{editingMemory ? 'Save Changes' : 'Save Memory to Website'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Real-time Map Picker Modal */}
      <MapLocationPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onSelectCoordinates={handleMapPickerConfirm}
        initialLat={selectedCoordinates?.latitude || 3.1478}
        initialLng={selectedCoordinates?.longitude || 101.6953}
      />
    </>
  );
}
