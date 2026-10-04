import { Memory, PassportStamp, Achievement, TripProfile } from '@/types';
import { projectGeoTo3D } from '@/utils/coordinates';

export const DEFAULT_TRIP_PROFILE: TripProfile = {
  friendName: "Kabbo",
  tripTitle: "Kabbo's Malaysia",
  tripDates: "October 2026",
  subtitle: "A little map of a big adventure.",
  dedicationMessage: "For Kabbo — A little piece of Malaysia, saved forever. Made with love by Rabby ❤️",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  privacy: "link",
};

export const DEFAULT_MEMORIES: Memory[] = [
  {
    id: "mem-1",
    title: "First Night in Kuala Lumpur",
    type: "place",
    location: {
      name: "Kuala Lumpur",
      state: "Federal Territory",
      latitude: 3.1478,
      longitude: 101.6953,
      ...projectGeoTo3D(3.1478, 101.6953),
    },
    date: "2026-10-02",
    description: "The city looked completely different at night. The Petronas twin towers rose into the sky like twin crystals made of starlight. We sat at the park fountain sharing sweet warm pandan kuih, watching the city pulse with warm golden light.",
    rating: 5,
    photos: [
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80", // Petronas at night
      "https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=1200&q=80", // KL city lights
      "https://images.unsplash.com/photo-1582234057866-9e7943d0f07d?auto=format&fit=crop&w=1200&q=80"  // KL street life
    ],
    tags: ["Adventure", "Unforgettable"],
    song: {
      title: "Terukir Di Bintang",
      artist: "Yuna",
      url: "https://open.spotify.com/track/yuna"
    },
    unforgettable: true,
    createdAt: "2026-10-02T22:30:00Z",
  },
  {
    id: "mem-2",
    title: "Legendary Duck Egg Char Kway Teow",
    type: "food",
    location: {
      name: "George Town (Penang)",
      state: "Penang",
      latitude: 5.4164,
      longitude: 100.3327,
      ...projectGeoTo3D(5.4164, 100.3327),
    },
    date: "2026-10-04",
    description: "Waited 40 minutes on plastic stools by the roadside. Worth every single second. The intense charcoal wok hei, plump prawns, and creamy duck egg yolk created pure culinary alchemy on banana leaf.",
    rating: 5,
    photos: [
      "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1200&q=80", // Asian street noodle dish
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["Food", "Unforgettable"],
    song: {
      title: "Rasa Sayang",
      artist: "Traditional Acoustic",
    },
    unforgettable: true,
    createdAt: "2026-10-04T13:15:00Z",
  },
  {
    id: "mem-3",
    title: "Floating Sunset in the Andaman",
    type: "moment",
    location: {
      name: "Langkawi",
      state: "Kedah",
      latitude: 6.3500,
      longitude: 99.8000,
      ...projectGeoTo3D(6.3500, 99.8000),
    },
    date: "2026-10-06",
    description: "Cruising on a quiet catamaran as limestone sea cliffs glowed burnt orange. We floated in a salt water trapeze net with chilled drinks while the sky transitioned from gold to lavender to deep violet indigo.",
    rating: 5,
    photos: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Tropical sunset sea
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["Relaxing", "Nature", "Unforgettable"],
    song: {
      title: "Island in the Sun",
      artist: "Acoustic Sunset",
    },
    unforgettable: true,
    createdAt: "2026-10-06T19:40:00Z",
  },
  {
    id: "mem-4",
    title: "Morning Mist over Emerald Tea Terraces",
    type: "photo",
    location: {
      name: "Cameron Highlands",
      state: "Pahang",
      latitude: 4.4700,
      longitude: 101.3800,
      ...projectGeoTo3D(4.4700, 101.3800),
    },
    date: "2026-10-08",
    description: "BOH Sungei Palas at 7:30 AM. Crisp mountain chill at 1,500 meters, smelling fresh dew on tea leaves. Warm scones with clotted cream and homemade strawberry jam on a cantilevered glass balcony over the valley.",
    rating: 4.8,
    photos: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80", // Green mountain plantation
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["Nature", "Relaxing"],
    song: {
      title: "Highland Breeze",
      artist: "Lo-Fi Travel",
    },
    unforgettable: false,
    createdAt: "2026-10-08T09:20:00Z",
  },
  {
    id: "mem-5",
    title: "Red Dutch Square by Disco Trishaw",
    type: "place",
    location: {
      name: "Malacca City (Melaka)",
      state: "Melaka",
      latitude: 2.1896,
      longitude: 102.2501,
      ...projectGeoTo3D(2.1896, 102.2501),
    },
    date: "2026-10-10",
    description: "Rode a hilarious Pikachu trishaw blasting Eurodance beats down historic colonial alleys into Jonker Street. Bought beaded Peranakan slippers and ate pineapple tarts still warm from the oven.",
    rating: 4.6,
    photos: [
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["Funny", "Shopping", "Friends"],
    song: {
      title: "Melaka Heritage Waltz",
      artist: "Street Musicians",
    },
    unforgettable: false,
    createdAt: "2026-10-10T16:00:00Z",
  },
  {
    id: "mem-6",
    title: "Old Town White Coffee & Silky Kaya Toast",
    type: "food",
    location: {
      name: "Ipoh",
      state: "Perak",
      latitude: 4.5975,
      longitude: 101.0901,
      ...projectGeoTo3D(4.5975, 101.0901),
    },
    date: "2026-10-12",
    description: "Marble tables and wooden stools at Sin Yoon Loong. The coffee was rich, caramelized, and frothy on top; paired with thick Hainanese toast smeared with aromatic coconut pandan jam and salted butter slices.",
    rating: 4.9,
    photos: [
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["Food", "Relaxing"],
    song: {
      title: "Kopitiam Morning",
      artist: "Acoustic Cafe",
    },
    unforgettable: false,
    createdAt: "2026-10-12T10:15:00Z",
  },
  {
    id: "mem-7",
    title: "Swimming with Green Sea Turtles",
    type: "place",
    location: {
      name: "Perhentian Islands",
      state: "Terengganu",
      latitude: 5.9000,
      longitude: 102.7300,
      ...projectGeoTo3D(5.9000, 102.7300),
    },
    date: "2026-10-14",
    description: "The water was so crystalline it felt like hovering weightless in midair. A giant green sea turtle swam alongside us for ten minutes, casually nibbling seagrass while clownfish danced in anemones below.",
    rating: 5,
    photos: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80", // Sea turtle diving
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["Adventure", "Nature", "Unforgettable"],
    song: {
      title: "Coral Reefs",
      artist: "Ocean Sounds",
    },
    unforgettable: true,
    createdAt: "2026-10-14T14:45:00Z",
  },
  {
    id: "mem-8",
    title: "Mount Kinabalu Summit Sunrise",
    type: "moment",
    location: {
      name: "Mount Kinabalu",
      state: "Sabah",
      latitude: 6.0750,
      longitude: 116.5580,
      ...projectGeoTo3D(6.0750, 116.5580),
    },
    date: "2026-10-18",
    description: "Summit push started at 2:30 AM under a canopy of endless stars. At 4,095 meters, Low's Peak emerged in raw granite majesty as the sun tore through a vast sea of clouds below us. Exhausted, freezing, and crying happy tears.",
    rating: 5,
    photos: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", // Mountain sunrise
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["Adventure", "Unforgettable"],
    song: {
      title: "Above The Clouds",
      artist: "Cinematic Horizons",
    },
    unforgettable: true,
    createdAt: "2026-10-18T06:10:00Z",
  },
];

export const DEFAULT_PASSPORT_STAMPS: PassportStamp[] = [
  {
    id: "stamp-kl",
    name: "Federal Territory of Kuala Lumpur",
    locationName: "Kuala Lumpur",
    state: "Wilayah Persekutuan",
    icon: "🏙️",
    landmark: "Petronas Twin Towers",
    stampColor: "#d97706",
    description: "Gateway to Malaysia. Skyscraper heights and vibrant night bazaars.",
  },
  {
    id: "stamp-penang",
    name: "Pearl of the Orient",
    locationName: "George Town (Penang)",
    state: "Penang",
    icon: "🍜",
    landmark: "Penang Heritage & Street Art",
    stampColor: "#e05a47",
    description: "UNESCO World Heritage city with legendary street gastronomy.",
  },
  {
    id: "stamp-langkawi",
    name: "Jewel of Kedah",
    locationName: "Langkawi",
    state: "Kedah",
    icon: "🦅",
    landmark: "Langkawi Geopark & Eagle Square",
    stampColor: "#1d5d85",
    description: "99 tropical islands, turquoise waters and ancient mangrove karsts.",
  },
  {
    id: "stamp-cameron",
    name: "Misty Highlands",
    locationName: "Cameron Highlands",
    state: "Pahang",
    icon: "🍃",
    landmark: "BOH Sungei Palas Tea Estate",
    stampColor: "#059669",
    description: "Rolling emerald tea slopes and cool mountain breezes.",
  },
  {
    id: "stamp-melaka",
    name: "Historic Straits Empire",
    locationName: "Malacca City (Melaka)",
    state: "Melaka",
    icon: "🏛️",
    landmark: "The Stadthuys & Red Dutch Square",
    stampColor: "#b91c1c",
    description: "Where Portuguese, Dutch, British and Peranakan histories intertwine.",
  },
  {
    id: "stamp-ipoh",
    name: "Limestone Coffee Town",
    locationName: "Ipoh",
    state: "Perak",
    icon: "☕",
    landmark: "Old Town Kopitiam & Cave Temples",
    stampColor: "#78350f",
    description: "Famed Hainanese white coffee roasted in palm oil margarine.",
  },
  {
    id: "stamp-perhentian",
    name: "Crystal Coral Haven",
    locationName: "Perhentian Islands",
    state: "Terengganu",
    icon: "🐢",
    landmark: "Coral Bay & Turtle Point",
    stampColor: "#0891b2",
    description: "Aquamarine lagoons, sea turtles and powdery white sands.",
  },
  {
    id: "stamp-kinabalu",
    name: "Roof of Borneo",
    locationName: "Mount Kinabalu",
    state: "Sabah",
    icon: "⛰️",
    landmark: "Low's Peak (4,095m)",
    stampColor: "#4f46e5",
    description: "Sacred granite crown rising above the clouds on Borneo island.",
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-first-memory",
    title: "First Memory",
    description: "Added her first Malaysia memory to the map",
    icon: "🏆",
    requirement: "1 memory logged",
    category: "memories",
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    currentValue: 1,
  },
  {
    id: "ach-food-explorer",
    title: "Food Explorer",
    description: "Discovered and tasted 5 distinct Malaysian delicacies",
    icon: "🍜",
    requirement: "5 food memories",
    category: "food",
    unlocked: false,
    progress: 0.4,
    maxProgress: 5,
    currentValue: 2,
  },
  {
    id: "ach-memory-collector",
    title: "Memory Collector",
    description: "Saved over 15 precious photographs to the digital scrapbook",
    icon: "📸",
    requirement: "15 photos uploaded",
    category: "photos",
    unlocked: true,
    progress: 1,
    maxProgress: 15,
    currentValue: 17,
  },
  {
    id: "ach-explorer",
    title: "Explorer",
    description: "Pinned 5 unique geographical destinations across Malaysia",
    icon: "🗺️",
    requirement: "5 places pinned",
    category: "explorer",
    unlocked: true,
    progress: 1,
    maxProgress: 5,
    currentValue: 8,
  },
  {
    id: "ach-unforgettable",
    title: "Unforgettable",
    description: "Saved her first heart-marked unforgettable moment",
    icon: "❤️",
    requirement: "1 unforgettable moment",
    category: "special",
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    currentValue: 5,
  },
  {
    id: "ach-malaysia-journey",
    title: "Malaysia Explorer",
    description: "Completed the grand journey from Peninsular to Borneo",
    icon: "🌴",
    requirement: "Log memories across both West and East Malaysia",
    category: "special",
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    currentValue: 1,
  },
];
