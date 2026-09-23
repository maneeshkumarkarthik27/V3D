export type VerticalPosition =
  | 'GROUND'
  | 'ABOVE'
  | 'BELOW'
  | 'BASEMENT'
  | 'UNDERGROUND'
  | 'FLOOR'
  | 'ROOF'
  | 'PARKING'
  | 'UTILITY'
  | 'COMMON'
  | 'SERVICE';

export type PropertyType =
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'INDUSTRIAL'
  | 'GOVERNMENT'
  | 'INSTITUTIONAL'
  | 'PARKING'
  | 'UTILITY'
  | 'COMMON'
  | 'SERVICE'
  | 'MIXED_USE';

export type UserRole =
  | 'PUBLIC_VIEWER'
  | 'SURVEYOR'
  | 'ENGINEER'
  | 'MUNICIPAL_USER'
  | 'ADMIN'
  | 'DATA_PROVIDER';

export interface DataProvenance {
  parcel: string;
  building: string;
  floor: string;
  elevation: string;
  position: string;
  ownership: string;
  geometry: string;
  confidence: number;
  timestamp: string;
  modelVersion?: string;
}

export interface CandidateIdentifier {
  baseLandId: string;
  verticalComponent: string; // e.g., 'A' for Above, 'B' for Basement, 'U' for Underground
  levelCode: string; // e.g., 'G03', 'B01', 'RF'
  unitCode: string; // e.g., 'U02', 'COM'
  candidateString: string; // e.g. "TN-CH-04-10294-A-G03-U02"
  internalPropertyId: string; // e.g. "V3D-PROP-000018"
  officialStatus: 'PENDING_GOVERNMENT_SPECIFICATION';
  composedAt: string;
  configVersion: string;
}

export interface FloorVolume {
  floorId: string;
  floorNumber: number; // e.g. -2, -1, 0, 1, 2, 3...
  floorType: VerticalPosition;
  zMin: number; // meters from ground (0m)
  zMax: number;
  height: number;
  areaM2: number;
  volumeM3: number;
  units: PropertyUnit[];
  source: string;
  confidence: number;
}

export interface PropertyUnit {
  unitId: string;
  propertyVolumeId: string;
  name: string;
  propertyType: PropertyType;
  areaM2: number;
  floorNumber: number;
  zMin: number;
  zMax: number;
  ownerId?: string;
  candidateIdentifier: CandidateIdentifier;
}

export interface Building {
  buildingId: string;
  name: string;
  baseLandId: string;
  parcelId: string;
  floorsCount: number;
  basementCount: number;
  groundElevation: number; // MSL (Mean Sea Level) meters
  roofElevation: number;
  totalHeight: number;
  footprintAreaM2: number;
  totalBuiltupAreaM2: number;
  totalVolumeM3: number;
  floors: FloorVolume[];
  propertyType: PropertyType;
  coordinates: [number, number]; // [lng, lat]
  localX: number; // local metric coordinate X (m)
  localY: number; // local metric coordinate Y (m)
  width: number;
  depth: number;
  provenance: DataProvenance;
  isUlpinAllocated?: boolean;
  ulpinAllocatedAt?: string;
  ulpinCertificateHash?: string;
  totalUnitsCount?: number;
  projectAreaId?: string;
}

export interface LandParcel {
  parcelId: string;
  baseLandId: string;
  surveyNumber: string;
  subDivision?: string;
  district: string;
  taluk: string;
  village: string;
  projectArea: string;
  areaM2: number;
  boundaryCoordinates: [number, number][]; // [lng, lat] polygon
  localPolygon: [number, number][]; // metric polygon offsets
  groundElevationMsl: number;
  fsiAllowed: number;
  fsiConsumed: number;
  zone: string; // e.g. "Primary Residential", "Mixed Commercial", "IT Corridor"
  isSynthetic: boolean;
  provenance: DataProvenance;
  isUlpinAllocated?: boolean;
}

export interface OwnershipRecord {
  ownerId: string;
  ownerName: string;
  ownershipType: 'FREEHOLD' | 'LEASEHOLD' | 'GOVERNMENT' | 'COMMUNITY' | 'PROTOTYPE_DEMO';
  propertyId: string;
  surveyNumber: string;
  registrationReference: string;
  tenure: string;
  source: string;
  verified: boolean;
  authorizedDataSource: boolean;
  contactMasked?: string;
}

export interface TaxAssessment {
  propertyId: string;
  assessmentCategory: string;
  taxPeriod: string;
  taxStatus: 'PAID' | 'DUE' | 'EXEMPT' | 'UNDER_REVIEW';
  builtUpAreaM2: number;
  baseRatePerM2: number;
  zoneMultiplier: number;
  floorMultiplier: number;
  estimatedAnnualTax: number;
  outstandingAmount: number;
  isPrototypeEstimate: true;
  formulaNote: string;
}

export interface PolicyRule {
  policyId: string;
  authority: string; // e.g. "CMDA", "DTCP Tamil Nadu", "CMRL"
  policyName: string;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  applicability: string;
  sourceReference: string;
  ruleExpression: string;
  status: 'COMPLIANT' | 'WARNING' | 'VIOLATION' | 'INFORMATION';
  notes: string;
}

export interface MetroStation {
  stationId: string;
  name: string;
  line: string;
  groundElevation: number;
  platformElevation: number; // negative meters (e.g. -16m)
  depth: number;
  length: number;
  width: number;
  entrances: { id: string; name: string; x: number; y: number }[];
  connectedParcels: string[];
  nearbyProperties: string[];
  localX: number;
  localY: number;
}

export interface MetroTunnel {
  tunnelId: string;
  line: string;
  diameter: number; // e.g. 5.8m
  depthZ: number; // e.g. -18m
  path: [number, number, number][]; // [x, y, z] metric local coordinates
  status: 'OPERATIONAL' | 'UNDER_CONSTRUCTION';
}

export interface UtilityInfrastructure {
  infrastructureId: string;
  type: 'WATER_MAIN' | 'SEWER_TRUNK' | 'DRAINAGE' | 'ELECTRICAL_CONDUIT' | 'TELECOM_DUCT' | 'GAS_LINE';
  name: string;
  diameterMm: number;
  material: string;
  depthZ: number; // e.g. -4.5m
  zMin: number;
  zMax: number;
  path: [number, number, number][]; // [x, y, z] metric coords
  status: 'ACTIVE' | 'MAINTENANCE' | 'PLANNED';
  source: string;
}

export interface TopologyIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  issueType:
    | 'METRO_BASEMENT_INTERSECTION'
    | 'FOUNDATION_UTILITY_CLASH'
    | 'BOUNDARY_ENCROACHMENT'
    | 'FLOOR_OVERLAP'
    | 'FLOOR_GAP'
    | 'FLOATING_BUILDING'
    | 'BUFFER_ZONE_VIOLATION';
  objectA: string;
  objectB: string;
  description: string;
  zRangeA: [number, number];
  zRangeB: [number, number];
  location: [number, number, number]; // [x, y, z]
  isTrue3DIntersection: boolean;
  recommendation: string;
}

export interface BlueprintAnalysisResult {
  blueprintId: string;
  filename: string;
  format: 'SVG' | 'DXF' | 'GEOJSON' | 'PNG' | 'JPG' | 'PDF';
  detectedScale: number; // pixels/units per meter
  detectedFloors: number;
  confidence: number;
  rooms: { id: string; name: string; areaM2: number; type: PropertyType; bounds: [number, number, number, number] }[];
  walls: { x1: number; y1: number; x2: number; y2: number; thickness: number }[];
  doors: { x: number; y: number; width: number }[];
  windows: { x: number; y: number; width: number }[];
  totalAreaM2: number;
  status: 'PROCESSED' | 'PENDING' | 'MANUAL_OVERRIDE';
}
