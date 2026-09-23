import { Building, LandParcel, PropertyUnit, FloorVolume } from '../types';
import { DEMO_PARCELS, DEMO_BUILDINGS } from '../data/demoCityData';
import { TAMIL_NADU_DISTRICTS } from '../data/tamilNaduRegions';
import { VerticalIdentifierComposer } from './identifierService';

export interface AreaCadastralData {
  parcels: LandParcel[];
  buildings: Building[];
  totalUnitsCount: number;
  allocatedCount: number;
}

const AREA_CACHE = new Map<string, AreaCadastralData>();

export class AreaDataGenerator {
  /**
   * Retrieves or dynamically generates dense building clusters and cadastral parcels
   * for any selected project area across Tamil Nadu.
   */
  public static getAreaCadastralData(districtId: string, areaId: string): AreaCadastralData {
    const cacheKey = `${districtId}_${areaId}`;
    if (AREA_CACHE.has(cacheKey)) {
      return AREA_CACHE.get(cacheKey)!;
    }

    // Default primary demo dataset for Taramani OMR
    if (areaId === 'taramani-omr') {
      const data: AreaCadastralData = {
        parcels: DEMO_PARCELS,
        buildings: DEMO_BUILDINGS,
        totalUnitsCount: DEMO_BUILDINGS.reduce((sum, b) => sum + b.floors.reduce((fsum, f) => fsum + f.units.length, 0), 0),
        allocatedCount: 18,
      };
      AREA_CACHE.set(cacheKey, data);
      return data;
    }

    // Find metadata for the chosen district and project area
    const district = TAMIL_NADU_DISTRICTS.find((d) => d.id === districtId) || TAMIL_NADU_DISTRICTS[0];
    let areaInfo = district.taluks.flatMap((t) => t.projectAreas).find((pa) => pa.id === areaId);
    if (!areaInfo) {
      // Fallback search across all districts
      for (const d of TAMIL_NADU_DISTRICTS) {
        const found = d.taluks.flatMap((t) => t.projectAreas).find((pa) => pa.id === areaId);
        if (found) {
          areaInfo = found;
          break;
        }
      }
    }

    if (!areaInfo) {
      areaInfo = district.taluks[0]?.projectAreas[0];
    }

    const bCount = areaInfo?.buildingsCount || 24;
    const pCount = Math.max(areaInfo?.parcelsCount || 36, bCount + 6);
    const centerLng = areaInfo?.center[0] || district.center[0];
    const centerLat = areaInfo?.center[1] || district.center[1];
    const distCode = district.code.replace('TN-', '');

    const parcels: LandParcel[] = [];
    const buildings: Building[] = [];

    const cols = 6;
    const rows = Math.ceil(pCount / cols);
    const cellW = 44;
    const cellD = 44;
    const streetW = 12;

    let pIdx = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (pIdx > pCount) break;

        const localX = (c - cols / 2) * (cellW + streetW);
        const localY = (r - rows / 2) * (cellD + streetW);
        const pId = `P-${pIdx.toString().padStart(3, '0')}`;
        const baseLandId = `TN-${distCode}-01-${(20000 + pIdx).toString()}`;
        const surveyNo = `${210 + Math.floor(pIdx / 4)}/${(pIdx % 4) + 1}`;

        const zone =
          c === 2 || c === 3
            ? 'Transit Commercial Hub'
            : r < 2
            ? 'High-Density Commercial SEZ'
            : 'Urban Residential & Mixed Retail';

        const halfW = cellW / 2 - 2;
        const halfD = cellD / 2 - 2;

        const parcel: LandParcel = {
          parcelId: pId,
          baseLandId,
          surveyNumber: surveyNo,
          subDivision: `${(pIdx % 3) + 1}B`,
          district: district.name,
          taluk: district.taluks[0]?.name || 'Central Taluk',
          village: areaInfo?.name.split(' ')[0] || 'Urban Ward',
          projectArea: areaInfo?.name || 'Urban Sector',
          areaM2: Math.round(cellW * cellD),
          groundElevationMsl: 18.5 + (r * 0.3 - c * 0.2),
          boundaryCoordinates: [
            [centerLng + localX * 0.000009, centerLat + localY * 0.000009],
            [centerLng + (localX + cellW) * 0.000009, centerLat + localY * 0.000009],
            [centerLng + (localX + cellW) * 0.000009, centerLat + (localY + cellD) * 0.000009],
            [centerLng + localX * 0.000009, centerLat + (localY + cellD) * 0.000009],
          ],
          localPolygon: [
            [-halfW, -halfD],
            [halfW, -halfD],
            [halfW, halfD],
            [-halfW, halfD],
          ],
          fsiAllowed: zone.includes('Commercial') ? 3.0 : 2.5,
          fsiConsumed: Number((1.6 + (pIdx % 8) * 0.15).toFixed(2)),
          zone,
          isSynthetic: true,
          provenance: {
            parcel: `${district.name} Cadastral Directorate (AI Synthetic)`,
            building: 'GIS Building Footprints & LiDAR Extrusion',
            floor: 'Municipal Architectural Vector Record',
            elevation: 'CartoDEM Elevation Model',
            position: 'DGPS Survey Network',
            ownership: 'TN Registration Department (Synthesized)',
            geometry: 'Vector Extrusion Engine v2.4',
            confidence: 0.92,
            timestamp: new Date().toISOString(),
          },
        };
        parcels.push(parcel);

        // Create building if within bCount
        if (pIdx <= bCount) {
          const bId = `B-${pIdx.toString().padStart(3, '0')}`;
          const floorsCount = 3 + (pIdx % 6); // 3 to 8 floors
          const hasBasement = pIdx % 3 !== 0;
          const basementCount = hasBasement ? (pIdx % 2 === 0 ? 2 : 1) : 0;
          const floorHeight = 3.4;
          const bWidth = cellW * 0.72;
          const bDepth = cellD * 0.72;
          const footprintAreaM2 = Math.round(bWidth * bDepth);
          const totalHeight = floorsCount * floorHeight;

          const buildingName =
            pIdx === 1
              ? `${district.name} Apex Plaza`
              : pIdx === 2
              ? `${areaInfo?.name.split(' ')[0]} Commercial Hub`
              : pIdx === 3
              ? `Heritage Skyline Towers`
              : `Urban Block ${bId} (${district.name})`;

          const isInitiallyAllocated = pIdx <= (areaInfo?.defaultAllocatedCount || 6);

          const floors: FloorVolume[] = [];

          // Basements
          for (let b = basementCount; b >= 1; b--) {
            const fNum = -b;
            const zMin = -b * 3.5;
            const zMax = -(b - 1) * 3.5;
            const uId = `B${b.toString().padStart(2, '0')}`;
            const internalPropNum = pIdx * 100 + b;
            const candidateId = VerticalIdentifierComposer.compose({
              baseLandId,
              verticalPosition: 'BASEMENT',
              floorNumber: fNum,
              unitId: uId,
              internalPropNumber: internalPropNum,
            });

            const units: PropertyUnit[] = [
              {
                unitId: `${bId}-FL-B${b}`,
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
              floorType: 'BASEMENT',
              zMin,
              zMax,
              height: 3.5,
              areaM2: footprintAreaM2,
              volumeM3: footprintAreaM2 * 3.5,
              units,
              source: 'Architectural Blueprint Basement Extrusion',
              confidence: 0.94,
            });
          }

          // Ground and Above Floors
          for (let f = 0; f <= floorsCount; f++) {
            const isGround = f === 0;
            const zMin = f * floorHeight;
            const zMax = (f + 1) * floorHeight;
            const fType = isGround ? 'GROUND' : 'FLOOR';
            const propType = isGround ? 'COMMERCIAL' : zone.includes('Commercial') ? 'COMMERCIAL' : 'RESIDENTIAL';

            const units: PropertyUnit[] = [];
            const unitsPerFloor = 2;
            const unitArea = Math.round(footprintAreaM2 / unitsPerFloor);

            for (let u = 1; u <= unitsPerFloor; u++) {
              const uCode = `U0${u}`;
              const internalPropNum = pIdx * 1000 + f * 10 + u;
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
              confidence: 0.92,
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
            propertyType: zone.includes('Commercial') ? 'COMMERCIAL' : 'RESIDENTIAL',
            coordinates: [centerLng + localX * 0.000009, centerLat + localY * 0.000009],
            localX,
            localY,
            width: bWidth,
            depth: bDepth,
            provenance: parcel.provenance,
            isUlpinAllocated: isInitiallyAllocated,
            ulpinAllocatedAt: isInitiallyAllocated ? '2026-03-10T14:20:00Z' : undefined,
            ulpinCertificateHash: isInitiallyAllocated
              ? `SHA256-${distCode.toLowerCase()}-${bId.toLowerCase()}-${Math.floor(100000 + Math.random() * 900000)}`
              : undefined,
            totalUnitsCount: floors.reduce((sum, fl) => sum + fl.units.length, 0),
            projectAreaId: areaId,
          };

          buildings.push(building);
        }

        pIdx++;
      }
    }

    const totalUnitsCount = buildings.reduce((sum, b) => sum + (b.totalUnitsCount || 0), 0);
    const allocatedCount = buildings.filter((b) => b.isUlpinAllocated).length;

    const result: AreaCadastralData = {
      parcels,
      buildings,
      totalUnitsCount,
      allocatedCount,
    };

    AREA_CACHE.set(cacheKey, result);
    return result;
  }
}
