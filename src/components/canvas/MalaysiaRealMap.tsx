'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Memory } from '@/types';
import { soundEngine } from '@/utils/audio';
import { Layers, Compass, Plus, Minus } from 'lucide-react';

interface MalaysiaRealMapProps {
  memories: Memory[];
  selectedMemory: Memory | null;
  onSelectMemory: (mem: Memory | null) => void;
  showJourneyRoute?: boolean;
}

type MapLayerType = 'streets' | 'satellite' | 'topo' | 'osm';

export default function MalaysiaRealMap({
  memories,
  selectedMemory,
  onSelectMemory,
  showJourneyRoute = true,
}: MalaysiaRealMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Default to zero-watermark Esri World Street Map
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('streets');
  const [showLayerPicker, setShowLayerPicker] = useState(false);

  // 100% Free, Zero-Watermark Tile Layers for Real Malaysia
  const TILE_LAYERS: Record<MapLayerType, { url: string; attribution: string; maxZoom: number }> = {
    streets: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; StreetMap',
      maxZoom: 18,
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Earthstar Geographics',
      maxZoom: 18,
    },
    topo: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; World Topo Map',
      maxZoom: 18,
    },
    osm: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    },
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center over Malaysia
    const map = L.map(mapContainerRef.current, {
      center: [4.2105, 108.9758],
      zoom: 6,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
    });

    const initialTiles = L.tileLayer(TILE_LAYERS[activeLayer].url, {
      attribution: TILE_LAYERS[activeLayer].attribution,
      maxZoom: TILE_LAYERS[activeLayer].maxZoom,
    }).addTo(map);

    tileLayerRef.current = initialTiles;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    // Initial fit bounds to memories if available
    if (memories.length > 0) {
      setTimeout(() => {
        const bounds = L.latLngBounds(
          memories.map((m) => [m.location.latitude, m.location.longitude])
        );
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 8 });
      }, 250);
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = TILE_LAYERS[activeLayer];
    const newTiles = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(map);

    tileLayerRef.current = newTiles;
  }, [activeLayer]);

  // Update Markers & Journey Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // Elegant Pin HTML layout matching the Lotus botanical palette
    const getPinHtml = (mem: Memory, isSelected: boolean) => {
      const typeIcons: Record<string, string> = {
        food: '🍜',
        photo: '📸',
        moment: '🌸',
        place: '📍',
      };
      const colors: Record<string, { bg: string; border: string; glow: string }> = {
        moment: { bg: '#cf6b7d', border: '#f7dee2', glow: 'rgba(207, 107, 125, 0.6)' }, // Lotus Petal Rose
        food: { bg: '#dfad40', border: '#fff8e7', glow: 'rgba(223, 173, 64, 0.6)' },     // Pollen Seed Gold
        photo: { bg: '#eaafb9', border: '#ffffff', glow: 'rgba(234, 175, 185, 0.6)' },   // Soft Petal Blush
        place: { bg: '#0e4234', border: '#f7dee2', glow: 'rgba(14, 66, 52, 0.6)' },      // Signature Lotus Green
      };

      const c = colors[mem.type] || colors.place;
      const icon = typeIcons[mem.type] || '📍';

      return `
        <div class="relative group cursor-pointer flex flex-col items-center" style="transform: translate(-50%, -100%);">
          ${
            isSelected
              ? `<div class="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-full animate-ping opacity-60" style="background-color: ${c.bg};"></div>`
              : ''
          }
          <div class="relative flex items-center justify-center rounded-2xl shadow-xl transition-all duration-300 group-hover:scale-125"
               style="background: ${c.bg}; border: 2px solid ${c.border}; width: ${
        isSelected ? '42px' : '34px'
      }; height: ${isSelected ? '42px' : '34px'}; box-shadow: 0 4px 14px ${c.glow};">
            <span style="font-size: ${isSelected ? '18px' : '14px'};">${icon}</span>
          </div>
          <div class="w-2.5 h-2.5 rotate-45 -mt-1.5 shadow-sm" style="background: ${c.bg};"></div>
          
          <div class="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-lotus-cream shadow-lg text-center truncate max-w-[120px] transition-all duration-200 pointer-events-none ${
            isSelected ? 'opacity-100 scale-105' : 'opacity-85 group-hover:opacity-100 group-hover:scale-110'
          }"
               style="background: rgba(10, 48, 37, 0.95); border: 1px solid rgba(247, 222, 226, 0.35); backdrop-filter: blur(8px);">
            ${mem.location.name}
          </div>
        </div>
      `;
    };

    // Add Markers
    memories.forEach((mem) => {
      const isSelected = selectedMemory?.id === mem.id;
      const customIcon = L.divIcon({
        className: 'custom-real-pin',
        html: getPinHtml(mem, isSelected),
        iconSize: [40, 52],
        iconAnchor: [20, 52],
      });

      const marker = L.marker([mem.location.latitude, mem.location.longitude], {
        icon: customIcon,
      });

      marker.on('click', () => {
        soundEngine?.playChime('pin');
        onSelectMemory(mem);
        // Smoothly pan & focus on destination
        map.flyTo([mem.location.latitude, mem.location.longitude], 12, {
          duration: 1.0,
        });
      });

      markersGroup.addLayer(marker);
    });

    // Add Journey Route Polyline connecting real coordinates chronologically
    if (showJourneyRoute && memories.length >= 2) {
      const sorted = [...memories].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const latlngs: [number, number][] = sorted.map((m) => [
        m.location.latitude,
        m.location.longitude,
      ]);

      const polyline = L.polyline(latlngs, {
        color: '#f59e0b',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 8',
      }).addTo(map);

      routeLayerRef.current = polyline;
    }
  }, [memories, selectedMemory, showJourneyRoute, onSelectMemory]);

  // Fly to selected memory on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedMemory) return;

    map.flyTo([selectedMemory.location.latitude, selectedMemory.location.longitude], 12, {
      duration: 1.2,
    });
  }, [selectedMemory]);

  const handleRecenter = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    soundEngine?.playChime('click');
    onSelectMemory(null);

    if (memories.length > 0) {
      const bounds = L.latLngBounds(
        memories.map((m) => [m.location.latitude, m.location.longitude])
      );
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 9 });
    } else {
      map.flyTo([4.2105, 108.9758], 6);
    }
  }, [memories, onSelectMemory]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full h-full" data-map-container="true" data-no-pull-refresh="true">
      {/* Real Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" data-map-container="true" data-no-pull-refresh="true" />

      {/* Floating HUD Controls */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
        {/* Layer Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLayerPicker(!showLayerPicker)}
            className="w-10 h-10 rounded-full bg-malay-emeraldDark/90 hover:bg-malay-emerald backdrop-blur-md border border-white/20 text-white shadow-glass flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Real Map Layer"
          >
            <Layers className="w-4 h-4 text-malay-gold" />
          </button>

          {showLayerPicker && (
            <div className="absolute right-12 top-0 w-48 p-2 rounded-2xl bg-malay-emeraldDark/95 backdrop-blur-xl border border-white/20 shadow-glass-lg z-30 text-white space-y-1 animate-fade-in">
              <span className="text-[10px] font-bold uppercase tracking-wider text-malay-gold px-2 pt-1 block">
                Real Map Style
              </span>
              {[
                { id: 'streets', label: '🗺️ Real Streets & Towns' },
                { id: 'satellite', label: '🛰️ Real Satellite' },
                { id: 'topo', label: '🏔️ Topographic Terrain' },
                { id: 'osm', label: '🧭 OpenStreetMap' },
              ].map((lyr) => (
                <button
                  key={lyr.id}
                  onClick={() => {
                    setActiveLayer(lyr.id as MapLayerType);
                    setShowLayerPicker(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    activeLayer === lyr.id
                      ? 'bg-malay-emerald text-white font-semibold'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {lyr.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom In & Out */}
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-full bg-malay-emeraldDark/90 hover:bg-malay-emerald backdrop-blur-md border border-white/20 text-white shadow-glass flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Zoom In"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-full bg-malay-emeraldDark/90 hover:bg-malay-emerald backdrop-blur-md border border-white/20 text-white shadow-glass flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4 text-white" />
        </button>

        {/* Recenter / Fit All Memories */}
        <button
          onClick={handleRecenter}
          className="w-10 h-10 rounded-full bg-malay-emeraldDark/90 hover:bg-malay-emerald backdrop-blur-md border border-white/20 text-white shadow-glass flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Fit All of Malaysia"
        >
          <Compass className="w-4 h-4 text-malay-gold" />
        </button>
      </div>
    </div>
  );
}
