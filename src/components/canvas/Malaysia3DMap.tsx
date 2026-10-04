'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Memory } from '@/types';
import {
  createPeninsularMesh,
  createBorneoMesh,
  createMiniatureLandmarks,
  createTropicalFoliage,
  createClouds,
  createOcean,
} from './landmasses';
import { soundEngine } from '@/utils/audio';

interface Malaysia3DMapProps {
  memories: Memory[];
  selectedMemory: Memory | null;
  onSelectMemory: (mem: Memory | null) => void;
  isLandingMode?: boolean;
  onStartJourney?: () => void;
  showJourneyRoute?: boolean;
  isSummaryMode?: boolean;
}

export default function Malaysia3DMap({
  memories,
  selectedMemory,
  onSelectMemory,
  isLandingMode = false,
  showJourneyRoute = true,
  isSummaryMode = false,
}: Malaysia3DMapProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const routeGroupRef = useRef<THREE.Group | null>(null);
  const cloudsRef = useRef<THREE.Group | null>(null);
  const pulseRingsRef = useRef<THREE.Mesh[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Interaction controls state
  const isDraggingRef = useRef(false);
  const previousPointerPosRef = useRef({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);
  const targetCameraPosRef = useRef(new THREE.Vector3(0, 32, 28));
  const currentCameraLookAtRef = useRef(new THREE.Vector3(0, 1.2, 0));
  const targetCameraLookAtRef = useRef(new THREE.Vector3(0, 1.2, 0));
  const autoRotateAngleRef = useRef(0);

  // Hover state
  const [hoveredMemoryTitle, setHoveredMemoryTitle] = useState<string | null>(null);
  const [hoverScreenPos, setHoverScreenPos] = useState<{ x: number; y: number } | null>(null);

  // Raycasting
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseCoordsRef = useRef(new THREE.Vector2());

  // Setup Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#06221a'); // Lotus Lacquer Green
    scene.fog = new THREE.FogExp2('#082b20', 0.012); // Lotus Forest Jade
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 300);
    if (isLandingMode) {
      camera.position.set(-10, 24, 38);
    } else {
      camera.position.set(0, 32, 28);
    }
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight('#f7dee2', 0.65); // Soft Lotus Petal Blush reflection
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.8); // Golden warm sun
    sunLight.position.set(-25, 45, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -35;
    sunLight.shadow.camera.right = 35;
    sunLight.shadow.camera.top = 35;
    sunLight.shadow.camera.bottom = -35;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight('#eaafb9', 0.5); // Lotus petal pink fill bounce
    fillLight.position.set(30, 25, -20);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight('#dfad40', '#0a3025', 0.45); // Pollen Gold & Deep Jade
    scene.add(hemiLight);

    // 5. Environment geometry
    const ocean = createOcean();
    scene.add(ocean);

    const peninsula = createPeninsularMesh();
    scene.add(peninsula);

    const borneo = createBorneoMesh();
    scene.add(borneo);

    const landmarks = createMiniatureLandmarks();
    scene.add(landmarks);

    const foliage = createTropicalFoliage();
    scene.add(foliage);

    const clouds = createClouds();
    cloudsRef.current = clouds;
    scene.add(clouds);

    // Floating Starlight / Firefly Particles
    const particleCount = 120;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 60;
      particlePositions[i * 3 + 1] = Math.random() * 12 + 1;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: '#f3cb69', // Lotus stamen gold
      size: 0.25,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // Pin groups
    const pinsGroup = new THREE.Group();
    scene.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    // Route group
    const routeGroup = new THREE.Group();
    scene.add(routeGroup);
    routeGroupRef.current = routeGroup;

    // Window resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Cloud drift
      if (cloudsRef.current) {
        cloudsRef.current.children.forEach((cloud, idx) => {
          cloud.position.x += 0.008 * (1 + idx * 0.1);
          if (cloud.position.x > 32) {
            cloud.position.x = -32;
          }
        });
      }

      // Starlight particles gentle float
      const positions = particleGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.015;
        if (positions[i * 3 + 1] > 14) {
          positions[i * 3 + 1] = 1.0;
        }
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Pulse expanding rings beneath active pins
      pulseRingsRef.current.forEach((ring) => {
        const scale = 1 + (Math.sin(elapsedTime * 3) * 0.5 + 0.5) * 0.8;
        ring.scale.set(scale, scale, scale);
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.7 - (scale - 1) * 0.6;
      });

      // Camera lerp & landing mode orbit
      if (isLandingMode) {
        autoRotateAngleRef.current += 0.002;
        const radius = 38;
        const targetX = Math.sin(autoRotateAngleRef.current) * radius * 0.6 - 2;
        const targetZ = Math.cos(autoRotateAngleRef.current) * radius * 0.6 + 18;
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (22 + Math.sin(elapsedTime * 0.5) * 2 - camera.position.y) * 0.02;
        camera.position.z += (targetZ - camera.position.z) * 0.02;
        currentCameraLookAtRef.current.lerp(new THREE.Vector3(-2, 2, 0), 0.04);
        camera.lookAt(currentCameraLookAtRef.current);
      } else {
        // Normal interactive navigation lerp
        camera.position.lerp(targetCameraPosRef.current, 0.06);
        currentCameraLookAtRef.current.lerp(targetCameraLookAtRef.current, 0.06);
        camera.lookAt(currentCameraLookAtRef.current);
      }

      // Gentle pin bobbing
      if (pinsGroupRef.current) {
        pinsGroupRef.current.children.forEach((pinObj, idx) => {
          const basePosY = pinObj.userData.baseY || 1.8;
          pinObj.position.y = basePosY + Math.sin(elapsedTime * 2.5 + idx) * 0.12;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isLandingMode]);

  // Update 3D Pins whenever memories or selectedMemory change
  useEffect(() => {
    const pinsGroup = pinsGroupRef.current;
    if (!pinsGroup) return;

    // Clear previous pins
    while (pinsGroup.children.length > 0) {
      const child = pinsGroup.children[0];
      pinsGroup.remove(child);
    }
    pulseRingsRef.current = [];

    // Pin materials by type (Lotus Botanical Palette)
    const getPinColors = (type: string, isSelected: boolean) => {
      if (isSelected) {
        return { head: '#ffffff', glow: '#dfad40', stem: '#f3cb69' }; // White crystal with Lotus Pollen Gold glow
      }
      switch (type) {
        case 'food':
          return { head: '#d96c4d', glow: '#f69d7b', stem: '#9c442c' }; // Lotus Terra Coral / Food
        case 'photo':
          return { head: '#2a8b79', glow: '#6ee7b7', stem: '#1a6154' }; // Lotus Jade / Photo
        case 'moment':
          return { head: '#cf6b7d', glow: '#eaafb9', stem: '#8f3b4d' }; // Lotus Rose & Petal Blush / Moment
        case 'place':
        default:
          return { head: '#dfad40', glow: '#f3cb69', stem: '#a17724' }; // Pollen Seed Gold / Place
      }
    };

    memories.forEach((mem) => {
      const isSelected = selectedMemory?.id === mem.id;
      const colors = getPinColors(mem.type, isSelected);

      const pinGroup = new THREE.Group();
      const posX = mem.location.x ?? -14;
      const posZ = mem.location.z ?? 0;
      const posY = 1.4;

      pinGroup.position.set(posX, posY, posZ);
      pinGroup.userData = {
        memoryId: mem.id,
        memory: mem,
        baseY: posY,
      };

      // Pin stem
      const stemGeom = new THREE.CylinderGeometry(0.08, 0.04, 1.2, 8);
      const stemMat = new THREE.MeshStandardMaterial({
        color: colors.stem,
        metalness: 0.8,
        roughness: 0.2,
      });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.y = 0.6;
      stem.castShadow = true;
      pinGroup.add(stem);

      // Pin head sphere / gem
      const headGeom = new THREE.SphereGeometry(isSelected ? 0.55 : 0.42, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({
        color: colors.head,
        emissive: colors.glow,
        emissiveIntensity: isSelected ? 0.7 : 0.35,
        roughness: 0.2,
        metalness: 0.4,
      });
      const head = new THREE.Mesh(headGeom, headMat);
      head.position.y = 1.35;
      head.castShadow = true;
      pinGroup.add(head);

      // Glowing light point for selected pin
      if (isSelected || isSummaryMode) {
        const pointLight = new THREE.PointLight(colors.glow, 1.2, 5);
        pointLight.position.y = 1.6;
        pinGroup.add(pointLight);

        // Ground pulse ring
        const ringGeom = new THREE.RingGeometry(0.3, 0.6, 24);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: colors.glow,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.position.y = -0.15;
        pinGroup.add(ringMesh);
        pulseRingsRef.current.push(ringMesh);
      }

      pinsGroup.add(pinGroup);
    });
  }, [memories, selectedMemory, isSummaryMode]);

  // Update animated journey route spline connecting visited places
  useEffect(() => {
    const routeGroup = routeGroupRef.current;
    if (!routeGroup) return;

    // Clear old route
    while (routeGroup.children.length > 0) {
      routeGroup.remove(routeGroup.children[0]);
    }

    if (!showJourneyRoute && !isSummaryMode) return;
    if (memories.length < 2) return;

    // Sort memories chronologically
    const sorted = [...memories].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const curvePoints = sorted.map((m, idx) => {
      const x = m.location.x ?? -14;
      const z = m.location.z ?? 0;
      // Slight arc height between waypoints
      const y = 1.6 + (idx % 2 === 0 ? 0.3 : 0.1);
      return new THREE.Vector3(x, y, z);
    });

    try {
      const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'centripetal', 0.5);
      const points = curve.getPoints(100);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);

      const lineMat = new THREE.LineDashedMaterial({
        color: isSummaryMode ? '#dfad40' : '#cf6b7d', // Lotus Pollen Gold or Lotus Rose
        linewidth: 3,
        scale: 1,
        dashSize: 0.8,
        gapSize: 0.4,
        transparent: true,
        opacity: 0.85,
      });

      const line = new THREE.Line(lineGeom, lineMat);
      line.computeLineDistances();
      routeGroup.add(line);

      // Glowing tube overlay for premium golden beam feel
      const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.08, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: '#f3cb69', // Lotus stamen gold
        transparent: true,
        opacity: 0.45,
      });
      const tube = new THREE.Mesh(tubeGeom, tubeMat);
      routeGroup.add(tube);
    } catch (err) {
      console.warn("Route curve generation note:", err);
    }
  }, [memories, showJourneyRoute, isSummaryMode]);

  // Camera focus when selectedMemory changes
  useEffect(() => {
    if (isLandingMode) return;

    if (selectedMemory) {
      const x = selectedMemory.location.x ?? -14;
      const z = selectedMemory.location.z ?? 0;

      // Smoothly fly camera to close 45-degree angle of pin
      targetCameraLookAtRef.current.set(x, 1.4, z);
      targetCameraPosRef.current.set(x, 10, z + 12);
    } else {
      // Return to overall view
      targetCameraLookAtRef.current.set(0, 1.2, 0);
      targetCameraPosRef.current.set(0, 32, 28);
    }
  }, [selectedMemory, isLandingMode]);

  // Pointer / Touch gestures handler (Orbit, Zoom, Pinch, Tap)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // 1. Raycasting for hover tooltip
    if (containerHasHover() && sceneRef.current && cameraRef.current && pinsGroupRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseCoordsRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoordsRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseCoordsRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(pinsGroupRef.current.children, true);

      if (intersects.length > 0) {
        let parentGroup: THREE.Object3D | null = intersects[0].object;
        while (parentGroup && !parentGroup.userData?.memory) {
          parentGroup = parentGroup.parent;
        }
        if (parentGroup && parentGroup.userData?.memory) {
          setHoveredMemoryTitle(parentGroup.userData.memory.title);
          setHoverScreenPos({ x: e.clientX, y: e.clientY });
        }
      } else {
        setHoveredMemoryTitle(null);
      }
    }

    // 2. Drag rotation
    if (!isDraggingRef.current || isLandingMode) return;

    const deltaX = e.clientX - previousPointerPosRef.current.x;
    const deltaY = e.clientY - previousPointerPosRef.current.y;
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };

    // Rotate camera around target lookAt
    const rotSpeed = 0.006;
    const currentPos = targetCameraPosRef.current;
    const lookAt = targetCameraLookAtRef.current;

    const relX = currentPos.x - lookAt.x;
    const relZ = currentPos.z - lookAt.z;

    const angle = Math.atan2(relZ, relX) - deltaX * rotSpeed;
    const distance = Math.sqrt(relX * relX + relZ * relZ);

    currentPos.x = lookAt.x + Math.cos(angle) * distance;
    currentPos.z = lookAt.z + Math.sin(angle) * distance;

    // Pitch elevation
    currentPos.y = Math.max(6, Math.min(50, currentPos.y - deltaY * 0.08));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    touchDistanceRef.current = null;

    // Check click/tap on pins if movement was small
    const deltaMove = Math.hypot(
      e.clientX - previousPointerPosRef.current.x,
      e.clientY - previousPointerPosRef.current.y
    );

    if (deltaMove < 10 && sceneRef.current && cameraRef.current && pinsGroupRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycasterRef.current.setFromCamera(mouse, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(pinsGroupRef.current.children, true);

      if (intersects.length > 0) {
        let parentGroup: THREE.Object3D | null = intersects[0].object;
        while (parentGroup && !parentGroup.userData?.memory) {
          parentGroup = parentGroup.parent;
        }
        if (parentGroup && parentGroup.userData?.memory) {
          soundEngine?.playChime('pin');
          onSelectMemory(parentGroup.userData.memory);
        }
      }
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isLandingMode) return;
    const zoomDelta = e.deltaY * 0.03;
    const cam = targetCameraPosRef.current;
    const lookAt = targetCameraLookAtRef.current;

    const dir = new THREE.Vector3().subVectors(cam, lookAt).normalize();
    const currentDist = cam.distanceTo(lookAt);
    const newDist = Math.max(10, Math.min(65, currentDist + zoomDelta));

    cam.copy(lookAt).add(dir.multiplyScalar(newDist));
  };

  // Mobile pinch-to-zoom
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.hypot(dx, dy);

      if (touchDistanceRef.current !== null) {
        const pinchDelta = (touchDistanceRef.current - distance) * 0.08;
        const cam = targetCameraPosRef.current;
        const lookAt = targetCameraLookAtRef.current;
        const dir = new THREE.Vector3().subVectors(cam, lookAt).normalize();
        const currentDist = cam.distanceTo(lookAt);
        const newDist = Math.max(10, Math.min(65, currentDist + pinchDelta));
        cam.copy(lookAt).add(dir.multiplyScalar(newDist));
      }
      touchDistanceRef.current = distance;
    }
  };

  const containerHasHover = () => {
    return typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  };

  // Center / Reset Map camera
  const handleResetCamera = useCallback(() => {
    targetCameraLookAtRef.current.set(0, 1.2, 0);
    targetCameraPosRef.current.set(0, 32, 28);
    onSelectMemory(null);
    soundEngine?.playChime('click');
  }, [onSelectMemory]);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full select-none overflow-hidden touch-none cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
    >
      {/* Hover preview tooltip on desktop */}
      {hoveredMemoryTitle && hoverScreenPos && !selectedMemory && (
        <div
          className="fixed pointer-events-none z-40 transform -translate-x-1/2 -translate-y-full px-3 py-1.5 mb-3 rounded-xl bg-lotus-forest/90 backdrop-blur-md border border-lotus-rose/30 text-lotus-cream text-xs font-medium shadow-glass flex items-center gap-1.5 animate-fade-in"
          style={{ left: hoverScreenPos.x, top: hoverScreenPos.y }}
        >
          <span className="w-2 h-2 rounded-full bg-lotus-gold animate-ping" />
          <span>{hoveredMemoryTitle}</span>
        </div>
      )}

      {/* Floating 3D Map controls HUD (Compass & Recenter) */}
      {!isLandingMode && (
        <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={handleResetCamera}
            className="w-10 h-10 rounded-full bg-lotus-forest/85 hover:bg-lotus-forest backdrop-blur-md border border-white/20 text-lotus-cream shadow-glass flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Recenter Map"
          >
            <svg
              className="w-4 h-4 text-lotus-gold"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="3" x2="12" y2="7" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <line x1="3" y1="12" x2="7" y2="12" />
              <line x1="17" y1="12" x2="21" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
