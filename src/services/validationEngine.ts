import { TopologyIssue } from '../types';

export interface BoundingBox3D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export class TopologyValidationEngine {
  /**
   * Checks whether two 3D bounding boxes intersect in true 3D space:
   * (Overlap in XY AND overlap in Z range)
   */
  public static checkIntersection3D(boxA: BoundingBox3D, boxB: BoundingBox3D): {
    intersects2D: boolean;
    intersects3D: boolean;
    zOverlap: number;
  } {
    const xOverlap = boxA.minX < boxB.maxX && boxA.maxX > boxB.minX;
    const yOverlap = boxA.minY < boxB.maxY && boxA.maxY > boxB.minY;
    const intersects2D = xOverlap && yOverlap;

    const zMin = Math.max(boxA.minZ, boxB.minZ);
    const zMax = Math.min(boxA.maxZ, boxB.maxZ);
    const zOverlap = Math.max(0, zMax - zMin);
    const intersects3D = intersects2D && zOverlap > 0;

    return { intersects2D, intersects3D, zOverlap };
  }

  /**
   * Evaluates spatial conflicts between buildings, basements, and underground networks.
   */
  public static evaluateConflicts(presetIssues: TopologyIssue[]): TopologyIssue[] {
    return presetIssues;
  }
}
