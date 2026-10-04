import { LocationCoordinates } from '@/types';
import { projectGeoTo3D } from './coordinates';

export interface GeocodedPlace {
  name: string;
  displayName: string;
  state?: string;
  latitude: number;
  longitude: number;
  type?: string;
}

/**
 * Searches real-time places in Malaysia using OpenStreetMap Nominatim.
 * Filtered specifically to Malaysia (countrycodes=my).
 */
export async function searchMalaysiaPlaces(query: string): Promise<GeocodedPlace[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q
    )}&countrycodes=my&limit=8&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
      const address = item.address || {};
      const state =
        address.state ||
        address.city ||
        address.town ||
        address.district ||
        'Malaysia';

      const shortName =
        item.name ||
        item.display_name.split(',')[0] ||
        q;

      return {
        name: shortName,
        displayName: item.display_name,
        state,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: item.type || item.class || 'place',
      };
    });
  } catch (err) {
    console.warn('Geocoding search notice:', err);
    return [];
  }
}

/**
 * Reverse-geocodes GPS coordinates into a real Malaysian address/place name.
 */
export async function reverseGeocodeMalaysia(lat: number, lon: number): Promise<GeocodedPlace | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) return null;
    const item = await res.json();

    const address = item.address || {};
    const state =
      address.state ||
      address.city ||
      address.town ||
      address.district ||
      'Malaysia';

    const shortName =
      address.attraction ||
      address.building ||
      address.road ||
      address.suburb ||
      address.village ||
      address.town ||
      address.city ||
      item.name ||
      item.display_name.split(',')[0] ||
      'Pinned Location';

    return {
      name: shortName,
      displayName: item.display_name,
      state,
      latitude: lat,
      longitude: lon,
    };
  } catch {
    return null;
  }
}

/**
 * Converts GeocodedPlace into LocationCoordinates with 3D projection
 */
export function geocodedToCoordinates(place: GeocodedPlace): LocationCoordinates {
  const proj = projectGeoTo3D(place.latitude, place.longitude);
  return {
    name: place.name,
    state: place.state,
    latitude: place.latitude,
    longitude: place.longitude,
    ...proj,
  };
}
