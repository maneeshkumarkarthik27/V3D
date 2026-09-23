import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useV3D } from '../../state/useV3DStore';
import {
  TAMIL_NADU_DISTRICTS,
  DistrictInfo,
  ProjectAreaInfo,
  TamilNaduZone,
} from '../../data/tamilNaduRegions';
import {
  MAP_CANVAS_WIDTH,
  MAP_CANVAS_HEIGHT,
  projectGeoToSvg,
  getTamilNaduBoundarySvgPath,
  getTamilNaduCoastlineSvgPath,
  getSatelliteTilesForTamilNadu,
  SatelliteTile,
} from './mapUtils';
import {
  MapPin,
  Layers,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Building as BuildingIcon,
  Search,
  ArrowRight,
  ArrowLeft,
  Filter,
  Download,
  ExternalLink,
  Award,
  ChevronRight,
  ShieldCheck,
  Compass,
  FileSpreadsheet,
  Check,
  AlertTriangle,
  LocateFixed,
  Navigation,
  Sparkles,
  Globe2,
  Eye,
  Type,
  Maximize2,
  Minimize2,
  Sliders,
  Satellite,
  Plus,
  Minus,
  RotateCcw,
  Crosshair,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  X,
} from 'lucide-react';
import { UlpinAllocationModal } from './UlpinAllocationModal';
import { UlpinCertificateModal } from './UlpinCertificateModal';
import { ExportService } from '../../services/exportService';

type WorkflowStep = 'state-map' | 'choose-area' | 'area-buildings';
type MapLayerMode = 'cadastral' | 'satellite' | 'hybrid';
type LabelSizeMode = 'standard' | 'large' | 'xlarge';

// Directional offsets for all 38 districts to avoid collision and keep city names crystal clear
export const DISTRICT_LABEL_CONFIG: Record<
  string,
  { dx: number; dy: number; textAnchor: 'start' | 'middle' | 'end' }
> = {
  chennai: { dx: 14, dy: -2, textAnchor: 'start' },
  chengalpattu: { dx: 14, dy: 6, textAnchor: 'start' },
  kanchipuram: { dx: -14, dy: 14, textAnchor: 'end' },
  tiruvallur: { dx: -12, dy: -14, textAnchor: 'end' },
  ranipet: { dx: 0, dy: -16, textAnchor: 'middle' },
  vellore: { dx: -14, dy: 2, textAnchor: 'end' },
  tirupattur: { dx: -14, dy: 14, textAnchor: 'end' },
  krishnagiri: { dx: -14, dy: -10, textAnchor: 'end' },
  dharmapuri: { dx: -14, dy: 4, textAnchor: 'end' },
  salem: { dx: 0, dy: -16, textAnchor: 'middle' },
  namakkal: { dx: 16, dy: -4, textAnchor: 'start' },
  karur: { dx: -16, dy: 2, textAnchor: 'end' },
  erode: { dx: -14, dy: -6, textAnchor: 'end' },
  tiruppur: { dx: 0, dy: 18, textAnchor: 'middle' },
  coimbatore: { dx: -16, dy: 0, textAnchor: 'end' },
  nilgiris: { dx: -14, dy: -12, textAnchor: 'end' },
  cuddalore: { dx: 16, dy: 0, textAnchor: 'start' },
  viluppuram: { dx: 16, dy: -6, textAnchor: 'start' },
  kallakurichi: { dx: -14, dy: 0, textAnchor: 'end' },
  tiruvannamalai: { dx: 0, dy: -16, textAnchor: 'middle' },
  perambalur: { dx: -14, dy: -14, textAnchor: 'end' },
  ariyalur: { dx: 16, dy: -8, textAnchor: 'start' },
  tiruchirappalli: { dx: 0, dy: 18, textAnchor: 'middle' },
  thanjavur: { dx: 16, dy: 6, textAnchor: 'start' },
  tiruvarur: { dx: 0, dy: 18, textAnchor: 'middle' },
  mayiladuthurai: { dx: 16, dy: -8, textAnchor: 'start' },
  nagapattinam: { dx: 16, dy: 6, textAnchor: 'start' },
  pudukkottai: { dx: 14, dy: 14, textAnchor: 'start' },
  sivaganga: { dx: 16, dy: 6, textAnchor: 'start' },
  dindigul: { dx: -16, dy: 4, textAnchor: 'end' },
  theni: { dx: -16, dy: 0, textAnchor: 'end' },
  madurai: { dx: -16, dy: -6, textAnchor: 'end' },
  virudhunagar: { dx: -16, dy: 6, textAnchor: 'end' },
  ramanathapuram: { dx: 16, dy: 6, textAnchor: 'start' },
  thoothukudi: { dx: 16, dy: 0, textAnchor: 'start' },
  tenkasi: { dx: -16, dy: 0, textAnchor: 'end' },
  tirunelveli: { dx: -16, dy: 6, textAnchor: 'end' },
  kanniyakumari: { dx: 0, dy: 20, textAnchor: 'middle' },
};

// Default State ViewBox covering entire Tamil Nadu canvas [x, y, width, height]
const DEFAULT_STATE_VIEWBOX: [number, number, number, number] = [0, 0, MAP_CANVAS_WIDTH, MAP_CANVAS_HEIGHT];

export const TamilNaduGISMap: React.FC = () => {
  const {
    selectedDistrict,
    setSelectedDistrict,
    selectedProjectArea,
    setSelectedProjectArea,
    switchProjectArea,
    selectedParcelId,
    setSelectedParcelId,
    selectedBuildingId,
    setSelectedBuildingId,
    selectedFloorNumber,
    setSelectedFloorNumber,
    parcels,
    buildings,
    setCurrentView,
    setViewMode,
    setFocusTarget,
    allocate3DUlpinForBuilding,
    allocate3DUlpinForArea,
    setExplodeFloorsValue,
    theme,
    setTheme,
  } = useV3D();

  const isDark = theme === 'dark';

  // Workflow step state: 1: state-map -> 2: choose-area -> 3: area-buildings
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('state-map');

  // Map Layer Mode: 'cadastral' (vector) | 'satellite' (true earth imagery) | 'hybrid' (both)
  const [mapLayerMode, setMapLayerMode] = useState<MapLayerMode>('cadastral');

  // City Name Font Size Mode: 'standard' (14px) | 'large' (18px) | 'xlarge' (22px)
  const [labelSize, setLabelSize] = useState<LabelSizeMode>('standard');

  // Filter mode: 'all' (all 38 districts) | 'major' (major municipal hubs)
  const [districtFilterMode, setDistrictFilterMode] = useState<'all' | 'major'>('all');

  // View Layout: 'split' (38 Districts directory + Map) vs 'map-only' (Full width map)
  const [viewLayout, setViewLayout] = useState<'split' | 'map-only'>('split');
  const [activeZonePreset, setActiveZonePreset] = useState<string>('All');

  // Smooth Camera Pan/Zoom animation state ("slowly move to that location")
  const [isCameraMoving, setIsCameraMoving] = useState(false);
  const [cameraTargetName, setCameraTargetName] = useState<string>('');
  const [cameraProgress, setCameraProgress] = useState(0);
  const [currentViewBox, setCurrentViewBox] = useState<[number, number, number, number]>(DEFAULT_STATE_VIEWBOX);

  // Drag pan interaction states
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; vb: [number, number, number, number] }>({
    x: 0,
    y: 0,
    vb: DEFAULT_STATE_VIEWBOX,
  });

  // Current zoom percentage indicator
  const currentZoomPercent = useMemo(
    () => Math.round((MAP_CANVAS_WIDTH / currentViewBox[2]) * 100),
    [currentViewBox]
  );

  // Search and filter state for Step 1
  const [searchDistrictQuery, setSearchDistrictQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<TamilNaduZone | 'All'>('All');

  // Hover state for districts with zero-jitter fixed hit targeting
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);

  // Satellite Imagery Tiles
  const satelliteTiles = useMemo(() => getSatelliteTilesForTamilNadu(7), []);

  // Filter for Step 3 buildings
  const [buildingFilter, setBuildingFilter] = useState<'all' | 'allocated' | 'pending' | 'basement'>('all');
  const [searchBuildingQuery, setSearchBuildingQuery] = useState('');
  const [step3SatelliteUnderlay, setStep3SatelliteUnderlay] = useState(false);

  // Modals state
  const [allocationModalTarget, setAllocationModalTarget] = useState<{
    type: 'area' | 'building';
    targetName: string;
    buildings: typeof buildings;
  } | null>(null);

  const [certificateBuildingId, setCertificateBuildingId] = useState<string | null>(null);

  // Responsive mobile drawer & tab states
  const [showMobileDistrictList, setShowMobileDistrictList] = useState(false);
  const [mobileStep3Tab, setMobileStep3Tab] = useState<'buildings' | 'cadastre'>('buildings');

  // Active district & area objects
  const currentDistrictObj = useMemo(
    () => TAMIL_NADU_DISTRICTS.find((d) => d.id === selectedDistrict) || TAMIL_NADU_DISTRICTS[0],
    [selectedDistrict]
  );

  const currentAreaObj = useMemo(() => {
    for (const taluk of currentDistrictObj.taluks) {
      const found = taluk.projectAreas.find((pa) => pa.id === selectedProjectArea);
      if (found) return found;
    }
    return currentDistrictObj.taluks[0]?.projectAreas[0];
  }, [currentDistrictObj, selectedProjectArea]);

  // Active inspected building in step 3
  const inspectedBuilding = useMemo(() => {
    return buildings.find((b) => b.buildingId === selectedBuildingId) || buildings[0];
  }, [buildings, selectedBuildingId]);

  const inspectedParcel = useMemo(() => {
    return parcels.find((p) => p.parcelId === (inspectedBuilding?.parcelId || selectedParcelId)) || parcels[0];
  }, [parcels, inspectedBuilding, selectedParcelId]);

  // Filtered districts for Step 1
  const filteredDistricts = useMemo(() => {
    return TAMIL_NADU_DISTRICTS.filter((dist) => {
      const matchesSearch =
        dist.name.toLowerCase().includes(searchDistrictQuery.toLowerCase()) ||
        dist.code.toLowerCase().includes(searchDistrictQuery.toLowerCase()) ||
        dist.headquarters.toLowerCase().includes(searchDistrictQuery.toLowerCase());
      const matchesZone = selectedZone === 'All' || dist.zone === selectedZone;
      const matchesDensity = districtFilterMode === 'all' || dist.isMajorHub;
      return matchesSearch && matchesZone && matchesDensity;
    });
  }, [searchDistrictQuery, selectedZone, districtFilterMode]);

  // Step 3 buildings stats & filtering
  const allocatedBuildingsCount = useMemo(
    () => buildings.filter((b) => b.isUlpinAllocated).length,
    [buildings]
  );

  const filteredBuildings = useMemo(() => {
    return buildings.filter((b) => {
      const matchesSearch =
        b.buildingId.toLowerCase().includes(searchBuildingQuery.toLowerCase()) ||
        b.name.toLowerCase().includes(searchBuildingQuery.toLowerCase()) ||
        b.baseLandId.toLowerCase().includes(searchBuildingQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (buildingFilter === 'allocated') return b.isUlpinAllocated;
      if (buildingFilter === 'pending') return !b.isUlpinAllocated;
      if (buildingFilter === 'basement') return b.basementCount > 0;
      return true;
    });
  }, [buildings, searchBuildingQuery, buildingFilter]);

  // Boundary SVG path memo
  const boundarySvgPath = useMemo(() => getTamilNaduBoundarySvgPath(), []);
  const coastlineSvgPath = useMemo(() => getTamilNaduCoastlineSvgPath(), []);

  // Animation frame ref for smooth camera movement
  const animationFrameRef = useRef<number | null>(null);

  // Smooth animation to any target viewBox
  const animateToViewBox = (targetVB: [number, number, number, number], duration = 450) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const startVB = [...currentViewBox] as [number, number, number, number];
    const startTime = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      const interpolated: [number, number, number, number] = [
        startVB[0] + (targetVB[0] - startVB[0]) * eased,
        startVB[1] + (targetVB[1] - startVB[1]) * eased,
        startVB[2] + (targetVB[2] - startVB[2]) * eased,
        startVB[3] + (targetVB[3] - startVB[3]) * eased,
      ];
      setCurrentViewBox(interpolated);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      }
    };
    animationFrameRef.current = requestAnimationFrame(step);
  };

  // Zoom in centered
  const zoomIn = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    const [x, y, w, h] = currentViewBox;
    const factor = 1.38;
    const newW = Math.max(160, w / factor);
    const newH = Math.max(176, h / factor);
    const cx = x + w / 2;
    const cy = y + h / 2;
    const newX = Math.max(0, Math.min(MAP_CANVAS_WIDTH - newW, cx - newW / 2));
    const newY = Math.max(0, Math.min(MAP_CANVAS_HEIGHT - newH, cy - newH / 2));
    animateToViewBox([newX, newY, newW, newH], 250);
  };

  // Zoom out centered
  const zoomOut = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    const [x, y, w, h] = currentViewBox;
    const factor = 1.38;
    const newW = Math.min(MAP_CANVAS_WIDTH, w * factor);
    const newH = Math.min(MAP_CANVAS_HEIGHT, h * factor);
    const cx = x + w / 2;
    const cy = y + h / 2;
    const newX = Math.max(0, Math.min(MAP_CANVAS_WIDTH - newW, cx - newW / 2));
    const newY = Math.max(0, Math.min(MAP_CANVAS_HEIGHT - newH, cy - newH / 2));
    animateToViewBox([newX, newY, newW, newH], 250);
  };

  // Reset to entire state
  const resetZoom = () => {
    setActiveZonePreset('All');
    animateToViewBox(DEFAULT_STATE_VIEWBOX, 400);
  };

  // Pre-calculated geographic zone coordinates for instant jumps
  const ZONE_PRESETS: Record<string, [number, number, number, number]> = {
    All: DEFAULT_STATE_VIEWBOX,
    'Northern Capital': [380, 0, 580, 480],
    'Western Kongu': [0, 180, 560, 540],
    'Central Cauvery Delta': [260, 260, 560, 500],
    'Southern Region': [80, 400, 600, 520],
    'Far South': [80, 640, 520, 420],
    'North Western': [100, 40, 520, 480],
  };

  const zoomToZone = (zoneKey: string) => {
    const target = ZONE_PRESETS[zoneKey] || DEFAULT_STATE_VIEWBOX;
    setActiveZonePreset(zoneKey);
    animateToViewBox(target, 550);
  };

  // Focus and center onto a specific district without leaving Step 1
  const zoomToDistrict = (distId: string) => {
    const dist = TAMIL_NADU_DISTRICTS.find((d) => d.id === distId);
    if (!dist) return;
    setSelectedDistrict(dist.id);
    const [targetX, targetY] = projectGeoToSvg(dist.center[0], dist.center[1]);
    const targetWidth = 340;
    const targetHeight = 375;
    const targetVB: [number, number, number, number] = [
      Math.max(0, Math.min(MAP_CANVAS_WIDTH - targetWidth, targetX - targetWidth / 2)),
      Math.max(0, Math.min(MAP_CANVAS_HEIGHT - targetHeight, targetY - targetHeight / 2)),
      targetWidth,
      targetHeight,
    ];
    animateToViewBox(targetVB, 500);
  };

  // Mouse wheel zoom with pointer tracking
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const [vbX, vbY, vbW, vbH] = currentViewBox;
    const svgX = vbX + (mouseX / rect.width) * vbW;
    const svgY = vbY + (mouseY / rect.height) * vbH;

    const zoomFactor = e.deltaY < 0 ? 1.25 : 1 / 1.25;
    const newW = Math.max(140, Math.min(MAP_CANVAS_WIDTH, vbW / zoomFactor));
    const newH = Math.max(155, Math.min(MAP_CANVAS_HEIGHT, vbH / zoomFactor));

    const ratioX = (svgX - vbX) / vbW;
    const ratioY = (svgY - vbY) / vbH;

    const newX = Math.max(0, Math.min(MAP_CANVAS_WIDTH - newW, svgX - ratioX * newW));
    const newY = Math.max(0, Math.min(MAP_CANVAS_HEIGHT - newH, svgY - ratioY * newH));

    setCurrentViewBox([newX, newY, newW, newH]);
  };

  // Mouse pan / drag handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      vb: [...currentViewBox],
    };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const [origX, origY, vbW, vbH] = dragStartRef.current.vb;
    const svgDx = (dx / rect.width) * vbW;
    const svgDy = (dy / rect.height) * vbH;

    const newX = Math.max(0, Math.min(MAP_CANVAS_WIDTH - vbW, origX - svgDx));
    const newY = Math.max(0, Math.min(MAP_CANVAS_HEIGHT - vbH, origY - svgDy));

    setCurrentViewBox([newX, newY, vbW, vbH]);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // Touch Drag & Pinch-to-Zoom handlers for Mobile & Tablet
  const touchStartRef = useRef<{ x: number; y: number; vb: [number, number, number, number]; dist?: number }>({
    x: 0,
    y: 0,
    vb: DEFAULT_STATE_VIEWBOX,
  });

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      setIsDragging(true);
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        vb: [...currentViewBox],
      };
    } else if (e.touches.length === 2) {
      isDraggingRef.current = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      touchStartRef.current = {
        x: midX,
        y: midY,
        vb: [...currentViewBox],
        dist,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();

    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      const [origX, origY, vbW, vbH] = touchStartRef.current.vb;
      const svgDx = (dx / rect.width) * vbW;
      const svgDy = (dy / rect.height) * vbH;
      const newX = Math.max(0, Math.min(MAP_CANVAS_WIDTH - vbW, origX - svgDx));
      const newY = Math.max(0, Math.min(MAP_CANVAS_HEIGHT - vbH, origY - svgDy));
      setCurrentViewBox([newX, newY, vbW, vbH]);
    } else if (e.touches.length === 2 && touchStartRef.current.dist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = touchStartRef.current.dist / Math.max(1, dist);

      const [origX, origY, origW, origH] = touchStartRef.current.vb;
      const newW = Math.max(140, Math.min(MAP_CANVAS_WIDTH, origW * scale));
      const newH = Math.max(155, Math.min(MAP_CANVAS_HEIGHT, origH * scale));

      const cx = origX + origW / 2;
      const cy = origY + origH / 2;
      const newX = Math.max(0, Math.min(MAP_CANVAS_WIDTH - newW, cx - newW / 2));
      const newY = Math.max(0, Math.min(MAP_CANVAS_HEIGHT - newH, cy - newH / 2));

      setCurrentViewBox([newX, newY, newW, newH]);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // Smooth Camera Flight to clicked Location ("slowly move to that location")
  const triggerCameraFlightToLocation = (
    distId: string,
    targetAreaId?: string,
    autoTransitionToBuildings = true
  ) => {
    const dist = TAMIL_NADU_DISTRICTS.find((d) => d.id === distId);
    if (!dist) return;

    setSelectedDistrict(dist.id);
    const chosenAreaId = targetAreaId || dist.taluks[0]?.projectAreas[0]?.id || 'taramani-omr';
    setSelectedProjectArea(chosenAreaId);

    // District center in SVG pixel coordinates
    const [targetX, targetY] = projectGeoToSvg(dist.center[0], dist.center[1]);

    const startVB = [...currentViewBox] as [number, number, number, number];
    // Zoomed in target viewBox centered on the district in pixel space
    const targetWidth = 260;
    const targetHeight = 280;
    const targetVB: [number, number, number, number] = [
      Math.max(0, Math.min(MAP_CANVAS_WIDTH - targetWidth, targetX - targetWidth / 2)),
      Math.max(0, Math.min(MAP_CANVAS_HEIGHT - targetHeight, targetY - targetHeight / 2)),
      targetWidth,
      targetHeight,
    ];

    setIsCameraMoving(true);
    setCameraTargetName(dist.name);
    setCameraProgress(0);

    const startTime = performance.now();
    const duration = 1200; // 1.2s smooth animated movement

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const stepAnimation = (now: number) => {
      const elapsed = now - startTime;
      const linearP = Math.min(elapsed / duration, 1);
      const easedP = easeInOutCubic(linearP);

      setCameraProgress(Math.round(linearP * 100));

      const interpolatedVB: [number, number, number, number] = [
        startVB[0] + (targetVB[0] - startVB[0]) * easedP,
        startVB[1] + (targetVB[1] - startVB[1]) * easedP,
        startVB[2] + (targetVB[2] - startVB[2]) * easedP,
        startVB[3] + (targetVB[3] - startVB[3]) * easedP,
      ];

      setCurrentViewBox(interpolatedVB);

      if (linearP < 1) {
        animationFrameRef.current = requestAnimationFrame(stepAnimation);
      } else {
        // Animation finished: load area cadastral data and show buildings!
        switchProjectArea(dist.id, chosenAreaId);
        setTimeout(() => {
          setIsCameraMoving(false);
          if (autoTransitionToBuildings) {
            setCurrentStep('area-buildings');
          } else {
            setCurrentStep('choose-area');
          }
        }, 200);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(stepAnimation);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleSelectDistrict = (distId: string) => {
    zoomToDistrict(distId);
  };

  const handleSelectArea = (area: ProjectAreaInfo) => {
    switchProjectArea(currentDistrictObj.id, area.id);
    setCurrentStep('area-buildings');
  };

  const handleResetToStateMap = () => {
    resetZoom();
    setCurrentStep('state-map');
  };

  // Inspect building handler
  const handleInspectBuilding = (bId: string) => {
    setSelectedBuildingId(bId);
    const b = buildings.find((x) => x.buildingId === bId);
    if (b) {
      setSelectedParcelId(b.parcelId);
      const topFloor = b.floors[b.floors.length - 1];
      if (topFloor) {
        setSelectedFloorNumber(topFloor.floorNumber);
      }
    }
  };

  // Allocate single building
  const handleSingleAllocateBuilding = (b: typeof inspectedBuilding) => {
    if (!b) return;
    setAllocationModalTarget({
      type: 'building',
      targetName: `${b.name} (${b.buildingId})`,
      buildings: [b],
    });
  };

  // Batch allocate entire area
  const handleBatchAllocateArea = () => {
    setAllocationModalTarget({
      type: 'area',
      targetName: `${currentAreaObj?.name || 'Urban Sector'} (${buildings.length} Towers)`,
      buildings,
    });
  };

  // Export 3D Cadastral Ledger CSV
  const handleExportAreaLedger = () => {
    ExportService.export3DCadastreCSV(buildings, parcels);
  };

  // Fly to 3D Digital Twin
  const handleFlyToTwin = (bId?: string) => {
    if (bId) {
      setSelectedBuildingId(bId);
    }
    setCurrentView('twin');
    setViewMode('3d');
  };

  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden select-none font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#070d18] text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* ========================================================================= */}
      {/* WORKFLOW STEP NAVIGATOR & BREADCRUMB */}
      {/* ========================================================================= */}
      <div
        className={`w-full border-b px-4 py-2.5 flex items-center justify-between text-xs font-mono transition-colors ${
          isDark ? 'bg-slate-900/95 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Step 1 Pill */}
          <button
            onClick={() => handleResetToStateMap()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all cursor-pointer font-bold border ${
              currentStep === 'state-map'
                ? 'bg-sky-600 text-white shadow-xs border-sky-600'
                : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. Entire Tamil Nadu Map (38 Districts)</span>
          </button>

          <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-600'}`} />

          {/* Step 2 Pill */}
          <button
            onClick={() => {
              if (currentDistrictObj) setCurrentStep('choose-area');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all cursor-pointer font-semibold border ${
              currentStep === 'choose-area'
                ? 'bg-sky-600 text-white font-bold shadow-xs border-sky-600'
                : currentStep === 'area-buildings'
                ? isDark
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800 font-semibold'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold'
                : isDark
                ? 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <BuildingIcon className="w-3.5 h-3.5" />
            <span>2. Choose Particular Area ({currentDistrictObj?.name})</span>
          </button>

          <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-600'}`} />

          {/* Step 3 Pill */}
          <button
            onClick={() => {
              if (currentAreaObj) setCurrentStep('area-buildings');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all cursor-pointer font-semibold border ${
              currentStep === 'area-buildings'
                ? 'bg-sky-600 text-white font-bold shadow-xs border-sky-600'
                : isDark
                ? 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3. Show Buildings & Allocate 3D ULPIN</span>
          </button>
        </div>

        {/* Right Quick Controls */}
        <div className="hidden md:flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Survey of India WGS-84 / EPSG:4326 Datum</span>
          </div>

          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title="Toggle Light/Dark Theme"
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
            }`}
          >
            {isDark ? '☀️ Light UI' : '🌙 Dark UI'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: ENTIRE TAMIL NADU STATE MAP (Cadastral Vector / Satellite / Hybrid) */}
      {/* ========================================================================= */}
      {currentStep === 'state-map' && (
        <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
          {/* Top Filter & Map Layers Toolbar */}
          <div
            className={`w-full px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono shrink-0 transition-colors z-10 ${
              isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
            }`}
          >
            {/* Search and Zone Dropdown */}
            <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md">
              <div className="relative flex-1">
                <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={searchDistrictQuery}
                  onChange={(e) => setSearchDistrictQuery(e.target.value)}
                  placeholder="Search 38 districts (e.g. Chennai, Salem, Madurai)..."
                  className={`w-full pl-8 pr-2.5 py-1.5 rounded-lg border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-2xs font-medium ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-500'
                  }`}
                />
              </div>

              {/* Zone Filter */}
              <select
                value={selectedZone}
                onChange={(e) => {
                  const z = e.target.value as any;
                  setSelectedZone(z);
                  if (z !== 'All') {
                    zoomToZone(z);
                  } else {
                    resetZoom();
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono focus:outline-none cursor-pointer shadow-2xs font-semibold ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="All">All 38 Districts</option>
                <option value="Northern Capital">Northern Capital</option>
                <option value="Western Kongu">Western Kongu</option>
                <option value="Central Cauvery Delta">Cauvery Delta</option>
                <option value="Southern Region">Southern Region</option>
                <option value="North Western">North Western</option>
              </select>
            </div>

            {/* Quick Zone Jump Buttons */}
            <div className="hidden xl:flex items-center gap-1">
              <span className={`text-[10px] mr-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Quick Jump:</span>
              {[
                { label: 'All', key: 'All' },
                { label: 'Chennai', key: 'Northern Capital' },
                { label: 'Kongu', key: 'Western Kongu' },
                { label: 'Delta', key: 'Central Cauvery Delta' },
                { label: 'Madurai/South', key: 'Southern Region' },
                { label: 'Far South', key: 'Far South' },
              ].map((z) => (
                <button
                  key={z.key}
                  onClick={() => zoomToZone(z.key)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                    activeZonePreset === z.key
                      ? 'bg-sky-600 text-white font-bold border-sky-600 shadow-xs'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 font-medium'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>

            {/* Controls Right: View Layout, Map Mode, Text Size */}
            <div className="flex items-center gap-2">
              {/* Layout Switcher: Split (38 list + map) vs Map Only */}
              <div
                className={`flex items-center p-1 rounded-lg border text-xs font-mono shadow-2xs ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                }`}
                title="Toggle 38 Districts Directory Sidebar"
              >
                <button
                  onClick={() => setViewLayout('split')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer ${
                    viewLayout === 'split'
                      ? isDark
                        ? 'bg-slate-900 text-sky-400 font-bold shadow-xs'
                        : 'bg-white text-sky-900 font-bold shadow-xs border border-slate-300'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100'
                      : 'text-slate-700 hover:text-slate-950 font-semibold'
                  }`}
                >
                  <LayoutGrid className="w-3 h-3" />
                  <span>Split (List + Map)</span>
                </button>
                <button
                  onClick={() => setViewLayout('map-only')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer ${
                    viewLayout === 'map-only'
                      ? isDark
                        ? 'bg-slate-900 text-sky-400 font-bold shadow-xs'
                        : 'bg-white text-sky-900 font-bold shadow-xs border border-slate-300'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100'
                      : 'text-slate-700 hover:text-slate-950 font-semibold'
                  }`}
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Full Map</span>
                </button>
              </div>

              {/* Map Layers: Cadastral vs Satellite vs Hybrid */}
              <div
                className={`flex items-center p-1 rounded-lg border text-xs font-mono shadow-2xs ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <button
                  onClick={() => setMapLayerMode('cadastral')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer ${
                    mapLayerMode === 'cadastral'
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100'
                      : 'text-slate-700 hover:text-slate-950 font-semibold'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Cadastre</span>
                </button>

                <button
                  onClick={() => setMapLayerMode('satellite')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer ${
                    mapLayerMode === 'satellite'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100'
                      : 'text-slate-700 hover:text-slate-950 font-semibold'
                  }`}
                >
                  <Satellite className="w-3 h-3" />
                  <span>🛰️ Satellite</span>
                </button>

                <button
                  onClick={() => setMapLayerMode('hybrid')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer ${
                    mapLayerMode === 'hybrid'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100'
                      : 'text-slate-700 hover:text-slate-950 font-semibold'
                  }`}
                >
                  <Globe2 className="w-3 h-3" />
                  <span>Hybrid</span>
                </button>
              </div>

              {/* City Label Size Switcher: Standard vs Large vs XL */}
              <div
                className={`flex items-center p-1 rounded-lg border text-xs font-mono shadow-2xs ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                }`}
                title="Increase City Name Size"
              >
                <span className={`text-[10px] px-1 flex items-center gap-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                  <Type className="w-3 h-3" />
                  <span>Font:</span>
                </span>
                <button
                  onClick={() => setLabelSize('standard')}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                    labelSize === 'standard'
                      ? isDark
                        ? 'bg-slate-900 text-sky-400 font-bold shadow-xs'
                        : 'bg-white text-sky-900 font-bold shadow-xs border border-slate-300'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100'
                      : 'text-slate-700 hover:text-slate-950 font-medium'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setLabelSize('large')}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                    labelSize === 'large'
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100'
                      : 'text-slate-700 hover:text-slate-950 font-medium'
                  }`}
                >
                  Large
                </button>
                <button
                  onClick={() => setLabelSize('xlarge')}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                    labelSize === 'xlarge'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100'
                      : 'text-slate-700 hover:text-slate-950 font-medium'
                  }`}
                >
                  XL (22px)
                </button>
              </div>
            </div>
          </div>

          {/* Main Interactive Stage: Split View (List + SVG Map) */}
          <div className="flex-1 w-full h-full flex overflow-hidden relative">
            {/* Desktop Left Sidebar: All 38 Districts Directory */}
            {viewLayout === 'split' && (
              <div
                className={`hidden md:flex md:w-80 lg:w-88 h-full border-r flex-col shrink-0 z-10 transition-all duration-200 ${
                  isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                {/* Directory Header */}
                <div
                  className={`p-3 border-b flex items-center justify-between ${
                    isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>All 38 Districts</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}>
                        38/38
                      </span>
                    </div>
                    <p className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                      Click any district to center and zoom in
                    </p>
                  </div>

                  <button
                    onClick={() => setViewLayout('map-only')}
                    title="Hide Directory for Full Map"
                    className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                      isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
                    }`}
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* District List Scrollable Area */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800/60">
                  {filteredDistricts.map((dist, idx) => {
                    const isSelected = dist.id === selectedDistrict;
                    return (
                      <div
                        key={dist.id}
                        onClick={() => zoomToDistrict(dist.id)}
                        className={`p-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          isSelected
                            ? isDark
                              ? 'bg-sky-950/60 border-l-4 border-sky-500'
                              : 'bg-sky-100/90 border-l-4 border-sky-600'
                            : isDark
                            ? 'hover:bg-slate-800/50'
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-5 text-[10px] font-mono font-bold text-right shrink-0 ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-xs truncate font-bold ${
                                  isSelected
                                    ? isDark
                                      ? 'text-sky-400'
                                      : 'text-sky-900'
                                    : isDark
                                    ? 'text-slate-100'
                                    : 'text-slate-950'
                                }`}
                              >
                                {dist.name}
                              </span>
                              <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold shrink-0 border ${
                                isDark
                                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                                  : 'bg-slate-200 text-slate-800 border-slate-300'
                              }`}>
                                {dist.code}
                              </span>
                            </div>
                            <div className={`text-[10px] font-mono truncate mt-0.5 font-medium ${
                              isDark ? 'text-slate-400' : 'text-slate-700'
                            }`}>
                              {dist.zone} • {dist.totalBuildings.toLocaleString()} bldgs
                            </div>
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              zoomToDistrict(dist.id);
                            }}
                            className={`p-1 rounded cursor-pointer ${
                              isDark
                                ? 'text-slate-400 hover:text-sky-400 hover:bg-sky-950/60'
                                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100'
                            }`}
                            title="Focus & Center on Map"
                          >
                            <Crosshair className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerCameraFlightToLocation(dist.id, undefined, true);
                            }}
                            className={`p-1 rounded cursor-pointer ${
                              isDark
                                ? 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/60'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title="Open 3D Building Cadastre"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Overlay Drawer: 38 Districts Directory */}
            {showMobileDistrictList && (
              <div className="md:hidden fixed inset-0 z-50 flex">
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                  onClick={() => setShowMobileDistrictList(false)}
                />
                <div
                  className={`relative w-[85%] max-w-sm h-full flex flex-col z-10 shadow-2xl transition-transform ${
                    isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
                  }`}
                >
                  <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>All 38 Districts</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}>
                          38/38
                        </span>
                      </div>
                      <p className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                        Tap district to center map
                      </p>
                    </div>
                    <button
                      onClick={() => setShowMobileDistrictList(false)}
                      className={`p-1.5 rounded-lg cursor-pointer ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800/60">
                    {filteredDistricts.map((dist, idx) => {
                      const isSelected = dist.id === selectedDistrict;
                      return (
                        <div
                          key={dist.id}
                          onClick={() => {
                            zoomToDistrict(dist.id);
                            setShowMobileDistrictList(false);
                          }}
                          className={`p-3 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isSelected
                              ? isDark
                                ? 'bg-sky-950/60 border-l-4 border-sky-500'
                                : 'bg-sky-100/90 border-l-4 border-sky-600'
                              : isDark
                              ? 'hover:bg-slate-800/50'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-5 text-[10px] font-mono font-bold text-right shrink-0 ${
                              isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-xs truncate font-bold ${
                                    isSelected
                                      ? isDark
                                        ? 'text-sky-400'
                                        : 'text-sky-900'
                                      : isDark
                                      ? 'text-slate-100'
                                      : 'text-slate-950'
                                  }`}
                                >
                                  {dist.name}
                                </span>
                                <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold shrink-0 border ${
                                  isDark
                                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                                    : 'bg-slate-200 text-slate-800 border-slate-300'
                                }`}>
                                  {dist.code}
                                </span>
                              </div>
                              <div className={`text-[10px] font-mono truncate mt-0.5 font-medium ${
                                isDark ? 'text-slate-400' : 'text-slate-700'
                              }`}>
                                {dist.zone} • {dist.totalBuildings.toLocaleString()} bldgs
                              </div>
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-sky-600 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Right Stage: Interactive SVG Map Container */}
            <div className="flex-1 h-full relative overflow-hidden flex flex-col">
              {/* Mobile District Drawer Opener Button */}
              <button
                onClick={() => setShowMobileDistrictList(true)}
                className="md:hidden absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 text-white font-mono text-xs font-bold shadow-xl active:scale-95 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>38 Districts</span>
                <span className="px-1.5 py-0.2 rounded-full bg-sky-800 text-[10px]">
                  {filteredDistricts.length}
                </span>
              </button>

              {/* Top State Header Status */}
              <div
                className={`w-full flex items-center justify-between px-3 py-1.5 border-b text-xs font-mono z-10 transition-colors ${
                  isDark ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-700 backdrop-blur'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-bold truncate text-[11px] sm:text-xs">
                    Tamil Nadu Cadastral Mesh (38 Districts)
                  </span>
                  {mapLayerMode !== 'cadastral' && (
                    <span className="hidden sm:flex px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold items-center gap-1">
                      <Satellite className="w-3 h-3 text-emerald-700" />
                      <span>ESRI Active</span>
                    </span>
                  )}
                </div>

                <div className={`flex items-center gap-3 text-[11px] shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                  <span className="hidden sm:inline">Pinch / drag to zoom</span>
                  <span className="font-mono text-sky-700 dark:text-sky-400 font-bold">
                    {filteredDistricts.length}/38
                  </span>
                </div>
              </div>

              {/* Map Canvas with SVG ViewBox */}
              <div
                className={`flex-1 w-full h-full relative overflow-hidden flex items-center justify-center transition-colors select-none ${
                  mapLayerMode === 'satellite'
                    ? 'bg-[#030914]'
                    : isDark
                    ? 'bg-slate-950'
                    : 'bg-gradient-to-b from-sky-50/40 via-slate-100 to-indigo-50/30'
                }`}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <svg
                  viewBox={`${currentViewBox[0]} ${currentViewBox[1]} ${currentViewBox[2]} ${currentViewBox[3]}`}
                  className={`w-full h-full select-none touch-none ${
                    isCameraMoving ? 'pointer-events-none' : ''
                  }`}
                  style={{ shapeRendering: 'geometricPrecision' }}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                >
                <defs>
                  {/* Precise Tamil Nadu State Boundary Clip Path */}
                  <clipPath id="tamil-nadu-boundary-clip">
                    <path d={boundarySvgPath} />
                  </clipPath>

                  {/* Satellite Ocean Water Gradient */}
                  <linearGradient id="ocean-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0b2447" />
                    <stop offset="50%" stopColor="#061830" />
                    <stop offset="100%" stopColor="#020d1c" />
                  </linearGradient>

                  {/* Cadastral Land Gradient */}
                  <linearGradient id="cadastral-land-gradient-light" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#f1f5f9" />
                  </linearGradient>

                  <linearGradient id="cadastral-land-gradient-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="50%" stopColor="#0b1324" />
                    <stop offset="100%" stopColor="#070c18" />
                  </linearGradient>

                  {/* Terrain Elevation Shading for Western Ghats & Eastern Hills */}
                  <radialGradient id="western-ghats-relief" cx="18%" cy="50%" r="45%">
                    <stop offset="0%" stopColor="#15803d" stopOpacity={isDark ? 0.35 : 0.22} />
                    <stop offset="60%" stopColor="#166534" stopOpacity={isDark ? 0.15 : 0.08} />
                    <stop offset="100%" stopColor="transparent" stopOpacity={0} />
                  </radialGradient>

                  {/* Cauvery River Delta Vegetation Gradient */}
                  <radialGradient id="cauvery-delta-relief" cx="72%" cy="52%" r="28%">
                    <stop offset="0%" stopColor="#059669" stopOpacity={isDark ? 0.3 : 0.18} />
                    <stop offset="100%" stopColor="transparent" stopOpacity={0} />
                  </radialGradient>
                </defs>

                {/* ========================================================================= */}
                {/* 1. BACKGROUND WATER / BAY OF BENGAL & INDIAN OCEAN */}
                {/* ========================================================================= */}
                {mapLayerMode !== 'cadastral' ? (
                  <rect
                    x="0"
                    y="0"
                    width={MAP_CANVAS_WIDTH}
                    height={MAP_CANVAS_HEIGHT}
                    fill="url(#ocean-gradient)"
                  />
                ) : (
                  <rect
                    x="0"
                    y="0"
                    width={MAP_CANVAS_WIDTH}
                    height={MAP_CANVAS_HEIGHT}
                    fill={isDark ? '#080e1a' : '#f0f9ff'}
                  />
                )}

                {/* Ocean Waves / Bathymetric Contours along Coromandel Coast */}
                <path
                  d={coastlineSvgPath}
                  fill="none"
                  stroke={mapLayerMode !== 'cadastral' ? '#0284c7' : '#38bdf8'}
                  strokeWidth="16"
                  strokeOpacity="0.15"
                />
                <path
                  d={coastlineSvgPath}
                  fill="none"
                  stroke={mapLayerMode !== 'cadastral' ? '#38bdf8' : '#0284c7'}
                  strokeWidth="32"
                  strokeOpacity="0.08"
                />

                {/* Ocean Geographic Labels */}
                <text
                  x="820"
                  y="520"
                  fill={mapLayerMode !== 'cadastral' ? '#38bdf8' : '#0369a1'}
                  opacity={mapLayerMode !== 'cadastral' ? 0.45 : 0.35}
                  fontSize="20"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  letterSpacing="4"
                  pointerEvents="none"
                >
                  BAY OF BENGAL
                </text>

                <text
                  x="720"
                  y="920"
                  fill={mapLayerMode !== 'cadastral' ? '#38bdf8' : '#0369a1'}
                  opacity={mapLayerMode !== 'cadastral' ? 0.45 : 0.35}
                  fontSize="16"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  letterSpacing="3"
                  pointerEvents="none"
                >
                  GULF OF MANNAR
                </text>

                <text
                  x="300"
                  y="1040"
                  fill={mapLayerMode !== 'cadastral' ? '#38bdf8' : '#0369a1'}
                  opacity={mapLayerMode !== 'cadastral' ? 0.45 : 0.35}
                  fontSize="15"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  letterSpacing="3"
                  pointerEvents="none"
                >
                  INDIAN OCEAN
                </text>

                {/* ========================================================================= */}
                {/* 2. SATELLITE TILES LAYER (ESRI WORLD IMAGERY) */}
                {/* ========================================================================= */}
                {(mapLayerMode === 'satellite' || mapLayerMode === 'hybrid') && (
                  <g clipPath="url(#tamil-nadu-boundary-clip)">
                    {/* Realistic Earth Satellite Terrain Backdrop */}
                    <rect
                      x="0"
                      y="0"
                      width={MAP_CANVAS_WIDTH}
                      height={MAP_CANVAS_HEIGHT}
                      fill="#1e3a1f"
                    />

                    {/* ESRI World Imagery Slippy Tiles */}
                    {satelliteTiles.map((tile) => (
                      <image
                        key={tile.key}
                        href={tile.url}
                        x={tile.x}
                        y={tile.y}
                        width={tile.width}
                        height={tile.height}
                        preserveAspectRatio="none"
                        opacity={mapLayerMode === 'hybrid' ? 0.85 : 1.0}
                      />
                    ))}

                    {/* Satellite Topography Shading for Nilgiris & Western Ghats */}
                    <rect
                      x="0"
                      y="0"
                      width={MAP_CANVAS_WIDTH}
                      height={MAP_CANVAS_HEIGHT}
                      fill="url(#western-ghats-relief)"
                      pointerEvents="none"
                    />

                    {/* Satellite Cauvery Delta Fertile Green Veil */}
                    <rect
                      x="0"
                      y="0"
                      width={MAP_CANVAS_WIDTH}
                      height={MAP_CANVAS_HEIGHT}
                      fill="url(#cauvery-delta-relief)"
                      pointerEvents="none"
                    />
                  </g>
                )}

                {/* ========================================================================= */}
                {/* 3. CADASTRAL VECTOR LAND MASS */}
                {/* ========================================================================= */}
                {mapLayerMode === 'cadastral' && (
                  <g>
                    {/* Land Area Fill */}
                    <path
                      d={boundarySvgPath}
                      fill={isDark ? 'url(#cadastral-land-gradient-dark)' : 'url(#cadastral-land-gradient-light)'}
                      stroke={isDark ? '#334155' : '#cbd5e1'}
                      strokeWidth="2"
                      className="transition-colors"
                    />

                    {/* Western Ghats Relief */}
                    <path
                      d={boundarySvgPath}
                      fill="url(#western-ghats-relief)"
                      pointerEvents="none"
                    />

                    {/* Cauvery Delta Relief */}
                    <path
                      d={boundarySvgPath}
                      fill="url(#cauvery-delta-relief)"
                      pointerEvents="none"
                    />
                  </g>
                )}

                {/* ========================================================================= */}
                {/* 4. STATE BOUNDARY OUTLINE & COASTLINE ACCENTS */}
                {/* ========================================================================= */}
                {/* Glowing Outer Boundary Line */}
                <path
                  d={boundarySvgPath}
                  fill="none"
                  stroke={mapLayerMode === 'satellite' ? '#38bdf8' : isDark ? '#38bdf8' : '#0284c7'}
                  strokeWidth={mapLayerMode === 'satellite' ? '2.5' : '3'}
                  strokeOpacity={mapLayerMode === 'satellite' ? 0.8 : 0.9}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  pointerEvents="none"
                />

                {/* Coromandel Coast Dash Accent */}
                <path
                  d={coastlineSvgPath}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="4"
                  strokeDasharray="12 6"
                  opacity="0.8"
                  pointerEvents="none"
                />

                {/* Major Highway Corridors across Tamil Nadu */}
                <g opacity={mapLayerMode === 'satellite' ? 0.35 : 0.45} pointerEvents="none">
                  {/* Chennai - Bengaluru Highway Corridor (NH 48) */}
                  <path
                    d={`M ${projectGeoToSvg(80.24, 12.98).join(' ')} L ${projectGeoToSvg(79.7, 12.83).join(' ')} L ${projectGeoToSvg(78.8, 12.91).join(' ')} L ${projectGeoToSvg(78.22, 12.52).join(' ')} L ${projectGeoToSvg(77.82, 12.74).join(' ')}`}
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    fill="none"
                  />

                  {/* North-South Grand Trunk Corridor (NH 44: Hosur -> Salem -> Madurai -> Tirunelveli -> Kanyakumari) */}
                  <path
                    d={`M ${projectGeoToSvg(77.82, 12.74).join(' ')} L ${projectGeoToSvg(78.16, 12.13).join(' ')} L ${projectGeoToSvg(78.15, 11.66).join(' ')} L ${projectGeoToSvg(78.17, 11.22).join(' ')} L ${projectGeoToSvg(78.08, 10.96).join(' ')} L ${projectGeoToSvg(77.98, 10.36).join(' ')} L ${projectGeoToSvg(78.12, 9.92).join(' ')} L ${projectGeoToSvg(77.96, 9.58).join(' ')} L ${projectGeoToSvg(77.76, 8.71).join(' ')} L ${projectGeoToSvg(77.54, 8.08).join(' ')}`}
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeDasharray="8 5"
                    fill="none"
                  />

                  {/* Cauvery River Axis (Hogenakkal -> Mettur -> Erode -> Trichy -> Thanjavur -> Poompuhar) */}
                  <path
                    d={`M ${projectGeoToSvg(77.65, 12.02).join(' ')} Q ${projectGeoToSvg(77.72, 11.34).join(' ')} ${projectGeoToSvg(78.7, 10.79).join(' ')} T ${projectGeoToSvg(79.14, 10.78).join(' ')} T ${projectGeoToSvg(79.85, 11.15).join(' ')}`}
                    stroke="#0284c7"
                    strokeWidth="3"
                    strokeOpacity="0.7"
                    fill="none"
                  />
                </g>

                {/* ========================================================================= */}
                {/* 5. DISTRICT NODES & NON-OVERLAPPING DIRECTIONAL LABELS */}
                {/* ========================================================================= */}
                {filteredDistricts.map((dist) => {
                  const [x, y] = projectGeoToSvg(dist.center[0], dist.center[1]);
                  const isSelected = dist.id === selectedDistrict;
                  const isHovered = dist.id === hoveredDistrictId;

                  // Custom directional placement config for each district
                  const cfg = DISTRICT_LABEL_CONFIG[dist.id] || { dx: 0, dy: -14, textAnchor: 'middle' };
                  const labelX = x + cfg.dx;
                  const labelY = y + cfg.dy;

                  // Font size scaling based on user preference
                  const baseFontSize =
                    labelSize === 'xlarge'
                      ? dist.isMajorHub
                        ? 22
                        : 18
                      : labelSize === 'large'
                      ? dist.isMajorHub
                        ? 18
                        : 15
                      : dist.isMajorHub
                      ? 15
                      : 12.5;

                  const hitRadius = dist.isMajorHub ? 26 : 20;

                  return (
                    <g key={dist.id}>
                      {/* Invisible fixed hit target (prevents cursor oscillation completely) */}
                      <circle
                        cx={x}
                        cy={y}
                        r={hitRadius}
                        fill="transparent"
                        className="cursor-pointer"
                        pointerEvents="all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDistrict(dist.id);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          triggerCameraFlightToLocation(dist.id, undefined, true);
                        }}
                        onMouseEnter={() => setHoveredDistrictId(dist.id)}
                        onMouseLeave={() => setHoveredDistrictId(null)}
                      />

                      {/* Subtle leader line if offset is significant */}
                      {(Math.abs(cfg.dx) > 10 || Math.abs(cfg.dy) > 12) && (
                        <line
                          x1={x}
                          y1={y}
                          x2={labelX}
                          y2={labelY}
                          stroke={isSelected ? '#0284c7' : isDark ? '#475569' : '#94a3b8'}
                          strokeWidth="1"
                          strokeDasharray="2 2"
                          strokeOpacity={isSelected ? 0.8 : 0.45}
                          pointerEvents="none"
                        />
                      )}

                      {/* Selection Pulsing Radar Waves */}
                      {isSelected && (
                        <>
                          <circle
                            cx={x}
                            cy={y}
                            r={dist.isMajorHub ? 32 : 25}
                            fill="#0284c7"
                            fillOpacity="0.18"
                            stroke="#0284c7"
                            strokeWidth="2"
                            pointerEvents="none"
                            className="animate-pulse"
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r={dist.isMajorHub ? 20 : 15}
                            fill="#38bdf8"
                            fillOpacity="0.25"
                            pointerEvents="none"
                          />
                        </>
                      )}

                      {/* Visual District Marker Dot */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 10 : isHovered ? 9 : dist.isMajorHub ? 7.5 : 5.5}
                        fill={
                          isSelected
                            ? '#0284c7'
                            : isHovered
                            ? '#38bdf8'
                            : dist.isMajorHub
                            ? '#0369a1'
                            : isDark
                            ? '#94a3b8'
                            : '#0284c7'
                        }
                        stroke="#ffffff"
                        strokeWidth={isSelected || isHovered ? 2.5 : 2}
                        pointerEvents="none"
                      />

                      {dist.isMajorHub && (
                        <circle cx={x} cy={y} r={2.5} fill="#ffffff" pointerEvents="none" />
                      )}

                      {/* High-Contrast City Name Text with Halo Backing */}
                      <text
                        x={labelX}
                        y={labelY}
                        fill={
                          isSelected
                            ? '#0284c7'
                            : isHovered
                            ? '#0369a1'
                            : mapLayerMode === 'satellite'
                            ? '#ffffff'
                            : isDark
                            ? '#f8fafc'
                            : '#0f172a'
                        }
                        fontSize={baseFontSize}
                        fontWeight={dist.isMajorHub || isSelected ? '800' : '700'}
                        fontFamily="sans-serif"
                        textAnchor={cfg.textAnchor}
                        pointerEvents="none"
                        style={{
                          paintOrder: 'stroke fill',
                          stroke:
                            mapLayerMode === 'satellite'
                              ? 'rgba(3, 9, 20, 0.95)'
                              : isDark
                              ? '#070d18'
                              : '#ffffff',
                          strokeWidth:
                            mapLayerMode === 'satellite'
                              ? 4.5
                              : dist.isMajorHub
                              ? 4.0
                              : 3.2,
                          strokeLinejoin: 'round',
                        }}
                      >
                        {dist.name}
                      </text>

                      {/* Subtitle with buildings count (shown when zoomed in or on hover/selected) */}
                      {(currentZoomPercent > 140 || isHovered || isSelected) && (
                        <text
                          x={labelX}
                          y={labelY + (cfg.dy > 0 ? 14 : -13)}
                          fill={
                            mapLayerMode !== 'cadastral'
                              ? '#a5f3fc'
                              : isDark
                              ? '#94a3b8'
                              : '#475569'
                          }
                          fontSize={10.5}
                          fontFamily="monospace"
                          fontWeight="600"
                          textAnchor={cfg.textAnchor}
                          pointerEvents="none"
                          style={{
                            paintOrder: 'stroke fill',
                            stroke: isDark || mapLayerMode !== 'cadastral' ? '#070d18' : '#ffffff',
                            strokeWidth: 2.8,
                            strokeLinejoin: 'round',
                          }}
                        >
                          {dist.totalBuildings.toLocaleString()} bldgs
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Floating On-Map Zoom Controls (Top-Right) */}
              <div className={`absolute top-4 right-4 z-20 flex flex-col items-center gap-1 backdrop-blur-md p-1.5 rounded-xl border shadow-xl ${
                isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-300 shadow-lg'
              }`}>
                {/* Zoom In */}
                <button
                  onClick={zoomIn}
                  title="Zoom In (+)"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer font-bold ${
                    isDark
                      ? 'text-slate-200 hover:bg-sky-950/60 hover:text-sky-400'
                      : 'text-slate-800 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Current Zoom Scale % */}
                <div
                  className={`text-[10px] font-mono font-bold py-0.5 px-1 select-none ${
                    isDark ? 'text-slate-300' : 'text-slate-800'
                  }`}
                  title="Current Zoom Level"
                >
                  {currentZoomPercent}%
                </div>

                {/* Zoom Out */}
                <button
                  onClick={zoomOut}
                  title="Zoom Out (-)"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer font-bold ${
                    isDark
                      ? 'text-slate-200 hover:bg-sky-950/60 hover:text-sky-400'
                      : 'text-slate-800 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className={`w-5 h-[1px] my-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

                {/* Reset to Entire State */}
                <button
                  onClick={resetZoom}
                  title="Reset to Full State View (100%)"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Floating District Action Card (Bottom Center) */}
              {currentDistrictObj && (
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-xl w-[94%] sm:w-auto backdrop-blur-md p-3.5 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 border ${
                  isDark
                    ? 'bg-slate-900/95 border-sky-800 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-900 shadow-xl'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-xs shrink-0 border ${
                      isDark
                        ? 'bg-sky-950/60 border-sky-800 text-sky-400'
                        : 'bg-sky-100 border-sky-300 text-sky-800 font-extrabold'
                    }`}>
                      {currentDistrictObj.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-950'}`}>
                          {currentDistrictObj.name} District
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                          isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                          {currentDistrictObj.zone}
                        </span>
                      </div>
                      <div className={`text-[11px] font-mono mt-0.5 flex items-center gap-2 font-medium ${
                        isDark ? 'text-slate-400' : 'text-slate-700'
                      }`}>
                        <span className="font-semibold">{currentDistrictObj.totalBuildings.toLocaleString()} Buildings</span>
                        <span>•</span>
                        <span className="font-semibold">{currentDistrictObj.ulpinCoveragePercent}% 3D ULPIN</span>
                        <span>•</span>
                        <span>HQ: {currentDistrictObj.headquarters}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => zoomToDistrict(currentDistrictObj.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 cursor-pointer font-semibold ${
                        isDark
                          ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                          : 'border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
                      }`}
                      title="Focus closer on this district"
                    >
                      <Crosshair className="w-3.5 h-3.5 text-sky-600" />
                      <span>Focus</span>
                    </button>

                    <button
                      onClick={() => setCurrentStep('choose-area')}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 cursor-pointer font-semibold ${
                        isDark
                          ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                          : 'border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
                      }`}
                      title="Choose a specific taluk or urban sector"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>Areas</span>
                    </button>

                    <button
                      onClick={() => {
                        triggerCameraFlightToLocation(currentDistrictObj.id, undefined, true);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <span>Open 3D Cadastre</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cinematic Camera Flight HUD ("Slowly moving to that location...") */}
            {isCameraMoving && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200 pointer-events-none">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center gap-3 text-slate-800 dark:text-slate-100 font-mono text-xs max-w-sm w-full mx-4">
                  <div className="relative flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
                    <Navigation className="w-5 h-5 text-sky-600 absolute" />
                  </div>

                  <div className="text-center">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      Flying to {cameraTargetName}...
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Resolving urban cadastre & building parcels...
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-100"
                      style={{ width: `${cameraProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between w-full text-[10px] text-slate-400">
                    <span>Altitude: {(12000 - cameraProgress * 115).toLocaleString()}m MSL</span>
                    <span className="font-bold text-sky-600">{cameraProgress}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: CHOOSE THE PARTICULAR AREA ("Has Lot of Buildings") */}
      {/* ========================================================================= */}
      {currentStep === 'choose-area' && (
        <div className="flex-1 w-full h-full flex flex-col p-4 sm:p-6 overflow-y-auto max-w-6xl mx-auto">
          {/* Header & Back Button */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={handleResetToStateMap}
                className={`flex items-center gap-1 text-xs font-mono transition-colors cursor-pointer mb-1 ${
                  isDark ? 'text-slate-400 hover:text-sky-400' : 'text-slate-700 hover:text-sky-800 font-semibold'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Entire Tamil Nadu Map</span>
              </button>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className={isDark ? 'text-white' : 'text-slate-950'}>Choose Particular Area in {currentDistrictObj.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-900 font-bold border border-sky-300">
                  {currentDistrictObj.code}
                </span>
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                Select a high-density urban sector with a large cluster of multi-story buildings to allocate 3D ULPINs.
              </p>
            </div>
          </div>

          {/* Area Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentDistrictObj.taluks.flatMap((taluk) =>
              taluk.projectAreas.map((area) => {
                const isCurrent = area.id === selectedProjectArea;

                return (
                  <div
                    key={area.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isCurrent
                        ? isDark
                          ? 'bg-gradient-to-b from-sky-950/50 to-slate-900 border-sky-500 shadow-xl ring-1 ring-sky-500/40'
                          : 'bg-sky-50/90 border-sky-500 shadow-sm ring-1 ring-sky-400'
                        : isDark
                        ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Density Highlight Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-950 border border-amber-400 font-bold flex items-center gap-1">
                          <BuildingIcon className="w-3 h-3 text-amber-800" />
                          <span>HAS LOT OF BUILDINGS ({area.buildingsCount} TOWERS)</span>
                        </span>
                        {area.metroConnected && (
                          <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 font-bold flex items-center gap-1">
                            ● Transit Corridor
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-950 dark:text-white">{area.name}</h3>
                      <div className="text-[11px] font-mono text-sky-800 dark:text-sky-400 font-bold mt-0.5">{area.type}</div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-normal mt-2 line-clamp-2 leading-relaxed">
                        {area.description}
                      </p>

                      {/* Area Metrics */}
                      <div
                        className={`mt-4 grid grid-cols-3 gap-2 p-2.5 rounded-lg border font-mono text-[11px] ${
                          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300'
                        }`}
                      >
                        <div>
                          <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Buildings</div>
                          <div className="font-bold text-sm text-slate-950 dark:text-slate-100 mt-0.5">
                            {area.buildingsCount}
                          </div>
                        </div>
                        <div>
                          <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Parcels</div>
                          <div className="font-bold text-sm text-slate-950 dark:text-slate-100 mt-0.5">
                            {area.parcelsCount}
                          </div>
                        </div>
                        <div>
                          <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Vertical Units</div>
                          <div className="font-bold text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
                            ~{area.estimatedUnitsCount}
                          </div>
                        </div>
                      </div>

                      {area.transitType && (
                        <div className={`mt-2 text-[10px] font-mono flex items-center gap-1.5 ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          <span>Transit Axis:</span>
                          <span className="text-slate-900 dark:text-slate-200 font-bold">{area.transitType}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectArea(area)}
                      className="w-full mt-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-mono font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Show Buildings in {area.name.split(' ')[0]} →</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: AREA BUILDINGS VIEW & ALLOCATE 3D ULPIN STUDIO */}
      {/* ========================================================================= */}
      {currentStep === 'area-buildings' && (
        <div className="flex-1 w-full h-full flex flex-col md:flex-row overflow-hidden">
          {/* Mobile Segmented Switcher (< md:) */}
          <div className="md:hidden flex items-center p-2 border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-2 shrink-0">
            <button
              onClick={() => setMobileStep3Tab('buildings')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold text-center transition-all ${
                mobileStep3Tab === 'buildings'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Towers List ({filteredBuildings.length})
            </button>
            <button
              onClick={() => setMobileStep3Tab('cadastre')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold text-center transition-all ${
                mobileStep3Tab === 'cadastre'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Cadastral Map & Parcel
            </button>
          </div>

          {/* Left Column: Buildings List & Area Action Toolbar */}
          <div
            className={`w-full md:w-96 border-r flex-col p-4 gap-3 overflow-y-auto z-10 transition-colors ${
              mobileStep3Tab === 'buildings' ? 'flex flex-1 md:flex-initial' : 'hidden md:flex'
            } ${
              isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            {/* Area Header & Stats */}
            <div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep('state-map')}
                  className={`flex items-center gap-1 text-[11px] font-mono transition-colors cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-sky-400' : 'text-slate-700 hover:text-sky-800 font-semibold'
                  }`}
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>State Map</span>
                </button>
                <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>
                  {currentDistrictObj.name}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-950 dark:text-white mt-1">{currentAreaObj?.name}</h2>
              <div className="text-[11px] font-mono text-sky-800 dark:text-sky-400 font-bold">{currentAreaObj?.type}</div>
            </div>

            {/* Prominent Action: Batch Allocate 3D ULPIN Button */}
            <div
              className={`p-3 rounded-xl border shadow-xs space-y-2.5 ${
                isDark
                  ? 'bg-slate-950 border-sky-500/40'
                  : 'bg-gradient-to-br from-sky-50 to-indigo-50/60 border-sky-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-600" />
                  <span>3D ULPIN Allocation Engine</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-400 font-bold">
                  {allocatedBuildingsCount}/{buildings.length} Allocated
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((allocatedBuildingsCount / Math.max(1, buildings.length)) * 100)}%` }}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBatchAllocateArea}
                  className="flex-1 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded text-xs font-mono font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Allocate 3D ULPIN for All Buildings</span>
                </button>
                <button
                  onClick={handleExportAreaLedger}
                  title="Export 3D Cadastral Ledger CSV"
                  className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs transition-colors cursor-pointer border border-slate-300 dark:border-slate-700 shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                </button>
              </div>
            </div>

            {/* Filter Chips & Search for Buildings */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchBuildingQuery}
                  onChange={(e) => setSearchBuildingQuery(e.target.value)}
                  placeholder="Search towers (e.g. Apex, B-001)..."
                  className={`w-full pl-7 pr-3 py-1 border rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono font-medium ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-500'
                  }`}
                />
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono overflow-x-auto pb-1">
                {(['all', 'allocated', 'pending', 'basement'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setBuildingFilter(filterType)}
                    className={`px-2 py-0.5 rounded capitalize whitespace-nowrap transition-colors cursor-pointer border ${
                      buildingFilter === filterType
                        ? 'bg-sky-600 text-white font-bold border-sky-600 shadow-xs'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-slate-100'
                        : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 font-medium'
                    }`}
                  >
                    {filterType === 'all'
                      ? `All (${buildings.length})`
                      : filterType === 'allocated'
                      ? `Allocated (${allocatedBuildingsCount})`
                      : filterType === 'pending'
                      ? `Pending (${buildings.length - allocatedBuildingsCount})`
                      : 'Basements'}
                  </button>
                ))}
              </div>
            </div>

            {/* Buildings Master List */}
            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 font-mono text-[11px]">
              {filteredBuildings.map((b) => {
                const isSelected = b.buildingId === selectedBuildingId;
                const unitsCount = b.floors.reduce((sum, f) => sum + f.units.length, 0);

                return (
                  <div
                    key={b.buildingId}
                    onClick={() => handleInspectBuilding(b.buildingId)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-sky-950/50 border-sky-500 text-slate-100 shadow'
                          : 'bg-sky-50 border-sky-500 text-slate-950 shadow-xs'
                        : isDark
                        ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                        : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5 text-slate-950 dark:text-slate-100">
                          <span>{b.name}</span>
                          <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>({b.buildingId})</span>
                        </div>
                        <div className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                          Base: {b.baseLandId} • S.No: {inspectedParcel?.surveyNumber || '104'}
                        </div>
                      </div>

                      {/* Status indicator */}
                      {b.isUlpinAllocated ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-400 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 text-emerald-700" />
                          <span>ALLOCATED</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-950 border border-amber-400 flex items-center gap-1">
                          <span>PENDING</span>
                        </span>
                      )}
                    </div>

                    <div className={`mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t font-medium ${
                      isDark ? 'text-slate-400 border-slate-800' : 'text-slate-700 border-slate-200'
                    }`}>
                      <span>
                        G+{b.floorsCount} Floors • {b.basementCount} Basements
                      </span>
                      <span className="text-sky-700 dark:text-sky-400 font-bold">{unitsCount} Units</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Cadastral Map View + Right Building Inspector Panel */}
          <div
            className={`flex-1 relative flex-col lg:flex-row overflow-hidden ${
              mobileStep3Tab === 'cadastre' ? 'flex' : 'hidden md:flex'
            } ${
              isDark ? 'bg-[#070c14]' : 'bg-slate-100/80'
            }`}
          >
            {/* 2D Vector Cadastral Canvas */}
            <div className="flex-1 relative flex flex-col p-4 overflow-hidden">
              <div
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-t-lg text-xs font-mono transition-colors ${
                  isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{currentAreaObj?.name}</span>
                  <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    ({buildings.length} Buildings Footprints Grid)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Satellite Underlay toggle for area buildings */}
                  <button
                    onClick={() => setStep3SatelliteUnderlay(!step3SatelliteUnderlay)}
                    className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer border ${
                      step3SatelliteUnderlay
                        ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-slate-100 text-slate-800 border-slate-300 font-semibold'
                    }`}
                  >
                    <Satellite className="w-3 h-3" />
                    <span>Satellite Aerial</span>
                  </button>

                  <button
                    onClick={() => handleFlyToTwin(inspectedBuilding?.buildingId)}
                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-mono text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Fly to 3D Digital Twin</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* SVG Cadastral Canvas */}
              <div
                className={`flex-1 w-full border-x border-b rounded-b-lg relative overflow-hidden flex items-center justify-center p-3 shadow-xs transition-colors ${
                  step3SatelliteUnderlay
                    ? 'bg-[#030812]'
                    : isDark
                    ? 'bg-slate-950/90 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                <svg viewBox="-300 -240 600 480" className="w-full h-full max-h-[500px]">
                  {/* Metro Corridor Line */}
                  <path
                    d="M -260 -45 L 260 -45"
                    stroke="#0284c7"
                    strokeWidth="8"
                    strokeDasharray="6 4"
                    fill="none"
                    opacity="0.8"
                  />
                  <text x="-250" y="-55" fill="#0284c7" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    Underground Transit Line Axis (-16.5m depth)
                  </text>

                  {/* Parcels & Buildings */}
                  {parcels.map((parcel) => {
                    const b = buildings.find((x) => x.parcelId === parcel.parcelId);
                    const isSelected = b?.buildingId === selectedBuildingId || parcel.parcelId === selectedParcelId;
                    const [p1, p2, p3] = parcel.localPolygon;
                    const [c1] = parcel.boundaryCoordinates;
                    const cx = (c1[0] - (currentAreaObj?.center[0] || 80.2435)) / 0.000009;
                    const cy = (c1[1] - (currentAreaObj?.center[1] || 12.9865)) / 0.000009;
                    const w = Math.abs(p2[0] - p1[0]);
                    const h = Math.abs(p3[1] - p2[1]);

                    const isClash = b?.buildingId === 'B-007';
                    const isAllocated = b?.isUlpinAllocated;

                    return (
                      <g
                        key={parcel.parcelId}
                        onClick={() => b && handleInspectBuilding(b.buildingId)}
                        className="cursor-pointer group"
                      >
                        <rect
                          x={cx - w / 2}
                          y={cy - h / 2}
                          width={w}
                          height={h}
                          fill={
                            isSelected
                              ? '#38bdf8'
                              : isClash
                              ? '#fca5a5'
                              : isAllocated
                              ? '#a7f3d0'
                              : isDark || step3SatelliteUnderlay
                              ? '#1e293b'
                              : '#f8fafc'
                          }
                          fillOpacity={step3SatelliteUnderlay ? 0.85 : isDark ? 0.7 : 0.9}
                          stroke={
                            isSelected
                              ? '#0284c7'
                              : isClash
                              ? '#ef4444'
                              : isAllocated
                              ? '#10b981'
                              : '#cbd5e1'
                          }
                          strokeWidth={isSelected ? 2.5 : 1}
                          className="transition-all hover:stroke-sky-500"
                        />
                        <text
                          x={cx}
                          y={cy - 4}
                          fill={isDark || step3SatelliteUnderlay ? '#f1f5f9' : '#090d16'}
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {b ? b.buildingId : parcel.parcelId}
                        </text>
                        <text
                          x={cx}
                          y={cy + 6}
                          fill={isAllocated ? (isDark ? '#34d399' : '#047857') : isDark || step3SatelliteUnderlay ? '#94a3b8' : '#1e293b'}
                          fontSize="6.5"
                          fontFamily="monospace"
                          fontWeight={isAllocated ? 'bold' : '600'}
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {b ? (isAllocated ? '● 3D ULPIN' : 'G+' + b.floorsCount) : 'S.No ' + parcel.surveyNumber}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Map Legend */}
                <div
                  className={`absolute bottom-3 left-3 p-2 border rounded text-[10px] font-mono flex items-center gap-3 backdrop-blur ${
                    isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white/95 border-slate-300 text-slate-800 shadow-md font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-400 border border-emerald-600" />
                    <span>3D ULPIN Allocated</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-400" />
                    <span>Pending Allocation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-red-300 border border-red-500" />
                    <span>Subsurface Clash</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Building Details & Vertical ULPIN Inspector */}
            {inspectedBuilding && (
              <div
                className={`w-full lg:w-80 border-l flex flex-col p-4 gap-3 overflow-y-auto z-10 font-mono text-xs transition-colors ${
                  isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-950 dark:text-white text-sm">{inspectedBuilding.name}</div>
                    <div className="text-[11px] text-sky-800 dark:text-sky-400 font-bold">ID: {inspectedBuilding.buildingId}</div>
                  </div>
                  {inspectedBuilding.isUlpinAllocated ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-950 border border-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>ALLOCATED</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-400">
                      PENDING
                    </span>
                  )}
                </div>

                {/* Building Spatial Specs */}
                <div
                  className={`grid grid-cols-2 gap-2 p-2.5 rounded-lg border text-[11px] ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <div>
                    <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Base Land ULPIN</div>
                    <div className="text-slate-950 dark:text-slate-200 font-bold">{inspectedBuilding.baseLandId}</div>
                  </div>
                  <div>
                    <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Survey Number</div>
                    <div className="text-slate-950 dark:text-slate-200 font-bold">{inspectedParcel?.surveyNumber || '104/1'}</div>
                  </div>
                  <div>
                    <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Height</div>
                    <div className="text-slate-950 dark:text-slate-200 font-bold">{inspectedBuilding.totalHeight.toFixed(1)}m</div>
                  </div>
                  <div>
                    <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ground Datum</div>
                    <div className="text-slate-950 dark:text-slate-200 font-bold">+{inspectedBuilding.groundElevation.toFixed(1)}m MSL</div>
                  </div>
                </div>

                {/* Vertical Slabs & Candidate ULPINs */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-950 dark:text-slate-200">
                    <span>Vertical Volumetric Schedule</span>
                    <span className="text-sky-700 dark:text-sky-400">{inspectedBuilding.floors.length} Levels</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {inspectedBuilding.floors.map((fl) =>
                      fl.units.map((u) => (
                        <div
                          key={u.unitId}
                          className={`p-1.5 rounded border text-[10px] flex items-center justify-between ${
                            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-950 dark:text-slate-200">
                              {fl.floorNumber === 0
                                ? 'Ground (G00)'
                                : fl.floorNumber < 0
                                ? `Basement ${fl.floorNumber}`
                                : `Floor ${fl.floorNumber}`}
                            </div>
                            <div className={`text-[9px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Z: {u.zMin.toFixed(1)}m → {u.zMax.toFixed(1)}m
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sky-800 dark:text-sky-400 font-bold">{u.candidateIdentifier.candidateString}</div>
                            <div className={`text-[9px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{u.areaM2} m²</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Building Action Buttons */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  {!inspectedBuilding.isUlpinAllocated ? (
                    <button
                      onClick={() => handleSingleAllocateBuilding(inspectedBuilding)}
                      className="w-full py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded text-xs font-mono font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Allocate 3D ULPIN for This Building</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCertificateBuildingId(inspectedBuilding.buildingId)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>View 3D ULPIN Certificate</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleFlyToTwin(inspectedBuilding.buildingId)}
                    className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 rounded text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-700 dark:text-slate-400" />
                    <span>Fly to 3D Digital Twin</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3D ULPIN Allocation Engine Modal */}
      {allocationModalTarget && (
        <UlpinAllocationModal
          targetType={allocationModalTarget.type}
          targetName={allocationModalTarget.targetName}
          buildingsToAllocate={allocationModalTarget.buildings}
          parcels={parcels}
          onComplete={() => {
            if (allocationModalTarget.type === 'area') {
              allocate3DUlpinForArea(currentAreaObj?.id || 'area');
            } else if (inspectedBuilding) {
              allocate3DUlpinForBuilding(inspectedBuilding.buildingId);
            }
          }}
          onClose={() => setAllocationModalTarget(null)}
          onInspectBuilding={handleInspectBuilding}
        />
      )}

      {/* 3D ULPIN Spatial Allocation Certificate Modal */}
      {certificateBuildingId && (
        <UlpinCertificateModal
          building={buildings.find((b) => b.buildingId === certificateBuildingId) || inspectedBuilding}
          parcel={inspectedParcel}
          onClose={() => setCertificateBuildingId(null)}
          onFlyTo3D={() => handleFlyToTwin(certificateBuildingId)}
        />
      )}
    </div>
  );
};
