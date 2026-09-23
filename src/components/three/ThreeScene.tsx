import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useV3D } from '../../state/useV3DStore';
import { Plus, Minus, RotateCcw, Compass, Move, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraActionsRef = useRef<{
    zoom: (factor: number) => void;
    orbit: (dTheta: number, dPhi: number) => void;
    reset: () => void;
  } | null>(null);
  const {
    parcels,
    buildings,
    metroTunnel,
    metroStation,
    utilities,
    conflicts,
    layerVisibility,
    explodeFloorsValue,
    sectionPlaneActive,
    sectionPlaneOffset,
    sectionAxis,
    wireframeMode,
    translucentGround,
    selectedBuildingId,
    setSelectedBuildingId,
    selectedFloorNumber,
    setSelectedFloorNumber,
    selectedConflictId,
    setSelectedConflictId,
    activeMeasurementTool,
    focusTarget,
    setFocusTarget,
    theme,
  } = useV3D();

  const isDark = theme === 'dark';
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  // References to keep Three.js state across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);
  const clippingPlaneRef = useRef<THREE.Plane | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
  const targetLookAtRef = useRef<THREE.Vector3 | null>(null);
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'dark' ? 0x0f141c : 0xf8fafc);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 2000);
    camera.position.set(180, 140, 220);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with local clipping enabled
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'dark' ? 0.7 : 1.1);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(0xeef4ff, theme === 'dark' ? 1.2 : 1.4);
    dirLight.position.set(200, 350, 150);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const subLight = new THREE.DirectionalLight(0x406080, 0.5);
    subLight.position.set(-100, -200, -100);
    scene.add(subLight);

    // 5. Engineering Grid & Datum Plane
    const gridHelper = new THREE.GridHelper(
      600,
      60,
      theme === 'dark' ? 0x2a3649 : 0x94a3b8,
      theme === 'dark' ? 0x182230 : 0xe2e8f0
    );
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Axis Helper
    const axesHelper = new THREE.AxesHelper(30);
    axesHelper.position.set(-200, 0.2, -150);
    scene.add(axesHelper);

    // 6. Dynamic objects group
    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    dynamicGroupRef.current = dynamicGroup;

    // Orbit controls handling (custom smooth mouse interaction)
    let isDragging = false;
    let isPanning = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = new THREE.Spherical().setFromVector3(
      camera.position.clone().sub(currentLookAtRef.current)
    );

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDragging = true;
      if (e.button === 2) isPanning = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (isDragging) {
        spherical.theta -= dx * 0.005;
        spherical.phi = Math.max(0.05, Math.min(Math.PI / 2 + 0.35, spherical.phi - dy * 0.005));
        const offset = new THREE.Vector3().setFromSpherical(spherical);
        camera.position.copy(currentLookAtRef.current).add(offset);
        camera.lookAt(currentLookAtRef.current);
      } else if (isPanning) {
        const panSpeed = 0.35;
        const right = new THREE.Vector3().crossVectors(camera.up, camera.position.clone().sub(currentLookAtRef.current)).normalize();
        const up = camera.up.clone().normalize();
        const pan = right.multiplyScalar(-dx * panSpeed).add(up.multiplyScalar(dy * panSpeed));
        currentLookAtRef.current.add(pan);
        camera.position.add(pan);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      isPanning = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      spherical.radius = Math.max(15, Math.min(1200, spherical.radius * zoomFactor));
      const offset = new THREE.Vector3().setFromSpherical(spherical);
      camera.position.copy(currentLookAtRef.current).add(offset);
      camera.lookAt(currentLookAtRef.current);
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    // Touch Interaction for Mobile & Tablet (1-finger orbit, 2-finger pinch-zoom & pan)
    let touchStartDist = 0;
    let prevTouchX = 0;
    let prevTouchY = 0;
    let isTouchInteracting = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isTouchInteracting = true;
        prevTouchX = e.touches[0].clientX;
        prevTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        isTouchInteracting = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
        prevTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        prevTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouchInteracting) return;
      e.preventDefault();

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const dx = touch.clientX - prevTouchX;
        const dy = touch.clientY - prevTouchY;
        prevTouchX = touch.clientX;
        prevTouchY = touch.clientY;

        spherical.theta -= dx * 0.007;
        spherical.phi = Math.max(0.05, Math.min(Math.PI / 2 + 0.35, spherical.phi - dy * 0.007));
        const offset = new THREE.Vector3().setFromSpherical(spherical);
        camera.position.copy(currentLookAtRef.current).add(offset);
        camera.lookAt(currentLookAtRef.current);
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);

        if (touchStartDist > 0 && dist > 0) {
          const zoomRatio = touchStartDist / dist;
          spherical.radius = Math.max(15, Math.min(1200, spherical.radius * Math.pow(zoomRatio, 0.6)));
          touchStartDist = dist;
        }

        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const panDx = midX - prevTouchX;
        const panDy = midY - prevTouchY;
        prevTouchX = midX;
        prevTouchY = midY;

        const panSpeed = 0.4;
        const right = new THREE.Vector3().crossVectors(camera.up, camera.position.clone().sub(currentLookAtRef.current)).normalize();
        const up = camera.up.clone().normalize();
        const pan = right.multiplyScalar(-panDx * panSpeed).add(up.multiplyScalar(panDy * panSpeed));
        currentLookAtRef.current.add(pan);
        camera.position.add(pan);

        const offset = new THREE.Vector3().setFromSpherical(spherical);
        camera.position.copy(currentLookAtRef.current).add(offset);
        camera.lookAt(currentLookAtRef.current);
      }
    };

    const onTouchEnd = () => {
      isTouchInteracting = false;
      touchStartDist = 0;
    };

    // Expose programmatic camera controls
    cameraActionsRef.current = {
      zoom: (factor: number) => {
        spherical.radius = Math.max(15, Math.min(1200, spherical.radius * factor));
        const offset = new THREE.Vector3().setFromSpherical(spherical);
        camera.position.copy(currentLookAtRef.current).add(offset);
        camera.lookAt(currentLookAtRef.current);
      },
      orbit: (dTheta: number, dPhi: number) => {
        spherical.theta += dTheta;
        spherical.phi = Math.max(0.05, Math.min(Math.PI / 2 + 0.35, spherical.phi + dPhi));
        const offset = new THREE.Vector3().setFromSpherical(spherical);
        camera.position.copy(currentLookAtRef.current).add(offset);
        camera.lookAt(currentLookAtRef.current);
      },
      reset: () => {
        currentLookAtRef.current.set(0, 0, 0);
        camera.position.set(180, 140, 220);
        camera.lookAt(0, 0, 0);
        spherical.setFromVector3(camera.position.clone().sub(currentLookAtRef.current));
      },
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('contextmenu', onContextMenu);
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    domElement.addEventListener('touchend', onTouchEnd, { passive: true });
    domElement.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Smooth camera tween if focusTarget is set ("slow move")
      if (targetCamPosRef.current && targetLookAtRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.04);
        currentLookAtRef.current.lerp(targetLookAtRef.current, 0.04);
        camera.lookAt(currentLookAtRef.current);
        spherical.setFromVector3(camera.position.clone().sub(currentLookAtRef.current));

        if (camera.position.distanceTo(targetCamPosRef.current) < 0.8) {
          targetCamPosRef.current = null;
          targetLookAtRef.current = null;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('contextmenu', onContextMenu);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Handle Camera Focus smoothly when focusTarget changes
  useEffect(() => {
    if (!focusTarget || !cameraRef.current) return;
    const [tx, ty, tz] = focusTarget;
    targetLookAtRef.current = new THREE.Vector3(tx, ty, tz);
    targetCamPosRef.current = new THREE.Vector3(tx + 60, ty + 45, tz + 70);
    setFocusTarget(null);
  }, [focusTarget, setFocusTarget]);

  // Handle Theme changes dynamically in 3D Scene
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.background = new THREE.Color(isDark ? 0x0f141c : 0xf8fafc);
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = isDark ? 0.7 : 1.1;
    }
    if (dirLightRef.current) {
      dirLightRef.current.intensity = isDark ? 1.2 : 1.4;
    }
  }, [theme, isDark]);

  // Handle Section Clipping Plane
  useEffect(() => {
    if (!rendererRef.current) return;
    if (sectionPlaneActive) {
      let normal = new THREE.Vector3(1, 0, 0);
      if (sectionAxis === 'y') normal = new THREE.Vector3(0, 1, 0);
      if (sectionAxis === 'z') normal = new THREE.Vector3(0, 0, 1);
      const plane = new THREE.Plane(normal, sectionPlaneOffset);
      clippingPlaneRef.current = plane;
      rendererRef.current.clippingPlanes = [plane];
    } else {
      clippingPlaneRef.current = null;
      rendererRef.current.clippingPlanes = [];
    }
  }, [sectionPlaneActive, sectionPlaneOffset, sectionAxis]);

  // Re-populate 3D scene meshes whenever data or display parameters change
  useEffect(() => {
    const group = dynamicGroupRef.current;
    if (!group) return;

    // Clear previous dynamic objects
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ((obj as any).geometry) (obj as any).geometry.dispose();
      if ((obj as any).material) {
        if (Array.isArray((obj as any).material)) {
          (obj as any).material.forEach((m: any) => m.dispose());
        } else {
          (obj as any).material.dispose();
        }
      }
    }

    // 1. Terrain & Subsurface Ground Slab
    const groundGeo = new THREE.BoxGeometry(500, 30, 450);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x131b26,
      roughness: 0.9,
      transparent: translucentGround,
      opacity: translucentGround ? 0.35 : 0.95,
      depthWrite: !translucentGround,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.set(0, -15, 0);
    group.add(groundMesh);

    // 2. Parcels (Cadastral Boundaries)
    if (layerVisibility.parcels) {
      parcels.forEach((parcel) => {
        const [p1, p2, p3, p4] = parcel.localPolygon;
        const width = Math.abs(p2[0] - p1[0]);
        const depth = Math.abs(p3[1] - p2[1]);

        // Boundary line
        const borderGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(p1[0], 0.1, p1[1]),
          new THREE.Vector3(p2[0], 0.1, p2[1]),
          new THREE.Vector3(p3[0], 0.1, p3[1]),
          new THREE.Vector3(p4[0], 0.1, p4[1]),
          new THREE.Vector3(p1[0], 0.1, p1[1]),
        ]);
        const borderMat = new THREE.LineBasicMaterial({
          color: parcel.parcelId === 'P-007' ? 0x38bdf8 : 0x475569,
          linewidth: parcel.parcelId === 'P-007' ? 2 : 1,
        });
        const borderLine = new THREE.Line(borderGeo, borderMat);
        borderLine.position.set(
          (parcel.boundaryCoordinates[0][0] - 80.2435) / 0.000009,
          0,
          (parcel.boundaryCoordinates[0][1] - 12.9865) / 0.000009
        );
        group.add(borderLine);
      });
    }

    // 3. Buildings & Individual Vertical Floors
    if (layerVisibility.buildings) {
      buildings.forEach((building) => {
        const isSelectedBuilding = building.buildingId === selectedBuildingId;
        const bX = building.localX + building.width / 2;
        const bZ = building.localY + building.depth / 2;

        building.floors.forEach((floor) => {
          const isSelectedFloor = isSelectedBuilding && floor.floorNumber === selectedFloorNumber;
          const isBasement = floor.floorNumber < 0;

          // Compute vertical displacement for Exploded View
          const explodeY = !isBasement && floor.floorNumber > 0 ? floor.floorNumber * explodeFloorsValue : 0;
          const floorThickness = floor.height * 0.94;
          const centerY = (floor.zMin + floor.zMax) / 2 + explodeY;

          const floorGeo = new THREE.BoxGeometry(
            building.width * 0.95,
            floorThickness,
            building.depth * 0.95
          );

          let floorColor = 0x3b82f6; // Default engineering cyan-blue
          if (isBasement) {
            floorColor = 0x64748b; // Slate gray basement
          } else if (floor.floorType === 'GROUND') {
            floorColor = 0x0284c7; // Deep blue ground floor
          } else if (building.buildingId === 'B-007' && floor.floorNumber === -2) {
            floorColor = 0xef4444; // Red for the clash basement!
          } else if (floor.floorNumber % 2 === 0) {
            floorColor = 0x2563eb;
          }

          if (isSelectedFloor) {
            floorColor = 0x38bdf8; // Bright cyan highlight
          }

          const floorMat = new THREE.MeshStandardMaterial({
            color: floorColor,
            roughness: 0.35,
            metalness: 0.25,
            wireframe: wireframeMode,
            transparent: isBasement || isSelectedBuilding,
            opacity: isBasement ? 0.75 : isSelectedFloor ? 1.0 : isSelectedBuilding ? 0.88 : 0.82,
          });

          const floorMesh = new THREE.Mesh(floorGeo, floorMat);
          floorMesh.position.set(bX, centerY, bZ);
          floorMesh.castShadow = !isBasement;
          floorMesh.receiveShadow = true;

          // Attach metadata for raycasting / click inspection
          floorMesh.userData = {
            type: 'FLOOR',
            buildingId: building.buildingId,
            floorNumber: floor.floorNumber,
            unitCount: floor.units.length,
            buildingName: building.name,
          };

          group.add(floorMesh);

          // Floor Slab Divider Plate
          if (!wireframeMode) {
            const slabGeo = new THREE.BoxGeometry(
              building.width * 1.02,
              0.25,
              building.depth * 1.02
            );
            const slabMat = new THREE.MeshStandardMaterial({
              color: isSelectedFloor ? 0xffffff : 0x1e293b,
              roughness: 0.7,
            });
            const slabMesh = new THREE.Mesh(slabGeo, slabMat);
            slabMesh.position.set(bX, floor.zMax + explodeY, bZ);
            group.add(slabMesh);
          }
        });
      });
    }

    // 4. Subsurface Metro System
    if (layerVisibility.underground && layerVisibility.metro) {
      // Metro Tunnel Tube (True 3D cylinder along path)
      const tunnelPoints = metroTunnel.path.map(([x, y, z]) => new THREE.Vector3(x, z, y));
      const curve = new THREE.CatmullRomCurve3(tunnelPoints);
      const tubeGeo = new THREE.TubeGeometry(curve, 40, metroTunnel.diameter / 2, 16, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.5,
        wireframe: false,
        transparent: true,
        opacity: 0.75,
      });
      const tunnelMesh = new THREE.Mesh(tubeGeo, tubeMat);
      group.add(tunnelMesh);

      // Metro Tunnel Track line inside
      const trackPoints = metroTunnel.path.map(([x, y, z]) => new THREE.Vector3(x, z - 1.2, y));
      const trackCurve = new THREE.CatmullRomCurve3(trackPoints);
      const trackGeo = new THREE.TubeGeometry(trackCurve, 40, 0.4, 8, false);
      const trackMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2 });
      group.add(new THREE.Mesh(trackGeo, trackMat));

      // Metro Underground Station Box
      const stnGeo = new THREE.BoxGeometry(
        metroStation.length,
        metroStation.depth,
        metroStation.width
      );
      const stnMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.55,
        roughness: 0.6,
      });
      const stnMesh = new THREE.Mesh(stnGeo, stnMat);
      stnMesh.position.set(
        metroStation.localX,
        metroStation.platformElevation / 2,
        metroStation.localY
      );
      group.add(stnMesh);

      // Metro Entrances (Vertical Access Shafts)
      metroStation.entrances.forEach((ent) => {
        const entGeo = new THREE.BoxGeometry(6, 16, 6);
        const entMat = new THREE.MeshStandardMaterial({
          color: 0x34d399,
          roughness: 0.4,
          transparent: true,
          opacity: 0.85,
        });
        const entMesh = new THREE.Mesh(entGeo, entMat);
        entMesh.position.set(ent.x, -8, ent.y);
        group.add(entMesh);
      });
    }

    // 5. Underground Utilities (Water, Sewer, Electrical, Telecom)
    if (layerVisibility.underground) {
      utilities.forEach((util) => {
        const isWater = util.type === 'WATER_MAIN';
        const isSewer = util.type === 'SEWER_TRUNK';
        const isElec = util.type === 'ELECTRICAL_CONDUIT';
        const isTelco = util.type === 'TELECOM_DUCT';

        if (
          (isWater && !layerVisibility.water) ||
          (isSewer && !layerVisibility.sewer) ||
          (isElec && !layerVisibility.electrical) ||
          (isTelco && !layerVisibility.telecom)
        ) {
          return;
        }

        const color = isWater
          ? 0x0284c7
          : isSewer
          ? 0xd97706
          : isElec
          ? 0xeab308
          : 0x06b6d4;

        const points = util.path.map(([x, y, z]) => new THREE.Vector3(x, z, y));
        const curve = new THREE.CatmullRomCurve3(points);
        const radius = (util.diameterMm / 1000) * 1.4;
        const pipeGeo = new THREE.TubeGeometry(curve, 24, radius, 12, false);
        const pipeMat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.4,
          emissive: color,
          emissiveIntensity: 0.25,
        });
        const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
        group.add(pipeMesh);
      });
    }

    // 6. 3D Spatial Conflict Highlights
    if (layerVisibility.conflicts) {
      conflicts.forEach((conflict) => {
        const [cx, cy, cz] = conflict.location;
        const isSelectedConflict = conflict.id === selectedConflictId;
        const color = conflict.severity === 'critical' ? 0xef4444 : 0xf59e0b;

        // Glowing 3D Bounding Box around conflict
        const clashGeo = new THREE.BoxGeometry(18, 8, 18);
        const clashMat = new THREE.MeshStandardMaterial({
          color,
          wireframe: true,
          emissive: color,
          emissiveIntensity: isSelectedConflict ? 0.9 : 0.4,
          transparent: true,
          opacity: 0.9,
        });
        const clashMesh = new THREE.Mesh(clashGeo, clashMat);
        clashMesh.position.set(cx, cz, cy);
        clashMesh.userData = { type: 'CONFLICT', id: conflict.id };
        group.add(clashMesh);

        // Core marker sphere
        const sphereGeo = new THREE.SphereGeometry(2.5, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({ color });
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        sphereMesh.position.set(cx, cz, cy);
        group.add(sphereMesh);
      });
    }

    // 7. Measurement Tool Visual Indicator
    if (activeMeasurementTool !== 'none') {
      const rulerGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(120, 0, -45),
        new THREE.Vector3(120, -16.5, -45),
      ]);
      const rulerMat = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 1,
        gapSize: 0.5,
        linewidth: 2,
      });
      const rulerLine = new THREE.Line(rulerGeo, rulerMat);
      rulerLine.computeLineDistances();
      group.add(rulerLine);
    }
  }, [
    parcels,
    buildings,
    metroTunnel,
    metroStation,
    utilities,
    conflicts,
    layerVisibility,
    explodeFloorsValue,
    wireframeMode,
    translucentGround,
    selectedBuildingId,
    selectedFloorNumber,
    selectedConflictId,
    activeMeasurementTool,
  ]);

  // Click Raycasting handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !dynamicGroupRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(dynamicGroupRef.current.children, true);
    if (intersects.length > 0) {
      for (const hit of intersects) {
        const data = hit.object.userData;
        if (data && data.type === 'FLOOR') {
          setSelectedBuildingId(data.buildingId);
          setSelectedFloorNumber(data.floorNumber);
          return;
        }
        if (data && data.type === 'CONFLICT') {
          setSelectedConflictId(data.id);
          return;
        }
      }
    }
  };

  return (
    <div className={`relative w-full h-full select-none overflow-hidden ${isDark ? 'bg-[#0a0f16]' : 'bg-slate-50'}`}>
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onClick={handleCanvasClick}
      />

      {/* 3D Depth & Compass HUD */}
      <div
        className={`absolute top-3 sm:top-4 left-3 sm:left-4 pointer-events-none backdrop-blur-md border rounded-lg px-3 py-2 text-xs font-mono space-y-1 z-20 max-w-[240px] sm:max-w-xs ${
          isDark
            ? 'bg-slate-900/85 border-slate-700/80 text-slate-200 shadow-xl'
            : 'bg-white/95 border-slate-300 text-slate-900 shadow-md'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className={`font-bold tracking-wide ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>3D DIGITAL TWIN</span>
        </div>
        <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-[10px] sm:text-[11px]`}>CRS: EPSG:32644 (UTM 44N)</div>
        <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-[10px] sm:text-[11px]`}>Datum: MSL +12.0m</div>
      </div>

      {/* Floating 3D Navigation Controls (Pinch/Zoom/Orbit for Mobile & Desktop) */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 flex flex-col items-center gap-1.5 font-mono">
        <div
          className={`flex flex-col rounded-xl border backdrop-blur-md p-1 shadow-lg ${
            isDark ? 'bg-slate-900/90 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-300 text-slate-800 shadow-md'
          }`}
        >
          <button
            onClick={() => cameraActionsRef.current?.zoom(0.85)}
            title="Zoom In 3D Scene (+)"
            className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-sky-400' : 'hover:bg-slate-100 text-sky-700'
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className={`w-full h-px my-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <button
            onClick={() => cameraActionsRef.current?.zoom(1.18)}
            title="Zoom Out 3D Scene (-)"
            className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-sky-400' : 'hover:bg-slate-100 text-sky-700'
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className={`w-full h-px my-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <button
            onClick={() => cameraActionsRef.current?.reset()}
            title="Reset Camera Orientation"
            className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Orbit Directional D-Pad (useful on touch tablet/mobile) */}
        <div
          className={`hidden sm:grid grid-cols-3 gap-0.5 p-1 rounded-xl border backdrop-blur-md shadow-lg ${
            isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/95 border-slate-300 shadow-md'
          }`}
        >
          <div />
          <button
            onClick={() => cameraActionsRef.current?.orbit(0, -0.15)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            title="Orbit Up"
          >
            <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <div />
          <button
            onClick={() => cameraActionsRef.current?.orbit(0.2, 0)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            title="Orbit Left"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <div className="w-7 h-7 flex items-center justify-center">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <button
            onClick={() => cameraActionsRef.current?.orbit(-0.2, 0)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            title="Orbit Right"
          >
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <div />
          <button
            onClick={() => cameraActionsRef.current?.orbit(0, 0.15)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            title="Orbit Down"
          >
            <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <div />
        </div>
      </div>

      {/* Depth Indicator Bar */}
      <div
        className={`absolute bottom-3 sm:bottom-6 left-3 sm:left-4 pointer-events-none backdrop-blur-md border rounded-lg p-2 sm:p-2.5 text-xs font-mono max-w-[280px] sm:max-w-sm z-20 ${
          isDark
            ? 'bg-slate-900/90 border-slate-700/80 text-slate-200 shadow-xl'
            : 'bg-white/95 border-slate-300 text-slate-900 shadow-md'
        }`}
      >
        <div className={`flex justify-between text-[10px] sm:text-[11px] mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          <span>+40m (Skyline)</span>
          <span>0m (Ground)</span>
          <span>-5m</span>
          <span>-8m</span>
          <span>-18m (Metro)</span>
        </div>
        <div className="h-2 w-full rounded bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-indigo-600" />
        <div className={`flex justify-between items-center mt-1.5 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <span>Exploded View: {explodeFloorsValue.toFixed(1)}m</span>
          <span>Clip: {sectionPlaneActive ? `${sectionAxis.toUpperCase()}: ${sectionPlaneOffset}m` : 'OFF'}</span>
        </div>
      </div>
    </div>
  );
};
