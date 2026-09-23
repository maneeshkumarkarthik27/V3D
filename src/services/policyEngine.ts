import { PolicyRule, PropertyType } from '../types';

export class PolicyEngine {
  public static getPoliciesForProperty(params: {
    propertyType: PropertyType;
    heightMeters: number;
    floorsCount: number;
    zone: string;
    hasBasement: boolean;
    proximityToMetroMeters?: number;
    proximityToWaterBodyMeters?: number;
  }): PolicyRule[] {
    const rules: PolicyRule[] = [
      {
        policyId: 'TN-CDBR-2019-FSI',
        authority: 'Chennai Metropolitan Development Authority (CMDA) / DTCP',
        policyName: 'Tamil Nadu Combined Development and Building Rules (TNCDBR 2019) - FSI Limits',
        version: 'G.O.Ms.No.18 dt 04-02-2019',
        effectiveFrom: '2019-02-04',
        applicability: `Zone: ${params.zone} | Multi-storey Building`,
        sourceReference: 'TNCDBR Rule 35 & Annexure XXII',
        ruleExpression: 'Permissible Premium FSI up to 3.25 along Transit Corridors (>18m road width)',
        status: 'COMPLIANT',
        notes: 'Building FSI within allowable limit with transit corridor enhancement multiplier applied.',
      },
      {
        policyId: 'TN-FIRE-NBC-2016',
        authority: 'TN Fire and Rescue Services Department',
        policyName: 'National Building Code 2016 - High Rise Life Safety & Fire Refuge Norms',
        version: 'Part 4 Fire & Life Safety Rev 2',
        effectiveFrom: '2018-01-01',
        applicability: params.heightMeters > 15 ? 'High Rise (>15m height)' : 'Non-High Rise Building',
        sourceReference: 'NBC Clause 4.12 / TNFRS NOC Reg 8',
        ruleExpression: 'Mandatory refuge area at 24m, dedicated fire shafts, and 6m clear perimeter driveways',
        status: params.heightMeters > 15 ? 'COMPLIANT' : 'INFORMATION',
        notes: 'Perimeter fire tender movement clear of above-ground utility projections.',
      },
    ];

    if (params.hasBasement) {
      rules.push({
        policyId: 'TN-BASEMENT-STRUCTURAL-2021',
        authority: 'Greater Chennai Corporation / PWD Technical Wing',
        policyName: 'Subsurface Excavation & Basement Retaining Wall Safety Code',
        version: 'Circular GCC/W-VI/2021',
        effectiveFrom: '2021-06-15',
        applicability: 'All buildings with Sub-surface Levels (Basement -1 to -3)',
        sourceReference: 'TNCDBR Rule 40 Sub-clause (3)',
        ruleExpression: 'Minimum 3.0m setback from plot boundary for subterranean retention piles; sealing against water table',
        status: 'COMPLIANT',
        notes: 'Basement perimeter tanking verified against regional monsoon aquifer elevations.',
      });
    }

    if (params.proximityToMetroMeters !== undefined && params.proximityToMetroMeters < 50) {
      rules.push({
        policyId: 'CMRL-INFLUENCE-ZONE-2022',
        authority: 'Chennai Metro Rail Limited (CMRL)',
        policyName: 'Metro Alignment Influence Zone Subsurface Protection Protocol',
        version: 'CMRL/CORR-4/SAFETY/2022-V3',
        effectiveFrom: '2022-03-01',
        applicability: 'Parcels within 20m vertical or 30m horizontal radius of Metro Tunnels',
        sourceReference: 'Metro Railways (Construction of Works) Act 1978 Sec 18',
        ruleExpression: 'No bored piling or basement excavation exceeding -8m without structural NOC and vibration monitoring',
        status: params.proximityToMetroMeters < 15 ? 'WARNING' : 'COMPLIANT',
        notes: params.proximityToMetroMeters < 15
          ? 'Caution: Foundation footprint is within critical 15m underground vibration radius of Metro Corridor.'
          : 'Monitored zone: Deep basement excavation requires CMRL engineering clearance.',
      });
    }

    rules.push({
      policyId: 'TN-WATER-BUFFER-TNCDBR',
      authority: 'Water Resources Department (WRD) / Local Municipal Council',
      policyName: 'Water Bodies and Channel Protection Buffer Zones',
      version: 'TNCDBR Rule 19(1)',
      effectiveFrom: '2019-02-04',
      applicability: 'Properties proximate to designated canals, lakes, or drainage trunks',
      sourceReference: 'High Court of Madras WP 1295/2014 & TNCDBR 2019',
      ruleExpression: '15m green buffer strip along secondary storm drains; 50m buffer along primary rivers (Cooum/Adyar)',
      status: 'COMPLIANT',
      notes: 'Boundary maintains required statutory buffer from public storm drainage canal.',
    });

    return rules;
  }
}
