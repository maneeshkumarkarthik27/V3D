import { Building, LandParcel, OwnershipRecord, PropertyUnit, TaxAssessment, PolicyRule } from '../types';

export class ExportService {
  /**
   * Generates a downloadable JSON Property Dossier
   */
  public static generateJSONDossier(data: {
    parcel: LandParcel;
    building?: Building;
    unit?: PropertyUnit;
    ownership?: OwnershipRecord;
    tax?: TaxAssessment;
    policies?: PolicyRule[];
  }): string {
    const payload = {
      system: 'V3D — Tamil Nadu Volumetric 3D Property & Infrastructure Digital Twin',
      standardReference: 'SIH26011 - 3D ULPIN Generation & Vertical Property Mapping System',
      notice: 'Candidate Vertical Identifier is for prototype indexing. Official 3D ULPIN standard is pending government specification.',
      generatedAt: new Date().toISOString(),
      identifiers: {
        candidateVerticalIdentifier: data.unit?.candidateIdentifier.candidateString || 'N/A',
        internalPropertyId: data.unit?.candidateIdentifier.internalPropertyId || data.building?.buildingId || data.parcel.parcelId,
        baseLandId: data.parcel.baseLandId,
        surveyNumber: data.parcel.surveyNumber,
        officialStatus: 'PENDING_GOVERNMENT_SPECIFICATION',
      },
      spatialDetails: {
        district: data.parcel.district,
        taluk: data.parcel.taluk,
        village: data.parcel.village,
        projectArea: data.parcel.projectArea,
        parcelAreaM2: data.parcel.areaM2,
        zone: data.parcel.zone,
        fsiAllowed: data.parcel.fsiAllowed,
        fsiConsumed: data.parcel.fsiConsumed,
        building: data.building
          ? {
              buildingId: data.building.buildingId,
              name: data.building.name,
              totalFloors: data.building.floorsCount,
              basements: data.building.basementCount,
              groundElevationMsl: data.building.groundElevation,
              roofElevationMsl: data.building.roofElevation,
              totalHeightM: data.building.totalHeight,
              footprintAreaM2: data.building.footprintAreaM2,
            }
          : null,
        propertyUnit: data.unit
          ? {
              unitId: data.unit.unitId,
              name: data.unit.name,
              floorNumber: data.unit.floorNumber,
              zMin: data.unit.zMin,
              zMax: data.unit.zMax,
              unitAreaM2: data.unit.areaM2,
              propertyType: data.unit.propertyType,
            }
          : null,
      },
      ownership: data.ownership || {
        status: 'Unassigned or Public Domain',
      },
      taxAssessment: data.tax || null,
      applicablePolicies: data.policies || [],
      provenance: data.unit ? data.parcel.provenance : data.parcel.provenance,
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * Generates CSV report
   */
  public static generateCSV(data: {
    parcel: LandParcel;
    building?: Building;
    unit?: PropertyUnit;
    ownership?: OwnershipRecord;
    tax?: TaxAssessment;
  }): string {
    const headers = [
      'Base Land ID',
      'Candidate 3D Identifier',
      'Internal Property ID',
      'Survey Number',
      'District',
      'Taluk',
      'Floor Number',
      'Vertical Position',
      'Z-Min (m)',
      'Z-Max (m)',
      'Area (sqm)',
      'Property Type',
      'Owner Name',
      'Tenure',
      'Tax Status',
      'Est Annual Tax (INR)',
    ];

    const values = [
      data.parcel.baseLandId,
      data.unit?.candidateIdentifier.candidateString || 'N/A',
      data.unit?.candidateIdentifier.internalPropertyId || data.parcel.parcelId,
      data.parcel.surveyNumber,
      data.parcel.district,
      data.parcel.taluk,
      data.unit?.floorNumber?.toString() || '0',
      data.unit?.candidateIdentifier.verticalComponent || 'G',
      data.unit?.zMin?.toString() || '0.0',
      data.unit?.zMax?.toString() || '3.5',
      data.unit?.areaM2?.toString() || data.parcel.areaM2.toString(),
      data.unit?.propertyType || data.parcel.zone,
      data.ownership?.ownerName || 'Demo Owner',
      data.ownership?.tenure || 'Freehold',
      data.tax?.taxStatus || 'PAID',
      data.tax?.estimatedAnnualTax?.toString() || '0',
    ];

    return `${headers.join(',')}\n${values.map((v) => `"${v}"`).join(',')}`;
  }

  /**
   * Generates and downloads a complete 3D Cadastral Ledger CSV for an urban area
   */
  public static export3DCadastreCSV(buildings: Building[], parcels: LandParcel[]) {
    const headers = [
      'Building ID',
      'Building Name',
      'Base Land ULPIN',
      'Survey Number',
      'Levels (G+F)',
      'Basements',
      'Total Height (m)',
      'Ground MSL (m)',
      'Total Units',
      '3D ULPIN Status',
      'Allocated Date',
      'Certificate Hash',
    ];

    const rows = buildings.map((b) => {
      const parcel = parcels.find((p) => p.parcelId === b.parcelId);
      const unitsCount = b.floors.reduce((sum, f) => sum + f.units.length, 0);
      return [
        b.buildingId,
        b.name,
        b.baseLandId,
        parcel?.surveyNumber || '104/1',
        `G+${b.floorsCount}`,
        b.basementCount.toString(),
        b.totalHeight.toFixed(1),
        b.groundElevation.toFixed(1),
        unitsCount.toString(),
        b.isUlpinAllocated ? 'ALLOCATED' : 'PENDING',
        b.ulpinAllocatedAt || 'N/A',
        b.ulpinCertificateHash || 'N/A',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    ExportService.downloadFile(
      `TamilNadu_3D_Cadastral_Ledger_${new Date().toISOString().slice(0, 10)}.csv`,
      csvContent,
      'text/csv'
    );
  }

  /**
   * Triggers browser download of a text/file blob
   */
  public static downloadFile(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
