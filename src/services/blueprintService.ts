import { BlueprintAnalysisResult, Building, FloorVolume, PropertyType, PropertyUnit } from '../types';
import { VerticalIdentifierComposer } from './identifierService';

export class BlueprintService {
  /**
   * Generates a realistic synthetic architectural blueprint analysis from an uploaded file
   */
  public static analyzeBlueprint(
    file: { name: string; size: number; type: string },
    customFloors?: number,
    customFloorHeight?: number
  ): BlueprintAnalysisResult {
    const ext = file.name.split('.').pop()?.toUpperCase() || 'SVG';
    const validFormat = ['SVG', 'DXF', 'GEOJSON', 'PNG', 'JPG', 'PDF'].includes(ext)
      ? (ext as BlueprintAnalysisResult['format'])
      : 'SVG';

    const numFloors = customFloors || 4;
    const detectedScale = ext === 'DXF' ? 1.0 : 25.0; // pixels per meter

    // Synthetic room breakdown based on floorplan geometry
    const rooms = [
      { id: 'RM-101', name: 'Master Commercial Suite A', areaM2: 145, type: 'COMMERCIAL' as PropertyType, bounds: [0, 0, 12, 12] as [number, number, number, number] },
      { id: 'RM-102', name: 'Executive Suite B', areaM2: 120, type: 'COMMERCIAL' as PropertyType, bounds: [12, 0, 22, 12] as [number, number, number, number] },
      { id: 'RM-103', name: 'Conference & Presentation Hub', areaM2: 85, type: 'COMMON' as PropertyType, bounds: [0, 12, 10, 20] as [number, number, number, number] },
      { id: 'RM-104', name: 'Central Lift Core & Fire Stairwell', areaM2: 45, type: 'SERVICE' as PropertyType, bounds: [10, 12, 16, 20] as [number, number, number, number] },
      { id: 'RM-105', name: 'Common Corridor & Restrooms', areaM2: 55, type: 'COMMON' as PropertyType, bounds: [16, 12, 22, 20] as [number, number, number, number] },
    ];

    const walls = [
      { x1: 0, y1: 0, x2: 22, y2: 0, thickness: 0.25 },
      { x1: 22, y1: 0, x2: 22, y2: 20, thickness: 0.25 },
      { x1: 22, y1: 20, x2: 0, y2: 20, thickness: 0.25 },
      { x1: 0, y1: 20, x2: 0, y2: 0, thickness: 0.25 },
      { x1: 12, y1: 0, x2: 12, y2: 12, thickness: 0.2 },
      { x1: 0, y1: 12, x2: 22, y2: 12, thickness: 0.2 },
      { x1: 10, y1: 12, x2: 10, y2: 20, thickness: 0.2 },
      { x1: 16, y1: 12, x2: 16, y2: 20, thickness: 0.2 },
    ];

    const doors = [
      { x: 6, y: 12, width: 1.2 },
      { x: 17, y: 12, width: 1.2 },
      { x: 13, y: 12, width: 1.5 },
      { x: 11, y: 16, width: 1.1 },
    ];

    const windows = [
      { x: 4, y: 0, width: 2.4 },
      { x: 16, y: 0, width: 2.4 },
      { x: 22, y: 6, width: 2.0 },
      { x: 22, y: 16, width: 2.0 },
      { x: 4, y: 20, width: 2.4 },
    ];

    const totalAreaM2 = rooms.reduce((acc, r) => acc + r.areaM2, 0);

    return {
      blueprintId: `BP-${Math.floor(100 + Math.random() * 900)}`,
      filename: file.name,
      format: validFormat,
      detectedScale,
      detectedFloors: numFloors,
      confidence: ext === 'DXF' ? 0.98 : ext === 'SVG' ? 0.94 : 0.88,
      rooms,
      walls,
      doors,
      windows,
      totalAreaM2,
      status: 'PROCESSED',
    };
  }

  /**
   * Extrudes the 2D blueprint into full 3D Building volumetric model
   */
  public static extrudeTo3DBuilding(
    blueprint: BlueprintAnalysisResult,
    options: {
      buildingId?: string;
      name?: string;
      baseLandId?: string;
      parcelId?: string;
      floorHeight?: number;
      floorsCount?: number;
      hasBasement?: boolean;
      groundElevation?: number;
      localX?: number;
      localY?: number;
    }
  ): Building {
    const floorHeight = options.floorHeight || 3.4;
    const floorsCount = options.floorsCount || blueprint.detectedFloors || 4;
    const baseLandId = options.baseLandId || 'TN-CH-04-10299';
    const buildingId = options.buildingId || `B-EXT-${blueprint.blueprintId}`;
    const bName = options.name || `Custom Extrusion (${blueprint.filename})`;
    const parcelId = options.parcelId || 'P-099';
    const groundElevation = options.groundElevation || 12.0;

    const floors: FloorVolume[] = [];
    const basementCount = options.hasBasement ? 1 : 0;

    if (options.hasBasement) {
      const zMin = -3.5;
      const zMax = 0;
      const candidate = VerticalIdentifierComposer.compose({
        baseLandId,
        verticalPosition: 'BASEMENT',
        floorNumber: -1,
        unitId: 'B01',
        internalPropNumber: 9901,
      });

      floors.push({
        floorId: `${buildingId}-FL-B1`,
        floorNumber: -1,
        floorType: 'BASEMENT',
        zMin,
        zMax,
        height: 3.5,
        areaM2: blueprint.totalAreaM2,
        volumeM3: blueprint.totalAreaM2 * 3.5,
        units: [
          {
            unitId: 'B01',
            propertyVolumeId: candidate.internalPropertyId,
            name: 'Basement Subsurface Storage & Utility',
            propertyType: 'PARKING',
            areaM2: blueprint.totalAreaM2,
            floorNumber: -1,
            zMin,
            zMax,
            candidateIdentifier: candidate,
          },
        ],
        source: 'Blueprint Subsurface Profile',
        confidence: blueprint.confidence,
      });
    }

    for (let f = 0; f < floorsCount; f++) {
      const zMin = f * floorHeight;
      const zMax = (f + 1) * floorHeight;
      const fType = f === 0 ? 'GROUND' : 'FLOOR';

      const units: PropertyUnit[] = blueprint.rooms.map((room, idx) => {
        const uCode = `U0${idx + 1}`;
        const candidate = VerticalIdentifierComposer.compose({
          baseLandId,
          verticalPosition: fType,
          floorNumber: f,
          unitId: uCode,
          internalPropNumber: 9900 + f * 10 + idx,
        });

        return {
          unitId: `${buildingId}-F${f}-${room.id}`,
          propertyVolumeId: candidate.internalPropertyId,
          name: `Floor ${f} ${room.name}`,
          propertyType: room.type,
          areaM2: room.areaM2,
          floorNumber: f,
          zMin,
          zMax,
          candidateIdentifier: candidate,
        };
      });

      floors.push({
        floorId: `${buildingId}-FL-${f}`,
        floorNumber: f,
        floorType: fType,
        zMin,
        zMax,
        height: floorHeight,
        areaM2: blueprint.totalAreaM2,
        volumeM3: blueprint.totalAreaM2 * floorHeight,
        units,
        source: `Blueprint Extrusion (${blueprint.format})`,
        confidence: blueprint.confidence,
      });
    }

    const totalBuiltupAreaM2 = blueprint.totalAreaM2 * (floorsCount + basementCount);
    const totalVolumeM3 = totalBuiltupAreaM2 * floorHeight;
    const totalHeight = floorsCount * floorHeight;

    return {
      buildingId,
      name: bName,
      baseLandId,
      parcelId,
      floorsCount,
      basementCount,
      groundElevation,
      roofElevation: groundElevation + totalHeight,
      totalHeight,
      footprintAreaM2: blueprint.totalAreaM2,
      totalBuiltupAreaM2,
      totalVolumeM3,
      floors,
      propertyType: 'COMMERCIAL',
      coordinates: [80.245, 12.988],
      localX: options.localX || 150,
      localY: options.localY || 80,
      width: 22,
      depth: 20,
      provenance: {
        parcel: 'Cadastral Linkage',
        building: `Blueprint Extruded from ${blueprint.filename}`,
        floor: 'Vector Boundary Reconstruction',
        elevation: 'Survey Datum MSL',
        position: 'Registered Georeference',
        ownership: 'User / Authorized Submission',
        geometry: 'V3D Blueprint-to-3D Engine',
        confidence: blueprint.confidence,
        timestamp: new Date().toISOString(),
        modelVersion: 'Blueprint-PolyRecon-v1.4',
      },
    };
  }
}
