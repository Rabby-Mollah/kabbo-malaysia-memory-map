# 🇲🇾 Malaysia Memory Map — 3D Interactive Digital Keepsake

A premium, highly interactive, mobile-first 3D web experience designed as a personal digital gift for a friend visiting Malaysia. It feels like a **3D interactive travel scrapbook, memory map, and digital keepsake**, not a generic travel-planning dashboard.

---

## ✨ Key Highlights

- **3D Miniature Malaysia Environment (Three.js)**: Stylized low-poly artistic representation of Peninsular Malaysia and Malaysian Borneo, complete with the Titiwangsa mountains, Mount Kinabalu, miniature landmarks (**Petronas Twin Towers with skybridge & night beacon**, **Penang Bridge**, **Langkawi Eagle Square**, and **Melaka Dutch Square**), tropical palm foliage, drifting clouds, and shimmering tropical ocean waters.
- **Cinematic Landing Experience**: Atmospheric opening scene with orbiting camera, warm ambient lighting, personalized dedication card, and smooth transition into the interactive map via **"START MY JOURNEY →"**.
- **Interactive Memory Pins**: 4 distinct animated pin types (📍 Place, 🍜 Food, 📸 Photo, ❤️ Special Moment) with glowing pulse waves and sound chimes. Clicking opens a floating glassmorphic 3D card.
- **Add Memory Flow**: Clean modal/bottom-sheet with Malaysian destination presets, custom coordinates projection, multi-photo upload with client-side image compression, 1–5 star ratings, tag chips, and optional song attachment.
- **3D Memory Cards & Lightbox**: Interactive 3D perspective cards responding to touch and mouse movement, full-screen photo lightbox with zoom and swipe controls.
- **Chronological Travel Film ("MY JOURNEY")**: Day-by-day timeline chapters with transit badges and direct jump-to-map controls.
- **"The Moments That Stayed" (Unforgettable Gallery)**: Vintage polaroid scrapbook gallery with tape motifs for memories marked ❤️ Unforgettable.
- **Malaysia Travel Passport**: Collectible digital passport book featuring animated rubber stamps that unlock as destinations are pinned.
- **Expedition Achievements**: Playful collectible badges (First Memory, Food Explorer, Memory Collector, Explorer, Unforgettable, Malaysia Explorer) with celebratory audio chimes and confetti bursts.
- **Cinematic Trip Summary ("✨ COMPLETE MY JOURNEY")**: Full-screen ending experience highlighting trip stats, animated glowing journey route connecting visited spots, photo montage, and exportable keepsake story.
- **Shareable Private Links (`/memory/[slug]`)**: Read-only mode with customizable privacy controls (Private, Anyone with link, or Password-protected).
- **Web Audio Ambience Engine**: Organic procedural ambient soundscapes (Rainforest, Andaman Sea, Tropical Rain, City Dusk) synthesized directly via Web Audio API without heavy audio files.
- **Personalization & Empty State Support**: Custom friend name, trip title, dates, and dedicated empty state view ("Your map is waiting for memories").

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
To view the read-only shareable memory page, navigate to [http://localhost:3000/memory/her-malaysia-2026](http://localhost:3000/memory/her-malaysia-2026).
