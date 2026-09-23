import {
  Building,
  LandParcel,
  MetroStation,
  MetroTunnel,
  OwnershipRecord,
  TopologyIssue,
  UtilityInfrastructure,
  PropertyUnit,
} from '../types';
import { VerticalIdentifierComposer } from '../services/identifierService';

// Standard provenance template
const DEMO_PROVENANCE = {
  parcel: 'Tamil Nadu Cadastral Survey (Demo Seeded)',
  building: 'LiDAR Extrusion & Building Footprint GIS',
  floor: 'Municipal Approved Architectural Floorplan',
  elevation: 'CartoDEM 10m Ground Elevation',
  position: 'CORS Network DGPS Survey',
  ownership: 'Tamil Nadu Registration Department (Demo Synthetic Records)',
  geometry: 'AI Vector Extrusion Engine v2.4',
  confidence: 0.94,
  timestamp: '2026-03-15T10:30:00Z',
  modelVersion: 'V3D-Extrusion-Net-v2.1',
};

// Generate 52 parcels across an engineering coordinate grid centered around (0,0) = Taramani OMR
export const DEMO_PARCELS: LandParcel[] = [];
export const DEMO_BUILDINGS: Building[] = [];
export const DEMO_OWNERSHIP: Record<string, OwnershipRecord> = {};

// Grid layout for 52 parcels
const gridCols = 8;
const gridRows = 7;
const cellWidth = 45; // meters
const cellDepth = 45; // meters
const streetWidth = 14; // meters

let parcelIdx = 1;
for (let r = 0; r < gridRows; r++) {
  for (let c = 0; c < gridCols; c++) {
    if (parcelIdx > 52) break;

    const localX = (c - gridCols / 2) * (cellWidth + streetWidth);
    const localY = (r - gridRows / 2) * (cellDepth + streetWidth);
    const pId = `P-${parcelIdx.toString().padStart(3, '0')}`;
    const baseLandId = `TN-CH-04-${(10100 + parcelIdx).toString()}`;
    const surveyNo = `${104 + Math.floor(parcelIdx / 5)}/${(parcelIdx % 5) + 1}`;

    const zoneType =
      c === 3 || c === 4
        ? 'Transit Oriented Commercial'
        : r < 2
        ? 'IT Corridor Special Economic Zone'
        : r > 4
        ? 'High-Density Residential'
        : 'Mixed Commercial & Public';

    const halfW = cellWidth / 2 - 2;
    const halfD = cellDepth / 2 - 2;

    const parcel: LandParcel = {
      parcelId: pId,
      baseLandId,
      surveyNumber: surveyNo,
      subDivision: `${(parcelIdx % 3) + 1}A`,
      district: 'Chennai',
      taluk: 'Velachery',
      village: 'Taramani',
      projectArea: 'Taramani OMR Tech & Metro Hub',
      areaM2: Math.round(cellWidth * cellDepth),
      groundElevationMsl: 11.5 + (r * 0.2 - c * 0.1),
      boundaryCoordinates: [
        [80.2435 + localX * 0.000009, 12.9865 + localY * 0.000009],
        [80.2435 + (localX + cellWidth) * 0.000009, 12.9865 + localY * 0.000009],
        [80.2435 + (localX + cellWidth) * 0.000009, 12.9865 + (localY + cellDepth) * 0.000009],
        [80.2435 + localX * 0.000009, 12.9865 + (localY + cellDepth) * 0.000009],
      ],
      localPolygon: [
        [-halfW, -halfD],
        [halfW, -halfD],
        [halfW, halfD],
        [-halfW, halfD],
      ],
      fsiAllowed: zoneType.includes('Transit') ? 3.25 : 2.5,
      fsiConsumed: Number((1.8 + (parcelIdx % 10) * 0.14).toFixed(2)),
      zone: zoneType,
      isSynthetic: true,
      provenance: DEMO_PROVENANCE,
    };
    DEMO_PARCELS.push(parcel);

    // Build building on ~34 parcels
    if (parcelIdx <= 34) {
      const bId = `B-${parcelIdx.toString().padStart(3, '0')}`;
      const floorsCount = (parcelIdx % 6) + 3; // 3 to 8 floors
      const hasBasement = parcelIdx % 3 !== 0;
      const basementCount = hasBasement ? (parcelIdx % 2 === 0 ? 2 : 1) : 0;
      const floorHeight = 3.4; // meters
      const bWidth = cellWidth * 0.72;
      const bDepth = cellDepth * 0.72;
      const footprintAreaM2 = Math.round(bWidth * bDepth);
      const totalHeight = floorsCount * floorHeight;

      // Special highlight tower: B-007 is "Apex IT Towers" with conflict VAL-001
      const buildingName =
        parcelIdx === 7
          ? 'Apex IT Tech Tower (Subsurface Conflict)'
          : parcelIdx === 18
          ? 'Taramani Heights Residency'
          : parcelIdx === 24
          ? 'Metro Gateway Plaza'
          : parcelIdx === 1
          ? 'Tamil Nadu Geospatial Center'
          : `Urban Block ${bId}`;

      const floors = [];

      // Generate Basements
      for (let b = basementCount; b >= 1; b--) {
        const fNum = -b;
        const zMin = -b * 3.5;
        const zMax = -(b - 1) * 3.5;
        const uId = `B${b.toString().padStart(2, '0')}`;
        const internalPropNum = parcelIdx * 100 + b;
        const candidateId = VerticalIdentifierComposer.compose({
          baseLandId,
          verticalPosition: 'BASEMENT',
          floorNumber: fNum,
          unitId: uId,
          internalPropNumber: internalPropNum,
        });

        const units: PropertyUnit[] = [
          {
            unitId: uId,
            propertyVolumeId: candidateId.internalPropertyId,
            name: `Basement -${b} Automated Parking & Utility`,
            propertyType: 'PARKING',
            areaM2: footprintAreaM2,
            floorNumber: fNum,
            zMin,
            zMax,
            candidateIdentifier: candidateId,
          },
        ];

        floors.push({
          floorId: `${bId}-FL-B${b}`,
          floorNumber: fNum,
          floorType: 'BASEMENT' as const,
          zMin,
          zMax,
          height: 3.5,
          areaM2: footprintAreaM2,
          volumeM3: footprintAreaM2 * 3.5,
          units,
          source: 'Underground Structural Blueprint',
          confidence: 0.95,
        });
      }

      // Generate Ground and Above Floors
      for (let f = 0; f <= floorsCount; f++) {
        const isGround = f === 0;
        const zMin = f * floorHeight;
        const zMax = (f + 1) * floorHeight;
        const fType = isGround ? ('GROUND' as const) : ('FLOOR' as const);
        const propType = isGround
          ? ('COMMERCIAL' as const)
          : zoneType.includes('IT')
          ? ('COMMERCIAL' as const)
          : ('RESIDENTIAL' as const);

        const units: PropertyUnit[] = [];
        const unitsPerFloor = 2;
        const unitArea = Math.round(footprintAreaM2 / unitsPerFloor);

        for (let u = 1; u <= unitsPerFloor; u++) {
          const uCode = `U0${u}`;
          const internalPropNum = parcelIdx * 1000 + f * 10 + u;
          const candidateId = VerticalIdentifierComposer.compose({
            baseLandId,
            verticalPosition: fType,
            floorNumber: f,
            unitId: uCode,
            internalPropNumber: internalPropNum,
          });

          const unit: PropertyUnit = {
            unitId: `${bId}-F${f}-${uCode}`,
            propertyVolumeId: candidateId.internalPropertyId,
            name: `Suite ${f}0${u} (${propType})`,
            propertyType: propType,
            areaM2: unitArea,
            floorNumber: f,
            zMin,
            zMax,
            candidateIdentifier: candidateId,
          };
          units.push(unit);

          // Seed demo ownership record
          DEMO_OWNERSHIP[candidateId.internalPropertyId] = {
            ownerId: `OWN-${internalPropNum}`,
            ownerName:
              parcelIdx === 7 && f === 3 && u === 2
                ? 'Karthik Maneesh (Demo Authorized Licensee)'
                : parcelIdx === 18 && f === 2
                ? 'Thiru. S. Rajendran & Family (Synthetic Owner)'
                : `Demo Asset Holder ${parcelIdx}-${f}${u}`,
            ownershipType: propType === 'COMMERCIAL' ? 'LEASEHOLD' : 'FREEHOLD',
            propertyId: candidateId.internalPropertyId,
            surveyNumber: surveyNo,
            registrationReference: `TN-REG/VEL/2023/${10000 + internalPropNum}`,
            tenure: 'Perpetual Freehold Title',
            source: 'Demonstration Cadastral Simulation',
            verified: true,
            authorizedDataSource: true,
            contactMasked: '+91 98**** *102',
          };
        }

        floors.push({
          floorId: `${bId}-FL-${f}`,
          floorNumber: f,
          floorType: fType,
          zMin,
          zMax,
          height: floorHeight,
          areaM2: footprintAreaM2,
          volumeM3: footprintAreaM2 * floorHeight,
          units,
          source: 'Vector Extrusion Model',
          confidence: 0.93,
        });
      }

      const totalBuiltupAreaM2 = footprintAreaM2 * (floorsCount + 1 + basementCount);
      const totalVolumeM3 = totalBuiltupAreaM2 * floorHeight;

      const building: Building = {
        buildingId: bId,
        name: buildingName,
        baseLandId,
        parcelId: pId,
        floorsCount,
        basementCount,
        groundElevation: parcel.groundElevationMsl,
        roofElevation: parcel.groundElevationMsl + totalHeight,
        totalHeight,
        footprintAreaM2,
        totalBuiltupAreaM2,
        totalVolumeM3,
        floors,
        propertyType: zoneType.includes('IT')
          ? 'COMMERCIAL'
          : zoneType.includes('Residential')
          ? 'RESIDENTIAL'
          : 'MIXED_USE',
        coordinates: [
          80.2435 + (localX + cellWidth / 2) * 0.000009,
          12.9865 + (localY + cellDepth / 2) * 0.000009,
        ],
        localX,
        localY,
        width: bWidth,
        depth: bDepth,
        provenance: DEMO_PROVENANCE,
      };

      DEMO_BUILDINGS.push(building);
    }

    parcelIdx++;
  }
}

// Underground Infrastructure:
// 1. Chennai Metro Line 4 Corridor (Deep Subway Tunnel)
export const DEMO_METRO_TUNNEL: MetroTunnel = {
  tunnelId: 'CMRL-LINE4-TUNNEL-NORTH',
  line: 'Chennai Metro Line 4 (Underground Corridor)',
  diameter: 5.8,
  depthZ: -16.5,
  path: [
    [-240, -45, -16.5],
    [-120, -45, -16.5],
    [0, -45, -16.5],
    [120, -45, -16.5],
    [240, -45, -16.5],
  ],
  status: 'OPERATIONAL',
};

// 2. Underground Metro Station
export const DEMO_METRO_STATION: MetroStation = {
  stationId: 'CMRL-STN-TARAMANI-UG',
  name: 'Taramani Underground Interchange Station',
  line: 'Chennai Metro Corridor 4',
  groundElevation: 12.0,
  platformElevation: -16.0,
  depth: 16.0,
  length: 180,
  width: 26,
  localX: 0,
  localY: -45,
  entrances: [
    { id: 'ENT-01', name: 'Entry/Exit A - OMR North', x: -40, y: -25 },
    { id: 'ENT-02', name: 'Entry/Exit B - TIDEL Link Road', x: 40, y: -25 },
    { id: 'ENT-03', name: 'Entry/Exit C - Ascendas IT Park Way', x: -40, y: -65 },
    { id: 'ENT-04', name: 'Entry/Exit D - Bus Rapid Transit Interchange', x: 40, y: -65 },
  ],
  connectedParcels: ['P-027', 'P-028', 'P-035', 'P-036'],
  nearbyProperties: ['V3D-PROP-024001', 'V3D-PROP-028001'],
};

// 3. Underground Utilities
export const DEMO_UTILITIES: UtilityInfrastructure[] = [
  {
    infrastructureId: 'CMWSSB-WATER-MAIN-01',
    type: 'WATER_MAIN',
    name: 'Metro Water Ø600mm Ductile Iron Transmission Main',
    diameterMm: 600,
    material: 'Ductile Iron Class K9',
    depthZ: -4.5,
    zMin: -4.8,
    zMax: -4.2,
    path: [
      [-240, 20, -4.5],
      [-100, 20, -4.5],
      [50, 20, -4.5],
      [240, 20, -4.5],
    ],
    status: 'ACTIVE',
    source: 'CMWSSB Subsurface GIS Masterplan',
  },
  {
    infrastructureId: 'CMWSSB-SEWER-TRUNK-01',
    type: 'SEWER_TRUNK',
    name: 'Underground Deep Gravity Sewer Trunk Ø900mm',
    diameterMm: 900,
    material: 'Reinforced Spun Concrete with HDPE Liner',
    depthZ: -8.2,
    zMin: -8.65,
    zMax: -7.75,
    path: [
      [-240, -100, -8.2],
      [-50, -100, -8.2],
      [100, -100, -8.2],
      [240, -100, -8.2],
    ],
    status: 'ACTIVE',
    source: 'Greater Chennai Corporation Underground Asset Registry',
  },
  {
    infrastructureId: 'TANGEDCO-ELEC-33KV',
    type: 'ELECTRICAL_CONDUIT',
    name: 'TANGEDCO 33kV Underground Power Feeder Duct Bank',
    diameterMm: 350,
    material: 'Encased Polyvinyl Duct Quad-Pack',
    depthZ: -2.4,
    zMin: -2.6,
    zMax: -2.2,
    path: [
      [-240, 80, -2.4],
      [0, 80, -2.4],
      [240, 80, -2.4],
    ],
    status: 'ACTIVE',
    source: 'TANGEDCO Sub-transmission Network Cadastre',
  },
  {
    infrastructureId: 'OPTIC-FIBER-TELCO',
    type: 'TELECOM_DUCT',
    name: 'Tamil Nadu BharatNet Core Optical Fiber Utility Ducts',
    diameterMm: 200,
    material: 'High-Density Polyethylene multi-duct',
    depthZ: -1.6,
    zMin: -1.75,
    zMax: -1.45,
    path: [
      [-240, -10, -1.6],
      [0, -10, -1.6],
      [240, -10, -1.6],
    ],
    status: 'ACTIVE',
    source: 'ELCOT Telecommunications Subsurface Infrastructure',
  },
];

// Deliberate 3D Spatial Conflicts for Evaluation
export const DEMO_TOPOLOGY_ISSUES: TopologyIssue[] = [
  {
    id: 'VAL-001',
    severity: 'critical',
    issueType: 'METRO_BASEMENT_INTERSECTION',
    objectA: 'CMRL Metro Line 4 Tunnel (Subsurface Crown)',
    objectB: 'Apex IT Tech Tower (B-007 Basement -2)',
    description:
      'CRITICAL 3D CONFLICT: Subsurface Basement -2 structural volume (Z: -7.0m to -10.5m) penetrates 1.2m into the CMRL Metro Tunnel 15m statutory subterranean exclusion zone at coordinate [X: 120, Y: -45, Z: -8.2m].',
    zRangeA: [-19.4, -13.6],
    zRangeB: [-10.5, -7.0],
    location: [120, -45, -8.2],
    isTrue3DIntersection: true,
    recommendation:
      'Modify structural footing design; raise Basement -2 slab elevation to -6.0m or acquire CMRL geotechnical deviation approval.',
  },
  {
    id: 'VAL-002',
    severity: 'critical',
    issueType: 'FOUNDATION_UTILITY_CLASH',
    objectA: 'Metro Water Ø600mm Transmission Trunk (CMWSSB-WATER-MAIN-01)',
    objectB: 'Commercial Block B-024 Retaining Pile Group',
    description:
      'TRUE 3D CLASH: Foundation retention soldier piles directly intersect the Ø600mm high-pressure water main at depth Z: -4.5m.',
    zRangeA: [-4.8, -4.2],
    zRangeB: [-8.0, 0.0],
    location: [50, 20, -4.5],
    isTrue3DIntersection: true,
    recommendation:
      'Realign pile grid spacing by 2.5m westward or commission diversion of the water main prior to excavation.',
  },
  {
    id: 'VAL-003',
    severity: 'warning',
    issueType: 'BUFFER_ZONE_VIOLATION',
    objectA: 'Public Buckingham Canal Feeder Drainage Trunk',
    objectB: 'Residential Parcel P-038 Boundary Wall',
    description:
      'REGULATORY BUFFER WARNING: Proposed boundary wall is within 12.2m of canal embankment, violating TNCDBR Rule 19(1) mandatory 15m green buffer.',
    zRangeA: [0, 2],
    zRangeB: [0, 2.5],
    location: [-120, 110, 0],
    isTrue3DIntersection: false,
    recommendation:
      'Enforce 2.8m setback from northern boundary line in cadastral layout approval.',
  },
  {
    id: 'VAL-004',
    severity: 'warning',
    issueType: 'FLOOR_GAP',
    objectA: 'Floor 4 Slab Top (Apex IT Tower)',
    objectB: 'Floor 5 Soffit Bottom (Apex IT Tower)',
    description:
      'VOLUMETRIC CONTINUITY WARNING: 0.4m unclassified vertical plenum detected between Floor 4 (Z-Max: 13.6m) and Floor 5 (Z-Min: 14.0m).',
    zRangeA: [10.2, 13.6],
    zRangeB: [14.0, 17.4],
    location: [120, -45, 13.8],
    isTrue3DIntersection: false,
    recommendation:
      'Classify unassigned volume as "SERVICE_PLENUM" or adjust architectural floor heights.',
  },
];
