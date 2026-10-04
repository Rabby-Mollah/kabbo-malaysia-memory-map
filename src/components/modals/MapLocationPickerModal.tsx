'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Check, MapPin, Search, Loader2 } from 'lucide-react';
import { LocationCoordinates } from '@/types';
import { reverseGeocodeMalaysia } from '@/utils/geocoding';
import { projectGeoTo3D } from '@/utils/coordinates';
import { soundEngine } from '@/utils/audio';

interface MapLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCoordinates: (coords: LocationCoordinates) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapLocationPickerModal({
  isOpen,
  onClose,
  onSelectCoordinates,
  initialLat = 3.1478,
  initialLng = 101.6953,
}: MapLocationPickerModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [placeName, setPlaceName] = useState('Selected Location');
  const [placeState, setPlaceState] = useState('Malaysia');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri &mdash; StreetMap',
          maxZoom: 18,
        }
      ).addTo(map);

      // Custom draggable marker (Lotus Pollen Gold)
      const pinIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="transform: translate(-50%, -100%);">
            <div style="background: #dfad40; border: 2.5px solid #ffffff; width: 36px; height: 36px; border-radius: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35);">
              <span style="font-size: 16px;">📍</span>
            </div>
            <div style="width: 8px; height: 8px; background: #dfad40; transform: rotate(45deg); margin: -4px auto 0;"></div>
          </div>
        `,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        handleUpdateLocation(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        soundEngine?.playChime('pin');
        marker.setLatLng(e.latlng);
        handleUpdateLocation(e.latlng.lat, e.latlng.lng);
      });

      markerRef.current = marker;
      leafletMapRef.current = map;

      // Initial reverse geocode
      handleUpdateLocation(initialLat, initialLng);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isOpen, initialLat, initialLng]);

  const handleUpdateLocation = async (lat: number, lng: number) => {
    setCurrentLat(lat);
    setCurrentLng(lng);
    setIsReverseGeocoding(true);

    const place = await reverseGeocodeMalaysia(lat, lng);
    if (place) {
      setPlaceName(place.name);
      setPlaceState(place.state || 'Malaysia');
    } else {
      setPlaceName(`Pinned Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
      setPlaceState('Malaysia');
    }
    setIsReverseGeocoding(false);
  };

  const handleConfirm = () => {
    soundEngine?.playChime('stamp');
    const proj = projectGeoTo3D(currentLat, currentLng);
    onSelectCoordinates({
      name: placeName,
      state: placeState,
      latitude: currentLat,
      longitude: currentLng,
      ...proj,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-6 animate-fade-in text-lotus-cream select-none">
      <div className="relative w-full max-w-2xl h-[90vh] sm:h-[85vh] rounded-3xl bg-lotus-forest/98 border border-lotus-rose/30 shadow-glass-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3.5 sm:p-5 flex items-center justify-between border-b border-lotus-rose/15 shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-lotus-gold block">
              Real-Time Location Picker
            </span>
            <h3 className="text-base sm:text-xl font-serif font-bold text-lotus-cream truncate max-w-[230px] sm:max-w-none">
              Tap Anywhere in Malaysia to Drop a Pin
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-lotus-cream/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Canvas */}
        <div className="relative flex-1 w-full bg-stone-900">
          <div ref={mapRef} className="w-full h-full z-0" />

          {/* Center Crosshair Hint */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-xs font-medium text-lotus-cream border border-lotus-rose/25 pointer-events-none shadow-md">
            Tap anywhere or drag the pin
          </div>
        </div>

        {/* Footer Selected Place Info & Confirm Button */}
        <div className="p-3.5 sm:p-5 bg-lotus-pine/95 border-t border-lotus-rose/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-lotus-gold/20 flex items-center justify-center text-lotus-gold shrink-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-serif font-bold text-white truncate max-w-[180px] sm:max-w-sm block">
                  {placeName}
                </span>
                {isReverseGeocoding && (
                  <Loader2 className="w-3.5 h-3.5 text-lotus-gold animate-spin shrink-0" />
                )}
              </div>
              <span className="text-[10px] sm:text-xs text-lotus-cream/70 truncate block max-w-[200px] sm:max-w-sm">
                {placeState} • {currentLat.toFixed(4)}° N, {currentLng.toFixed(4)}° E
              </span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-lotus-gold to-lotus-stamenGold text-lotus-forest font-bold text-xs shadow-gold-glow hover:opacity-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Check className="w-4 h-4" />
            <span>Confirm This Place</span>
          </button>
        </div>
      </div>
    </div>
  );
}
