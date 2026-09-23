import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  Building,
  LandParcel,
  MetroStation,
  MetroTunnel,
  PropertyUnit,
  TopologyIssue,
  UserRole,
  UtilityInfrastructure,
} from '../types';
import {
  DEMO_PARCELS,
  DEMO_BUILDINGS,
  DEMO_METRO_STATION,
  DEMO_METRO_TUNNEL,
  DEMO_UTILITIES,
  DEMO_TOPOLOGY_ISSUES,
  DEMO_OWNERSHIP,
} from '../data/demoCityData';
import { AreaDataGenerator } from '../services/areaDataGenerator';

export type AppView =
  | 'dashboard'
  | 'map'
  | 'twin'
  | 'properties'
  | 'blueprint'
  | 'infrastructure'
  | 'identifier'
  | 'tax'
  | 'validation'
  | 'reports';

export interface V3DState {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  viewMode: '3d' | '2d' | 'split';
  setViewMode: (mode: '3d' | '2d' | 'split') => void;

  // Geography
  selectedDistrict: string;
  setSelectedDistrict: (dist: string) => void;
  selectedProjectArea: string;
  setSelectedProjectArea: (area: string) => void;
  switchProjectArea: (districtId: string, areaId: string) => void;

  // Selected entities
  selectedParcelId: string | null;
  setSelectedParcelId: (id: string | null) => void;
  selectedBuildingId: string | null;
  setSelectedBuildingId: (id: string | null) => void;
  selectedFloorNumber: number | null;
  setSelectedFloorNumber: (fl: number | null) => void;
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;
  selectedConflictId: string | null;
  setSelectedConflictId: (id: string | null) => void;

  // User & Mode
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isRealDataMode: boolean;
  setIsRealDataMode: (val: boolean) => void;

  // 3D Visualizer settings
  layerVisibility: {
    parcels: boolean;
    buildings: boolean;
    floors: boolean;
    underground: boolean;
    metro: boolean;
    water: boolean;
    sewer: boolean;
    electrical: boolean;
    telecom: boolean;
    conflicts: boolean;
  };
  toggleLayer: (layer: keyof V3DState['layerVisibility']) => void;
  setLayerVisibility: (layer: keyof V3DState['layerVisibility'], val: boolean) => void;

  explodeFloorsValue: number; // 0 to 12 meters
  setExplodeFloorsValue: (val: number) => void;
  sectionPlaneActive: boolean;
  setSectionPlaneActive: (val: boolean) => void;
  sectionPlaneOffset: number;
  setSectionPlaneOffset: (val: number) => void;
  sectionAxis: 'x' | 'y' | 'z';
  setSectionAxis: (axis: 'x' | 'y' | 'z') => void;
  wireframeMode: boolean;
  setWireframeMode: (val: boolean) => void;
  translucentGround: boolean;
  setTranslucentGround: (val: boolean) => void;

  // Measurement
  activeMeasurementTool: 'none' | 'distance' | 'height' | 'depth' | 'clearance' | 'volume';
  setActiveMeasurementTool: (tool: 'none' | 'distance' | 'height' | 'depth' | 'clearance' | 'volume') => void;

  // Data
  parcels: LandParcel[];
  buildings: Building[];
  addBuilding: (b: Building) => void;
  metroTunnel: MetroTunnel;
  metroStation: MetroStation;
  utilities: UtilityInfrastructure[];
  conflicts: TopologyIssue[];
  ownership: typeof DEMO_OWNERSHIP;

  // 3D ULPIN Allocation Engine
  allocate3DUlpinForBuilding: (buildingId: string) => void;
  allocate3DUlpinForArea: (areaId: string) => void;
  isAllocatingUlpin: boolean;
  setIsAllocatingUlpin: (val: boolean) => void;

  // Guided demo tour
  showTour: boolean;
  setShowTour: (show: boolean) => void;
  tourStep: number;
  setTourStep: (step: number) => void;

  // Theme mode (Light / Dark)
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;

  // Camera focus trigger
  focusTarget: [number, number, number] | null;
  setFocusTarget: (pos: [number, number, number] | null) => void;
}

const V3DContext = createContext<V3DState | null>(null);

export const V3DProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('map');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [viewMode, setViewMode] = useState<'3d' | '2d' | 'split'>('3d');

  const [selectedDistrict, setSelectedDistrict] = useState<string>('chennai');
  const [selectedProjectArea, setSelectedProjectArea] = useState<string>('taramani-omr');

  const [selectedParcelId, setSelectedParcelId] = useState<string | null>('P-007');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>('B-007');
  const [selectedFloorNumber, setSelectedFloorNumber] = useState<number | null>(3);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>('V3D-PROP-007032');
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<UserRole>('ENGINEER');
  const [isRealDataMode, setIsRealDataMode] = useState<boolean>(false);

  const [layerVisibility, setLayerVisibilityState] = useState({
    parcels: true,
    buildings: true,
    floors: true,
    underground: true,
    metro: true,
    water: true,
    sewer: true,
    electrical: true,
    telecom: true,
    conflicts: true,
  });

  const toggleLayer = (layer: keyof V3DState['layerVisibility']) => {
    setLayerVisibilityState((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const setLayerVisibility = (layer: keyof V3DState['layerVisibility'], val: boolean) => {
    setLayerVisibilityState((prev) => ({ ...prev, [layer]: val }));
  };

  const [explodeFloorsValue, setExplodeFloorsValue] = useState<number>(0);
  const [sectionPlaneActive, setSectionPlaneActive] = useState<boolean>(false);
  const [sectionPlaneOffset, setSectionPlaneOffset] = useState<number>(0);
  const [sectionAxis, setSectionAxis] = useState<'x' | 'y' | 'z'>('x');
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [translucentGround, setTranslucentGround] = useState<boolean>(true);

  const [activeMeasurementTool, setActiveMeasurementTool] = useState<
    'none' | 'distance' | 'height' | 'depth' | 'clearance' | 'volume'
  >('none');

  // Initialize data with default Taramani OMR
  const [parcels, setParcels] = useState<LandParcel[]>(DEMO_PARCELS);
  const [buildings, setBuildings] = useState<Building[]>(DEMO_BUILDINGS);
  const [isAllocatingUlpin, setIsAllocatingUlpin] = useState<boolean>(false);

  // Switch project area handler
  const switchProjectArea = useCallback((districtId: string, areaId: string) => {
    setSelectedDistrict(districtId);
    setSelectedProjectArea(areaId);

    const areaData = AreaDataGenerator.getAreaCadastralData(districtId, areaId);
    setParcels(areaData.parcels);
    setBuildings(areaData.buildings);

    if (areaData.buildings.length > 0) {
      const firstB = areaData.buildings[0];
      setSelectedBuildingId(firstB.buildingId);
      setSelectedParcelId(firstB.parcelId);
      const topFloor = firstB.floors[firstB.floors.length - 1];
      if (topFloor) {
        setSelectedFloorNumber(topFloor.floorNumber);
        if (topFloor.units[0]) {
          setSelectedPropertyId(topFloor.units[0].propertyVolumeId);
        }
      }
    } else if (areaData.parcels.length > 0) {
      setSelectedParcelId(areaData.parcels[0].parcelId);
      setSelectedBuildingId(null);
    }
  }, []);

  const addBuilding = (b: Building) => {
    setBuildings((prev) => [b, ...prev]);
    setSelectedBuildingId(b.buildingId);
    setSelectedParcelId(b.parcelId);
  };

  // 3D ULPIN Allocation Engine handlers
  const allocate3DUlpinForBuilding = useCallback((buildingId: string) => {
    setBuildings((prev) =>
      prev.map((b) => {
        if (b.buildingId === buildingId) {
          const certHash = `SHA256-TN-${b.baseLandId.replace(/[^A-Za-z0-9]/g, '')}-${b.buildingId}-${Date.now().toString().slice(-6)}`;
          return {
            ...b,
            isUlpinAllocated: true,
            ulpinAllocatedAt: new Date().toISOString(),
            ulpinCertificateHash: certHash,
          };
        }
        return b;
      })
    );
  }, []);

  const allocate3DUlpinForArea = useCallback((areaId: string) => {
    setIsAllocatingUlpin(true);
    setTimeout(() => {
      setBuildings((prev) =>
        prev.map((b) => {
          const certHash = `SHA256-TN-${b.baseLandId.replace(/[^A-Za-z0-9]/g, '')}-${b.buildingId}-${Math.floor(100000 + Math.random() * 900000)}`;
          return {
            ...b,
            isUlpinAllocated: true,
            ulpinAllocatedAt: new Date().toISOString(),
            ulpinCertificateHash: certHash,
          };
        })
      );
      setIsAllocatingUlpin(false);
    }, 600);
  }, []);

  const [showTour, setShowTour] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);
  const [focusTarget, setFocusTarget] = useState<[number, number, number] | null>(null);

  const value: V3DState = useMemo(
    () => ({
      currentView,
      setCurrentView,
      viewMode,
      setViewMode,
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
      selectedPropertyId,
      setSelectedPropertyId,
      selectedConflictId,
      setSelectedConflictId,
      userRole,
      setUserRole,
      theme,
      setTheme,
      isRealDataMode,
      setIsRealDataMode,
      layerVisibility,
      toggleLayer,
      setLayerVisibility,
      explodeFloorsValue,
      setExplodeFloorsValue,
      sectionPlaneActive,
      setSectionPlaneActive,
      sectionPlaneOffset,
      setSectionPlaneOffset,
      sectionAxis,
      setSectionAxis,
      wireframeMode,
      setWireframeMode,
      translucentGround,
      setTranslucentGround,
      activeMeasurementTool,
      setActiveMeasurementTool,
      parcels,
      buildings,
      addBuilding,
      allocate3DUlpinForBuilding,
      allocate3DUlpinForArea,
      isAllocatingUlpin,
      setIsAllocatingUlpin,
      metroTunnel: DEMO_METRO_TUNNEL,
      metroStation: DEMO_METRO_STATION,
      utilities: DEMO_UTILITIES,
      conflicts: DEMO_TOPOLOGY_ISSUES,
      ownership: DEMO_OWNERSHIP,
      showTour,
      setShowTour,
      tourStep,
      setTourStep,
      focusTarget,
      setFocusTarget,
    }),
    [
      currentView,
      viewMode,
      selectedDistrict,
      selectedProjectArea,
      switchProjectArea,
      selectedParcelId,
      selectedBuildingId,
      selectedFloorNumber,
      selectedPropertyId,
      selectedConflictId,
      userRole,
      theme,
      isRealDataMode,
      layerVisibility,
      explodeFloorsValue,
      sectionPlaneActive,
      sectionPlaneOffset,
      sectionAxis,
      wireframeMode,
      translucentGround,
      activeMeasurementTool,
      parcels,
      buildings,
      allocate3DUlpinForBuilding,
      allocate3DUlpinForArea,
      isAllocatingUlpin,
      showTour,
      tourStep,
      focusTarget,
    ]
  );

  return <V3DContext.Provider value={value}>{children}</V3DContext.Provider>;
};

export const useV3D = (): V3DState => {
  const context = useContext(V3DContext);
  if (!context) {
    throw new Error('useV3D must be used within a V3DProvider');
  }
  return context;
};
