import { CandidateIdentifier, VerticalPosition } from '../types';

export class VerticalIdentifierComposer {
  /**
   * Encodes vertical position semantics into standard candidate codes.
   */
  public static getVerticalComponentCode(pos: VerticalPosition): string {
    switch (pos) {
      case 'GROUND':
        return 'G';
      case 'ABOVE':
      case 'FLOOR':
        return 'A';
      case 'BELOW':
      case 'BASEMENT':
      case 'UNDERGROUND':
      case 'PARKING':
        return 'B';
      case 'ROOF':
        return 'R';
      case 'UTILITY':
      case 'SERVICE':
        return 'U';
      case 'COMMON':
        return 'C';
      default:
        return 'A';
    }
  }

  /**
   * Composes a floor level code:
   * e.g. floor 0 -> "G00", floor 3 -> "F03", basement -1 -> "B01"
   */
  public static getLevelCode(floorNumber: number): string {
    if (floorNumber === 0) return 'G00';
    if (floorNumber > 0) return `F${floorNumber.toString().padStart(2, '0')}`;
    return `B${Math.abs(floorNumber).toString().padStart(2, '0')}`;
  }

  /**
   * Composes a candidate vertical identifier for a property unit.
   * NOTE: This is strictly a candidate prototype string and NOT an official government specification.
   */
  public static compose(params: {
    baseLandId: string;
    verticalPosition: VerticalPosition;
    floorNumber: number;
    unitId: string;
    internalPropNumber: number;
  }): CandidateIdentifier {
    const verticalCode = this.getVerticalComponentCode(params.verticalPosition);
    const levelCode = this.getLevelCode(params.floorNumber);
    const cleanUnit = params.unitId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const unitCode = cleanUnit.startsWith('U') ? cleanUnit : `U${cleanUnit.padStart(2, '0')}`;

    const candidateString = `${params.baseLandId}-${verticalCode}-${levelCode}-${unitCode}`;
    const internalPropertyId = `V3D-PROP-${params.internalPropNumber.toString().padStart(6, '0')}`;

    return {
      baseLandId: params.baseLandId,
      verticalComponent: verticalCode,
      levelCode,
      unitCode,
      candidateString,
      internalPropertyId,
      officialStatus: 'PENDING_GOVERNMENT_SPECIFICATION',
      composedAt: new Date().toISOString(),
      configVersion: 'V3D-2026.01-ALPHA',
    };
  }
}

export class ThreeDIdentifierService {
  public static generateCandidate(params: {
    baseLandId: string;
    verticalPosition: VerticalPosition;
    floorNumber: number;
    unitId: string;
    internalPropNumber?: number;
  }): CandidateIdentifier {
    return VerticalIdentifierComposer.compose({
      ...params,
      internalPropNumber: params.internalPropNumber ?? Math.floor(1000 + Math.random() * 9000),
    });
  }

  public static getOfficialSpecificationNotice(): string {
    return 'Official 3D ULPIN standard is currently pending specification from the Department of Land Resources (DoLR), Ministry of Rural Development, Government of India. This candidate identifier is computed for prototype vertical indexing.';
  }
}
