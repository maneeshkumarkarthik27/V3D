import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { TAMIL_NADU_DISTRICTS } from './src/data/tamilNaduRegions';
import {
  DEMO_PARCELS,
  DEMO_BUILDINGS,
  DEMO_METRO_STATION,
  DEMO_METRO_TUNNEL,
  DEMO_UTILITIES,
  DEMO_TOPOLOGY_ISSUES,
  DEMO_OWNERSHIP,
} from './src/data/demoCityData';
import { ThreeDIdentifierService } from './src/services/identifierService';
import { TaxRuleEngine } from './src/services/taxEngine';
import { PolicyEngine } from './src/services/policyEngine';
import { BlueprintService } from './src/services/blueprintService';
import { ExportService } from './src/services/exportService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory dynamic additions (e.g. newly extruded buildings from blueprints)
  const customBuildings = [...DEMO_BUILDINGS];

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'V3D Tamil Nadu Digital Twin Backend',
      version: '1.0.0-hackathon',
      crs: 'EPSG:32644 (UTM Zone 44N) / WGS84',
      timestamp: new Date().toISOString(),
    });
  });

  // Tamil Nadu Regions & Hierarchy
  app.get('/api/map/tamil-nadu', (req, res) => {
    res.json({
      state: 'Tamil Nadu',
      code: 'TN',
      districtsCount: TAMIL_NADU_DISTRICTS.length,
      districts: TAMIL_NADU_DISTRICTS,
    });
  });

  // Parcels
  app.get('/api/parcels', (req, res) => {
    const { district, projectArea } = req.query;
    let results = DEMO_PARCELS;
    if (district) {
      results = results.filter((p) => p.district.toLowerCase() === String(district).toLowerCase());
    }
    if (projectArea) {
      results = results.filter((p) => p.projectArea.toLowerCase().includes(String(projectArea).toLowerCase()));
    }
    res.json({
      count: results.length,
      parcels: results,
      crs: 'EPSG:32644 (Projected Metric) & EPSG:4326',
    });
  });

  app.get('/api/parcels/:id', (req, res) => {
    const parcel = DEMO_PARCELS.find((p) => p.parcelId === req.params.id || p.baseLandId === req.params.id);
    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }
    const building = customBuildings.find((b) => b.parcelId === parcel.parcelId);
    res.json({ parcel, building: building || null });
  });

  // Buildings
  app.get('/api/buildings', (req, res) => {
    res.json({
      count: customBuildings.length,
      buildings: customBuildings,
    });
  });

  app.get('/api/buildings/:id', (req, res) => {
    const building = customBuildings.find((b) => b.buildingId === req.params.id);
    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }
    res.json(building);
  });

  app.get('/api/buildings/:id/floors', (req, res) => {
    const building = customBuildings.find((b) => b.buildingId === req.params.id);
    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }
    res.json({
      buildingId: building.buildingId,
      name: building.name,
      floorsCount: building.floors.length,
      floors: building.floors,
    });
  });

  // Properties / Units
  app.get('/api/properties/:id', (req, res) => {
    const targetId = req.params.id;
    let foundUnit = null;
    let parentBuilding = null;
    let parentParcel = null;

    for (const b of customBuildings) {
      for (const fl of b.floors) {
        for (const u of fl.units) {
          if (
            u.propertyVolumeId === targetId ||
            u.unitId === targetId ||
            u.candidateIdentifier.candidateString === targetId
          ) {
            foundUnit = u;
            parentBuilding = b;
            parentParcel = DEMO_PARCELS.find((p) => p.parcelId === b.parcelId) || null;
            break;
          }
        }
        if (foundUnit) break;
      }
      if (foundUnit) break;
    }

    if (!foundUnit) {
      return res.status(404).json({ error: 'Property volume not found' });
    }

    const ownership = DEMO_OWNERSHIP[foundUnit.propertyVolumeId] || null;
    const tax = TaxRuleEngine.calculateAssessment({
      propertyId: foundUnit.propertyVolumeId,
      propertyType: foundUnit.propertyType,
      builtUpAreaM2: foundUnit.areaM2,
      floorNumber: foundUnit.floorNumber,
      zone: parentParcel?.zone || 'Commercial',
    });

    const policies = PolicyEngine.getPoliciesForProperty({
      propertyType: foundUnit.propertyType,
      heightMeters: parentBuilding?.totalHeight || 20,
      floorsCount: parentBuilding?.floorsCount || 4,
      zone: parentParcel?.zone || 'Commercial',
      hasBasement: (parentBuilding?.basementCount || 0) > 0,
      proximityToMetroMeters: 14,
    });

    res.json({
      propertyUnit: foundUnit,
      parentBuilding,
      parentParcel,
      ownership,
      taxAssessment: tax,
      applicablePolicies: policies,
    });
  });

  // Infrastructure & Underground
  app.get('/api/infrastructure', (req, res) => {
    res.json({
      metroTunnel: DEMO_METRO_TUNNEL,
      metroStation: DEMO_METRO_STATION,
      utilities: DEMO_UTILITIES,
    });
  });

  app.get('/api/infrastructure/:id', (req, res) => {
    const utility = DEMO_UTILITIES.find((u) => u.infrastructureId === req.params.id);
    if (utility) return res.json(utility);
    if (req.params.id === DEMO_METRO_STATION.stationId) return res.json(DEMO_METRO_STATION);
    if (req.params.id === DEMO_METRO_TUNNEL.tunnelId) return res.json(DEMO_METRO_TUNNEL);
    res.status(404).json({ error: 'Infrastructure component not found' });
  });

  app.get('/api/underground', (req, res) => {
    res.json({
      depthLayers: [
        { name: 'Surface Soil & Telecom Ducts', zMin: -2.0, zMax: 0, items: ['OPTIC-FIBER-TELCO'] },
        { name: 'Electrical 33kV Conduits', zMin: -3.0, zMax: -2.0, items: ['TANGEDCO-ELEC-33KV'] },
        { name: 'Water Transmission Trunk Mains', zMin: -5.0, zMax: -4.0, items: ['CMWSSB-WATER-MAIN-01'] },
        { name: 'Subsurface Basements (Level -1 & -2)', zMin: -7.5, zMax: -3.5, items: ['Building Basements'] },
        { name: 'Deep Gravity Sewer Mains', zMin: -9.0, zMax: -7.5, items: ['CMWSSB-SEWER-TRUNK-01'] },
        { name: 'Chennai Metro Rapid Rail Tunnels', zMin: -20.0, zMax: -14.0, items: ['CMRL-LINE4-TUNNEL-NORTH'] },
      ],
      metro: DEMO_METRO_TUNNEL,
      station: DEMO_METRO_STATION,
      utilities: DEMO_UTILITIES,
    });
  });

  // Tax and Policy
  app.get('/api/tax/:property_id', (req, res) => {
    const propId = req.params.property_id;
    const assessment = TaxRuleEngine.calculateAssessment({
      propertyId: propId,
      propertyType: 'COMMERCIAL',
      builtUpAreaM2: 240,
      floorNumber: 3,
      zone: 'Transit Oriented Commercial',
    });
    res.json(assessment);
  });

  app.get('/api/policies/:property_id', (req, res) => {
    const policies = PolicyEngine.getPoliciesForProperty({
      propertyType: 'COMMERCIAL',
      heightMeters: 28,
      floorsCount: 7,
      zone: 'Transit Oriented Commercial',
      hasBasement: true,
      proximityToMetroMeters: 12,
    });
    res.json({ count: policies.length, policies });
  });

  // Identifier Candidate Service
  app.post('/api/identifier/candidate', (req, res) => {
    const { baseLandId, verticalPosition, floorNumber, unitId } = req.body;
    if (!baseLandId || verticalPosition === undefined || floorNumber === undefined || !unitId) {
      return res.status(400).json({ error: 'Missing required identifier parameters' });
    }
    const candidate = ThreeDIdentifierService.generateCandidate({
      baseLandId,
      verticalPosition,
      floorNumber: Number(floorNumber),
      unitId,
    });
    res.json({
      candidate,
      notice: ThreeDIdentifierService.getOfficialSpecificationNotice(),
    });
  });

  app.get('/api/identifier/status', (req, res) => {
    res.json({
      official3DULPINStatus: 'PENDING_GOVERNMENT_SPECIFICATION',
      standardAgency: 'DoLR / Survey of India / Ministry of Rural Development',
      candidateEngineVersion: 'V3D-2026.01-ALPHA',
      supportedVerticalSemantics: [
        'GROUND',
        'ABOVE',
        'BELOW',
        'BASEMENT',
        'UNDERGROUND',
        'FLOOR',
        'ROOF',
        'PARKING',
        'UTILITY',
        'COMMON',
        'SERVICE',
      ],
    });
  });

  // Topology Validation
  app.get('/api/validation/issues', (req, res) => {
    res.json({
      count: DEMO_TOPOLOGY_ISSUES.length,
      issues: DEMO_TOPOLOGY_ISSUES,
      ruleEngine: 'V3D 3D Spatial Topology Validator v1.2',
    });
  });

  app.post('/api/validate', (req, res) => {
    res.json({
      validatedAt: new Date().toISOString(),
      issuesFound: DEMO_TOPOLOGY_ISSUES.length,
      issues: DEMO_TOPOLOGY_ISSUES,
      isClean: false,
    });
  });

  // Demo City Complete Package
  app.get('/api/demo-city', (req, res) => {
    res.json({
      projectName: 'Taramani OMR Tech & Metro Hub, Chennai',
      state: 'Tamil Nadu',
      crs: 'EPSG:32644 (UTM Zone 44N)',
      parcelsCount: DEMO_PARCELS.length,
      buildingsCount: customBuildings.length,
      metroConnected: true,
      hasUndergroundInfrastructure: true,
      conflictsCount: DEMO_TOPOLOGY_ISSUES.length,
      parcels: DEMO_PARCELS,
      buildings: customBuildings,
      metroStation: DEMO_METRO_STATION,
      metroTunnel: DEMO_METRO_TUNNEL,
      utilities: DEMO_UTILITIES,
      conflicts: DEMO_TOPOLOGY_ISSUES,
    });
  });

  app.get('/api/demo-city/conflicts', (req, res) => {
    res.json(DEMO_TOPOLOGY_ISSUES);
  });

  // Blueprint Upload & 3D Extrusion Endpoints
  app.post('/api/blueprint/upload', (req, res) => {
    const { filename, format } = req.body || { filename: 'sample_floorplan.svg', format: 'SVG' };
    const analysis = BlueprintService.analyzeBlueprint({
      name: filename || 'architectural_floorplan.svg',
      size: 1024 * 450,
      type: 'image/svg+xml',
    });
    res.json(analysis);
  });

  app.post('/api/blueprint/generate-3d', (req, res) => {
    const { blueprint, options } = req.body;
    if (!blueprint) {
      return res.status(400).json({ error: 'Blueprint analysis payload required' });
    }
    const building = BlueprintService.extrudeTo3DBuilding(blueprint, options || {});
    customBuildings.push(building);
    res.json({
      success: true,
      buildingId: building.buildingId,
      name: building.name,
      floors: building.floorsCount,
      totalBuiltupAreaM2: building.totalBuiltupAreaM2,
      totalVolumeM3: building.totalVolumeM3,
      building,
    });
  });

  // Reports and Export
  app.get('/api/export/:property_id', (req, res) => {
    const propId = req.params.property_id;
    const parcel = DEMO_PARCELS[6] || DEMO_PARCELS[0];
    const building = customBuildings.find((b) => b.parcelId === parcel.parcelId);
    const unit = building?.floors[2]?.units[1];
    const jsonReport = ExportService.generateJSONDossier({
      parcel,
      building,
      unit,
      ownership: DEMO_OWNERSHIP[propId],
      tax: TaxRuleEngine.calculateAssessment({
        propertyId: propId,
        propertyType: 'COMMERCIAL',
        builtUpAreaM2: 180,
        floorNumber: 3,
        zone: parcel.zone,
      }),
      policies: PolicyEngine.getPoliciesForProperty({
        propertyType: 'COMMERCIAL',
        heightMeters: 24,
        floorsCount: 6,
        zone: parcel.zone,
        hasBasement: true,
      }),
    });
    res.header('Content-Type', 'application/json');
    res.attachment(`V3D_Property_Dossier_${propId}.json`);
    res.send(jsonReport);
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`V3D Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
