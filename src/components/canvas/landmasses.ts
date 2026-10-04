import * as THREE from 'three';

/**
 * Creates the stylized 3D landmass for Peninsular Malaysia.
 * Uses an artistic 2D spline shape extruded with soft beveling.
 */
export function createPeninsularMesh(): THREE.Group {
  const group = new THREE.Group();

  // Artistic outline of Peninsular Malaysia
  // Centered roughly around x: -14, z: 0
  const shape = new THREE.Shape();
  // Start from North-West (Perlis/Kedah)
  shape.moveTo(-18.5, -12.5);
  shape.lineTo(-19.5, -9.0);   // Penang coast
  shape.lineTo(-19.0, -4.0);   // Perak coast
  shape.lineTo(-17.5, 1.5);    // Selangor / Klang
  shape.lineTo(-16.0, 6.0);    // Melaka
  shape.lineTo(-13.5, 11.0);   // Johor Bahru / South tip
  shape.lineTo(-11.5, 10.5);   // East Johor
  shape.lineTo(-10.5, 5.0);    // Mersing / Rompin
  shape.lineTo(-10.0, -1.0);   // Pahang / Kuantan
  shape.lineTo(-11.0, -6.5);   // Terengganu
  shape.lineTo(-13.0, -11.5);  // Kelantan / Kota Bharu
  shape.lineTo(-16.0, -12.8);  // Thai border north
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 1.2,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.6,
    bevelThickness: 0.5,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.rotateX(Math.PI / 2); // Lay flat on XZ plane

  // Main lush rainforest material
  const landMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0e4234'), // Lotus Pine Green
    roughness: 0.75,
    metalness: 0.1,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geom, landMaterial);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  mesh.position.y = 0;
  group.add(mesh);

  // Sandy coastal shelf underneath
  const beachGeom = geom.clone();
  beachGeom.scale(1.05, 0.4, 1.05);
  const beachMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ede4d8'), // Lotus Soft Botanical Sand
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true,
  });
  const beachMesh = new THREE.Mesh(beachGeom, beachMaterial);
  beachMesh.position.y = -0.4;
  beachMesh.receiveShadow = true;
  group.add(beachMesh);

  // Titiwangsa mountain range spine along Peninsula
  const mountainGeom = new THREE.ConeGeometry(1.8, 2.2, 5);
  mountainGeom.rotateY(Math.PI / 4);
  const mountainMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#06221a'), // Deep Lotus Pine
    roughness: 0.85,
    flatShading: true,
  });

  const mountainPositions = [
    { x: -14.5, z: -8.0, s: 1.1, h: 2.2 },
    { x: -14.8, z: -5.0, s: 1.4, h: 2.6 }, // Cameron highlands area
    { x: -14.0, z: -2.0, s: 1.2, h: 2.3 }, // Fraser's hill
    { x: -14.2, z: 2.0,  s: 0.9, h: 1.8 }, // Genting area
    { x: -13.5, z: 5.5,  s: 0.8, h: 1.5 }, // Gunung Ledang
  ];

  mountainPositions.forEach(m => {
    const peak = new THREE.Mesh(mountainGeom, mountainMat);
    peak.position.set(m.x, 1.0 + m.h * 0.4, m.z);
    peak.scale.set(m.s, m.h, m.s);
    peak.castShadow = true;
    group.add(peak);
  });

  // Penang Island (miniature island off NW)
  const penangShape = new THREE.Shape();
  penangShape.moveTo(-20.8, -7.5);
  penangShape.lineTo(-21.5, -6.5);
  penangShape.lineTo(-21.0, -5.2);
  penangShape.lineTo(-20.2, -6.0);
  penangShape.closePath();
  const penangGeom = new THREE.ExtrudeGeometry(penangShape, { depth: 0.8, bevelEnabled: true, bevelSize: 0.2, bevelThickness: 0.2 });
  penangGeom.rotateX(Math.PI / 2);
  const penangMesh = new THREE.Mesh(penangGeom, landMaterial);
  penangMesh.castShadow = true;
  penangMesh.receiveShadow = true;
  group.add(penangMesh);

  // Langkawi Archipelago (group of small islands off far NW)
  const langkawiShape = new THREE.Shape();
  langkawiShape.moveTo(-21.5, -12.5);
  langkawiShape.lineTo(-22.4, -11.8);
  langkawiShape.lineTo(-21.8, -10.8);
  langkawiShape.lineTo(-21.0, -11.5);
  langkawiShape.closePath();
  const langkawiGeom = new THREE.ExtrudeGeometry(langkawiShape, { depth: 0.7, bevelEnabled: true, bevelSize: 0.2, bevelThickness: 0.2 });
  langkawiGeom.rotateX(Math.PI / 2);
  const langkawiMesh = new THREE.Mesh(langkawiGeom, landMaterial);
  langkawiMesh.castShadow = true;
  group.add(langkawiMesh);

  return group;
}

/**
 * Creates the stylized 3D landmass for Malaysian Borneo (Sarawak & Sabah).
 */
export function createBorneoMesh(): THREE.Group {
  const group = new THREE.Group();

  // Artistic outline of Sarawak & Sabah
  const shape = new THREE.Shape();
  // Start from South-West Sarawak (Kuching area)
  shape.moveTo(4.5, 9.5);
  shape.lineTo(8.0, 7.5);   // Sibu
  shape.lineTo(12.5, 4.0);  // Bintulu / Miri
  shape.lineTo(15.5, 0.5);  // Brunei border / Lawas
  shape.lineTo(17.5, -4.0);  // Kota Kinabalu
  shape.lineTo(20.0, -10.5); // Tip of Borneo (Kudat)
  shape.lineTo(24.5, -6.0);  // Sandakan bay
  shape.lineTo(25.5, 0.0);   // Dent peninsula
  shape.lineTo(24.0, 5.0);   // Semporna / Tawau
  shape.lineTo(19.0, 8.5);   // Kalimantan border
  shape.lineTo(12.0, 11.5);  // Interior Sarawak border
  shape.lineTo(6.0, 12.0);   // South Sarawak interior
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 1.2,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.6,
    bevelThickness: 0.5,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.rotateX(Math.PI / 2);

  const landMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0a3025'), // Lotus Forest Jade
    roughness: 0.8,
    metalness: 0.1,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geom, landMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Sandy coastline
  const beachGeom = geom.clone();
  beachGeom.scale(1.04, 0.4, 1.04);
  const beachMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ede4d8'), // Lotus Botanical Sand
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true,
  });
  const beachMesh = new THREE.Mesh(beachGeom, beachMaterial);
  beachMesh.position.y = -0.4;
  group.add(beachMesh);

  // Borneo mountain ranges
  const mountainGeom = new THREE.ConeGeometry(2.0, 2.5, 5);
  mountainGeom.rotateY(Math.PI / 4);
  const mountainMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#06221a'),
    roughness: 0.85,
    flatShading: true,
  });

  const borneoPeaks = [
    { x: 9.0,  z: 8.0, s: 1.0, h: 2.0 },
    { x: 13.5, z: 5.5, s: 1.3, h: 2.4 }, // Kelabit highlands
    { x: 16.0, z: 2.5, s: 1.1, h: 2.1 }, // Crocker range
    { x: 18.5, z: -1.0, s: 1.4, h: 2.6 },
  ];

  borneoPeaks.forEach(p => {
    const peak = new THREE.Mesh(mountainGeom, mountainMat);
    peak.position.set(p.x, 1.0 + p.h * 0.4, p.z);
    peak.scale.set(p.s, p.h, p.s);
    peak.castShadow = true;
    group.add(peak);
  });

  // MOUNT KINABALU - Iconic high granite peak in Sabah
  const kinabaluGroup = new THREE.Group();
  kinabaluGroup.position.set(19.5, 1.2, -4.5);

  const kBase = new THREE.Mesh(
    new THREE.ConeGeometry(2.6, 4.2, 6),
    new THREE.MeshStandardMaterial({ color: '#2a3b35', roughness: 0.9, flatShading: true })
  );
  kBase.position.y = 1.8;
  kBase.castShadow = true;
  kinabaluGroup.add(kBase);

  // Granite crown on top
  const kCrown = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 1.8, 5),
    new THREE.MeshStandardMaterial({ color: '#7a8581', roughness: 0.7, flatShading: true })
  );
  kCrown.position.y = 3.8;
  kCrown.castShadow = true;
  kinabaluGroup.add(kCrown);

  group.add(kinabaluGroup);

  return group;
}

/**
 * Creates miniature 3D landmark models:
 * - Petronas Twin Towers with Skybridge
 * - Penang Cable Bridge
 * - Langkawi Eagle Monument
 * - Melaka Dutch Clocktower
 */
export function createMiniatureLandmarks(): THREE.Group {
  const landmarks = new THREE.Group();

  // 1. PETRONAS TWIN TOWERS in Kuala Lumpur (-16.2, 1.2, 1.8)
  const petronas = new THREE.Group();
  petronas.position.set(-16.0, 1.2, 1.8);

  const towerMat = new THREE.MeshStandardMaterial({
    color: '#d4e6f1',
    metalness: 0.85,
    roughness: 0.15,
    flatShading: true,
  });
  const spireMat = new THREE.MeshStandardMaterial({
    color: '#f9f9f9',
    metalness: 0.95,
    roughness: 0.1,
  });

  // Left & Right Towers
  [-0.35, 0.35].forEach((offsetX) => {
    // Tower tiers
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 2.2, 8), towerMat);
    tier1.position.set(offsetX, 1.1, 0);
    tier1.castShadow = true;
    petronas.add(tier1);

    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.4, 8), towerMat);
    tier2.position.set(offsetX, 2.5, 0);
    tier2.castShadow = true;
    petronas.add(tier2);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.06, 1.0, 8), spireMat);
    spire.position.set(offsetX, 3.6, 0);
    spire.castShadow = true;
    petronas.add(spire);
  });

  // Skybridge between towers
  const skybridge = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.12, 0.15),
    new THREE.MeshStandardMaterial({ color: '#b0c4de', metalness: 0.8, roughness: 0.3 })
  );
  skybridge.position.set(0, 2.1, 0);
  petronas.add(skybridge);

  // KL Glow beacon
  const beaconLight = new THREE.PointLight('#ffd700', 0.6, 6);
  beaconLight.position.set(0, 3.8, 0);
  petronas.add(beaconLight);

  landmarks.add(petronas);

  // 2. PENANG BRIDGE (-20.4, 1.0, -6.5)
  const bridge = new THREE.Group();
  bridge.position.set(-20.4, 0.9, -6.5);
  bridge.rotation.y = -0.4;

  const road = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.08, 0.2),
    new THREE.MeshStandardMaterial({ color: '#f3f4f6', roughness: 0.6 })
  );
  bridge.add(road);

  // Pylon
  const pylon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.9, 6),
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 })
  );
  pylon.position.y = 0.45;
  bridge.add(pylon);
  landmarks.add(bridge);

  // 3. LANGKAWI EAGLE MONUMENT (-21.5, 0.9, -11.6)
  const eagle = new THREE.Group();
  eagle.position.set(-21.5, 0.8, -11.6);
  const eaglePedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.35, 0.3, 8),
    new THREE.MeshStandardMaterial({ color: '#c2b280', roughness: 0.8 })
  );
  eagle.add(eaglePedestal);
  const eagleWings = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.5, 4),
    new THREE.MeshStandardMaterial({ color: '#8b4513', roughness: 0.7 })
  );
  eagleWings.rotation.z = Math.PI;
  eagleWings.position.y = 0.4;
  eagle.add(eagleWings);
  landmarks.add(eagle);

  // 4. MELAKA DUTCH SQUARE CLOCKTOWER (-15.5, 1.0, 5.8)
  const melakaClock = new THREE.Group();
  melakaClock.position.set(-15.5, 1.0, 5.8);
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.9, 0.4),
    new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.85 }) // Stadthuys terracotta red
  );
  tower.position.y = 0.45;
  melakaClock.add(tower);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.35, 4),
    new THREE.MeshStandardMaterial({ color: '#450a0a', roughness: 0.7 })
  );
  roof.position.y = 1.05;
  roof.rotation.y = Math.PI / 4;
  melakaClock.add(roof);
  landmarks.add(melakaClock);

  return landmarks;
}

/**
 * Creates low-poly tropical trees (palms & jungle canopy)
 */
export function createTropicalFoliage(): THREE.Group {
  const group = new THREE.Group();

  const trunkGeom = new THREE.CylinderGeometry(0.04, 0.08, 0.6, 5);
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#5c4033', roughness: 0.9 });

  const palmCrownGeom = new THREE.ConeGeometry(0.35, 0.3, 6);
  const palmCrownMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.6, flatShading: true });

  const treeLocations = [
    // Peninsula west coast
    { x: -18.2, z: -8.0 },
    { x: -17.5, z: -3.0 },
    { x: -16.8, z: 0.5 },
    { x: -15.0, z: 4.5 },
    { x: -13.0, z: 9.0 },
    // Peninsula east coast
    { x: -11.5, z: 3.5 },
    { x: -11.0, z: -3.0 },
    { x: -12.0, z: -8.5 },
    // Langkawi & Penang
    { x: -21.2, z: -11.2 },
    { x: -20.6, z: -6.0 },
    // Borneo coastlines
    { x: 5.5, z: 10.0 },
    { x: 10.0, z: 6.5 },
    { x: 14.0, z: 2.0 },
    { x: 17.0, z: -3.0 },
    { x: 23.0, z: -4.0 },
    { x: 23.5, z: 3.0 },
  ];

  treeLocations.forEach(loc => {
    const tree = new THREE.Group();
    tree.position.set(loc.x, 1.2, loc.z);

    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = 0.3;
    trunk.castShadow = true;
    tree.add(trunk);

    const crown = new THREE.Mesh(palmCrownGeom, palmCrownMat);
    crown.position.y = 0.65;
    crown.castShadow = true;
    tree.add(crown);

    group.add(tree);
  });

  return group;
}

/**
 * Creates animated floating low-poly clouds
 */
export function createClouds(): THREE.Group {
  const group = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.4,
    transparent: true,
    opacity: 0.88,
    flatShading: true,
  });

  const cloudConfigs = [
    { x: -16, y: 5.5, z: -5, scale: 1.2 },
    { x: -8,  y: 6.2, z: 4,  scale: 1.5 },
    { x: 0,   y: 5.8, z: -8, scale: 1.8 },
    { x: 10,  y: 6.5, z: 2,  scale: 1.4 },
    { x: 18,  y: 5.2, z: -6, scale: 1.6 },
    { x: 24,  y: 6.0, z: 6,  scale: 1.1 },
  ];

  cloudConfigs.forEach(c => {
    const cloud = new THREE.Group();
    cloud.position.set(c.x, c.y, c.z);

    // Cluster 3-4 spheres for fluffy puff
    const p1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8 * c.scale, 1), cloudMat);
    p1.position.set(0, 0, 0);
    cloud.add(p1);

    const p2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6 * c.scale, 1), cloudMat);
    p2.position.set(-0.7 * c.scale, -0.1, 0.2);
    cloud.add(p2);

    const p3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7 * c.scale, 1), cloudMat);
    p3.position.set(0.7 * c.scale, -0.15, -0.2);
    cloud.add(p3);

    group.add(cloud);
  });

  return group;
}

/**
 * Creates ocean plane with subtle shimmer & depth
 */
export function createOcean(): THREE.Mesh {
  const geom = new THREE.PlaneGeometry(120, 100, 32, 32);
  geom.rotateX(-Math.PI / 2);

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#08251e'), // Lotus Deep Jade Ocean
    roughness: 0.15,
    metalness: 0.35,
    transparent: true,
    opacity: 0.95,
  });

  const ocean = new THREE.Mesh(geom, mat);
  ocean.position.y = -0.1;
  ocean.receiveShadow = true;
  return ocean;
}
