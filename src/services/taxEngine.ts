import { PropertyType, TaxAssessment } from '../types';

export class TaxRuleEngine {
  /**
   * Computes an estimated prototype property tax based on Tamil Nadu Urban Local Body guidelines.
   * NOTE: This is strictly an algorithmic estimate for hackathon demonstration.
   */
  public static calculateAssessment(params: {
    propertyId: string;
    propertyType: PropertyType;
    builtUpAreaM2: number;
    floorNumber: number;
    zone: string;
  }): TaxAssessment {
    let baseRate = 85; // INR per m2 per annum base
    let zoneMultiplier = 1.0;

    if (params.zone.includes('IT Corridor') || params.zone.includes('Commercial')) {
      zoneMultiplier = 1.65;
    } else if (params.zone.includes('Industrial')) {
      zoneMultiplier = 1.35;
    } else {
      zoneMultiplier = 1.1;
    }

    let typeMultiplier = 1.0;
    switch (params.propertyType) {
      case 'COMMERCIAL':
        typeMultiplier = 2.4;
        break;
      case 'INDUSTRIAL':
        typeMultiplier = 1.8;
        break;
      case 'RESIDENTIAL':
        typeMultiplier = 1.0;
        break;
      case 'GOVERNMENT':
      case 'INSTITUTIONAL':
        typeMultiplier = 0.5;
        break;
      case 'PARKING':
      case 'UTILITY':
      case 'COMMON':
        typeMultiplier = 0.25;
        break;
      default:
        typeMultiplier = 1.2;
    }

    // Floors higher up or basements have standard depreciation/variation
    let floorMultiplier = 1.0;
    if (params.floorNumber < 0) {
      floorMultiplier = 0.7; // basement utility discount
    } else if (params.floorNumber > 4) {
      floorMultiplier = 1.08; // high-rise services
    }

    const estimatedAnnualTax = Math.round(
      params.builtUpAreaM2 * baseRate * zoneMultiplier * typeMultiplier * floorMultiplier
    );

    return {
      propertyId: params.propertyId,
      assessmentCategory: `${params.propertyType} - Grade A`,
      taxPeriod: '2025-2026 (FY H1/H2)',
      taxStatus: 'PAID',
      builtUpAreaM2: params.builtUpAreaM2,
      baseRatePerM2: baseRate,
      zoneMultiplier,
      floorMultiplier,
      estimatedAnnualTax,
      outstandingAmount: 0,
      isPrototypeEstimate: true,
      formulaNote: 'Est = Area (m²) × Base Rate (₹85/m²) × Zone Coeff × Property Usage Coeff × Vertical Level Coeff',
    };
  }
}
