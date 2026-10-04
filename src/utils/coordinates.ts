import { LocationCoordinates } from '@/types';

/**
 * Projects real-world Latitude & Longitude to our stylized 3D miniature map coordinate system.
 * West: Peninsular Malaysia (x: approx -22 to -6, z: approx -16 to 14)
 * East: Sabah & Sarawak / Borneo (x: approx 4 to 26, z: approx -16 to 12)
 */
export function projectGeoTo3D(lat: number, lon: number): { x: number; z: number; isBorneo: boolean } {
  const isBorneo = lon >= 106.0;

  if (!isBorneo) {
    const normLon = (lon - 99.8) / (104.2 - 99.8);
    const normLat = (lat - 1.2) / (6.4 - 1.2);

    const x = -22 + normLon * 16;
    const z = 14 - normLat * 28;
    return { x, z, isBorneo: false };
  } else {
    const normLon = (lon - 109.5) / (119.0 - 109.5);
    const normLat = (lat - 1.0) / (7.0 - 1.0);

    const x = 4 + normLon * 22;
    const z = 12 - normLat * 26;
    return { x, z, isBorneo: true };
  }
}

/**
 * Extensive Malaysian destinations spanning Peninsular, Sabah, Sarawak, islands, and highlands.
 */
export const MALAYSIAN_DESTINATIONS: LocationCoordinates[] = [
  // Federal Territories & Central
  {
    name: "Kuala Lumpur (City Center)",
    state: "Kuala Lumpur",
    latitude: 3.1478,
    longitude: 101.6953,
    ...projectGeoTo3D(3.1478, 101.6953),
  },
  {
    name: "Batu Caves",
    state: "Selangor",
    latitude: 3.2378,
    longitude: 101.6814,
    ...projectGeoTo3D(3.2378, 101.6814),
  },
  {
    name: "Bukit Bintang & Jalan Alor",
    state: "Kuala Lumpur",
    latitude: 3.1455,
    longitude: 101.7085,
    ...projectGeoTo3D(3.1455, 101.7085),
  },
  {
    name: "Putrajaya (Pink Mosque)",
    state: "Putrajaya",
    latitude: 2.9361,
    longitude: 101.6917,
    ...projectGeoTo3D(2.9361, 101.6917),
  },

  // Northern Peninsular
  {
    name: "George Town (Penang)",
    state: "Penang",
    latitude: 5.4164,
    longitude: 100.3327,
    ...projectGeoTo3D(5.4164, 100.3327),
  },
  {
    name: "Penang Hill & Kek Lok Si",
    state: "Penang",
    latitude: 5.3992,
    longitude: 100.2736,
    ...projectGeoTo3D(5.3992, 100.2736),
  },
  {
    name: "Langkawi (Pantai Cenang)",
    state: "Kedah",
    latitude: 6.2917,
    longitude: 99.7289,
    ...projectGeoTo3D(6.2917, 99.7289),
  },
  {
    name: "Langkawi Sky Bridge & Eagle Square",
    state: "Kedah",
    latitude: 6.3500,
    longitude: 99.8000,
    ...projectGeoTo3D(6.3500, 99.8000),
  },
  {
    name: "Ipoh Old Town & Concubine Lane",
    state: "Perak",
    latitude: 4.5975,
    longitude: 101.0901,
    ...projectGeoTo3D(4.5975, 101.0901),
  },
  {
    name: "Pangkor Island",
    state: "Perak",
    latitude: 4.2217,
    longitude: 100.5614,
    ...projectGeoTo3D(4.2217, 100.5614),
  },

  // Highlands & Nature
  {
    name: "Cameron Highlands (BOH Tea)",
    state: "Pahang",
    latitude: 4.4700,
    longitude: 101.3800,
    ...projectGeoTo3D(4.4700, 101.3800),
  },
  {
    name: "Genting Highlands (SkyWorlds)",
    state: "Pahang",
    latitude: 3.4240,
    longitude: 101.7940,
    ...projectGeoTo3D(3.4240, 101.7940),
  },
  {
    name: "Taman Negara National Park",
    state: "Pahang",
    latitude: 4.3833,
    longitude: 102.4000,
    ...projectGeoTo3D(4.3833, 102.4000),
  },

  // Southern Peninsular
  {
    name: "Malacca City (Jonker & Dutch Square)",
    state: "Melaka",
    latitude: 2.1896,
    longitude: 102.2501,
    ...projectGeoTo3D(2.1896, 102.2501),
  },
  {
    name: "Johor Bahru & Legoland",
    state: "Johor",
    latitude: 1.4927,
    longitude: 103.7414,
    ...projectGeoTo3D(1.4927, 103.7414),
  },
  {
    name: "Desaru Coast",
    state: "Johor",
    latitude: 1.5583,
    longitude: 104.2583,
    ...projectGeoTo3D(1.5583, 104.2583),
  },

  // East Coast Tropical Islands
  {
    name: "Perhentian Islands (Coral Bay)",
    state: "Terengganu",
    latitude: 5.9000,
    longitude: 102.7300,
    ...projectGeoTo3D(5.9000, 102.7300),
  },
  {
    name: "Redang Island",
    state: "Terengganu",
    latitude: 5.7667,
    longitude: 103.0167,
    ...projectGeoTo3D(5.7667, 103.0167),
  },
  {
    name: "Tioman Island",
    state: "Pahang",
    latitude: 2.7900,
    longitude: 104.1700,
    ...projectGeoTo3D(2.7900, 104.1700),
  },

  // Sabah (Borneo)
  {
    name: "Kota Kinabalu Waterfront",
    state: "Sabah",
    latitude: 5.9804,
    longitude: 116.0735,
    ...projectGeoTo3D(5.9804, 116.0735),
  },
  {
    name: "Mount Kinabalu (Low's Peak)",
    state: "Sabah",
    latitude: 6.0750,
    longitude: 116.5580,
    ...projectGeoTo3D(6.0750, 116.5580),
  },
  {
    name: "Sipadan Island & Semporna",
    state: "Sabah",
    latitude: 4.1147,
    longitude: 118.6289,
    ...projectGeoTo3D(4.1147, 118.6289),
  },
  {
    name: "Sepilok Orangutan Sanctuary",
    state: "Sabah",
    latitude: 5.8647,
    longitude: 117.9492,
    ...projectGeoTo3D(5.8647, 117.9492),
  },

  // Sarawak (Borneo)
  {
    name: "Kuching Waterfront",
    state: "Sarawak",
    latitude: 1.5533,
    longitude: 110.3592,
    ...projectGeoTo3D(1.5533, 110.3592),
  },
  {
    name: "Bako National Park",
    state: "Sarawak",
    latitude: 1.7167,
    longitude: 110.4667,
    ...projectGeoTo3D(1.7167, 110.4667),
  },
  {
    name: "Gunung Mulu National Park",
    state: "Sarawak",
    latitude: 4.0489,
    longitude: 114.8142,
    ...projectGeoTo3D(4.0489, 114.8142),
  },
];
