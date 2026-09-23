import React, { useState } from 'react';
import { useV3D } from '../../state/useV3DStore';
import { TaxRuleEngine } from '../../services/taxEngine';
import { PolicyEngine } from '../../services/policyEngine';
import { ExportService } from '../../services/exportService';
import { PolicyRule } from '../../types';
import { UlpinCertificateModal } from '../map/UlpinCertificateModal';
import {
  Building as BuildingIcon,
  Download,
  Eye,
  Layers,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Sliders,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Award,
  Zap,
} from 'lucide-react';

export const PropertyDetailPanel: React.FC = () => {
  const {
    selectedBuildingId,
    setSelectedBuildingId,
    selectedFloorNumber,
    setSelectedFloorNumber,
    selectedParcelId,
    parcels,
    buildings,
    ownership,
    conflicts,
    explodeFloorsValue,
    setExplodeFloorsValue,
    sectionPlaneActive,
    setSectionPlaneActive,
    setFocusTarget,
    isRealDataMode,
    allocate3DUlpinForBuilding,
    theme,
  } = useV3D();

  const isDark = theme === 'dark';

  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<'spatial' | 'ownership' | 'tax' | 'policies' | 'provenance'>('spatial');
  const [showCertModal, setShowCertModal] = useState(false);

  // Find active entities
  const building = buildings.find((b) => b.buildingId === selectedBuildingId) || buildings[0];
  const parcel = parcels.find((p) => p.parcelId === (building?.parcelId || selectedParcelId)) || parcels[0];
  const floor =
    building?.floors.find((f) => f.floorNumber === selectedFloorNumber) ||
    building?.floors[building.floors.length - 1] ||
    building?.floors[0];
  const unit = floor?.units[0];

  const ownerRecord = unit ? ownership[unit.propertyVolumeId] : null;

  const taxAssessment = unit
    ? TaxRuleEngine.calculateAssessment({
        propertyId: unit.propertyVolumeId,
        propertyType: unit.propertyType,
        builtUpAreaM2: unit.areaM2,
        zone: parcel.zone,
        floorNumber: floor.floorNumber,
      })
    : null;

  const policies: PolicyRule[] = unit
    ? PolicyEngine.getPoliciesForProperty({
        propertyType: unit.propertyType,
        heightMeters: building.totalHeight,
        floorsCount: building.floorsCount,
        zone: parcel.zone,
        hasBasement: building.basementCount > 0,
      })
    : [];

  const buildingClashes = conflicts.filter(
    (c) => c.objectA === building.buildingId || c.objectB === building.buildingId
  );

  const handleCopyCandidateId = () => {
    if (unit?.candidateIdentifier?.candidateString) {
      navigator.clipboard?.writeText(unit.candidateIdentifier.candidateString);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleDownloadDossier = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const json = ExportService.generateJSONDossier({
        parcel,
        building,
        unit,
        ownership: ownerRecord || undefined,
        tax: taxAssessment || undefined,
        policies,
      });
      ExportService.downloadFile(
        `V3D_Property_${unit?.candidateIdentifier.internalPropertyId || parcel.parcelId}.json`,
        json,
        'application/json'
      );
    } else {
      const csv = ExportService.generateCSV({
        parcel,
        building,
        unit,
        ownership: ownerRecord || undefined,
        tax: taxAssessment || undefined,
      });
      ExportService.downloadFile(
        `V3D_Property_${unit?.candidateIdentifier.internalPropertyId || parcel.parcelId}.csv`,
        csv,
        'text/csv'
      );
    }
  };

  const handleFocusCamera = () => {
    setFocusTarget([building.localX + building.width / 2, 0, building.localY + building.depth / 2]);
  };

  return (
    <div
      className={`w-80 h-full border-l flex flex-col select-none overflow-hidden z-10 font-mono transition-colors ${
        isDark ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
      }`}
    >
      {/* Panel Header */}
      <div
        className={`p-3 border-b flex items-center justify-between transition-colors ${
          isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <BuildingIcon className="w-4 h-4 text-sky-600" />
          <span className="font-semibold text-xs tracking-wide uppercase">
            Property Digital Twin
          </span>
        </div>
        <button
          onClick={handleFocusCamera}
          title="Center Camera on Building"
          className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors border ${
            isDark
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
          }`}
        >
          <Eye className="w-3 h-3 text-sky-600" /> Focus
        </button>
      </div>

      {/* Candidate Identifier Banner */}
      <div
        className={`p-3 border-b text-xs space-y-1.5 transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700/60'
            : 'bg-gradient-to-b from-sky-50/60 to-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="font-bold text-sky-700">CANDIDATE 3D ULPIN</span>
          <span
            className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold ${
              isDark ? 'bg-amber-950/80 border-amber-700/60 text-amber-300' : 'bg-amber-100 border-amber-300 text-amber-900'
            }`}
          >
            PROTOTYPE SPEC
          </span>
        </div>

        <div
          className={`flex items-center justify-between px-2.5 py-1.5 rounded border ${
            isDark ? 'bg-black/40 border-slate-700' : 'bg-white border-slate-300 shadow-xs'
          }`}
        >
          <span className="font-bold text-sky-700 text-xs truncate">
            {unit?.candidateIdentifier?.candidateString || `${parcel.baseLandId}-A-G00-U01`}
          </span>
          <button
            onClick={handleCopyCandidateId}
            className="text-slate-400 hover:text-slate-700 ml-2 transition-colors cursor-pointer"
            title="Copy Candidate Identifier"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className={`grid grid-cols-2 gap-1 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
          <div>
            Internal ID: <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{unit?.propertyVolumeId || 'N/A'}</span>
          </div>
          <div className="text-right">
            Survey No: <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{parcel.surveyNumber}</span>
          </div>
        </div>

        <div className={`pt-1.5 border-t flex items-center justify-between text-[10px] ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          {building.isUlpinAllocated ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>3D ULPIN Allocated</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Allocation Pending</span>
            </div>
          )}

          {building.isUlpinAllocated ? (
            <button
              onClick={() => setShowCertModal(true)}
              className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 flex items-center gap-1 cursor-pointer transition-colors font-semibold"
            >
              <Award className="w-3 h-3 text-emerald-600" />
              <span>Certificate</span>
            </button>
          ) : (
            <button
              onClick={() => allocate3DUlpinForBuilding(building.buildingId)}
              className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1 cursor-pointer transition-colors shadow-xs font-semibold"
            >
              <Zap className="w-3 h-3" />
              <span>Allocate</span>
            </button>
          )}
        </div>
      </div>

      {/* Vertical Floor Selector Tabs */}
      <div
        className={`px-3 py-2 border-b flex items-center justify-between transition-colors ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Select Floor Level:</span>
        <div className="flex items-center gap-1 overflow-x-auto max-w-[170px] py-0.5">
          {building.floors.map((fl) => (
            <button
              key={fl.floorId}
              onClick={() => setSelectedFloorNumber(fl.floorNumber)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer font-medium ${
                fl.floorNumber === selectedFloorNumber
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : fl.floorNumber < 0
                  ? 'bg-red-100 text-red-900 border border-red-300 font-semibold'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
              }`}
            >
              {fl.floorNumber < 0 ? `B${Math.abs(fl.floorNumber)}` : fl.floorNumber === 0 ? 'G' : `F${fl.floorNumber}`}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Action Tools Toolbar */}
      <div
        className={`px-3 py-2 border-b flex items-center justify-between text-[11px] transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-sky-600" />
          <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Explode View:</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="8"
            step="0.5"
            value={explodeFloorsValue}
            onChange={(e) => setExplodeFloorsValue(parseFloat(e.target.value))}
            className="w-24 accent-sky-600 cursor-pointer"
          />
          <span className={`text-[10px] font-bold w-6 ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>{explodeFloorsValue}m</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        className={`grid grid-cols-5 border-b text-[10px] text-center transition-colors ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}
      >
        {[
          { id: 'spatial', label: 'Spatial' },
          { id: 'ownership', label: 'Owner' },
          { id: 'tax', label: 'Tax' },
          { id: 'policies', label: 'Policy' },
          { id: 'provenance', label: 'Source' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`py-1.5 transition-colors cursor-pointer ${
              activeTab === t.id
                ? isDark
                  ? 'text-sky-400 border-b-2 border-sky-400 font-semibold bg-slate-900'
                  : 'text-sky-800 border-b-2 border-sky-600 font-bold bg-white'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-950 font-medium'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
        {/* SPATIAL TAB */}
        {activeTab === 'spatial' && (
          <div className="space-y-2">
            <div
              className={`p-2 rounded border space-y-1.5 ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`text-[11px] font-semibold flex justify-between ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                <span>{building.name}</span>
                <span className={`font-bold ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>{building.propertyType}</span>
              </div>
              <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Parcel: <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{parcel.parcelId}</span> | Base Land ID:{' '}
                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{parcel.baseLandId}</span>
              </div>
            </div>

            {/* Metric Dimensions */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div
                className={`p-2 rounded border ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Floor Built-up Area</div>
                <div className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{floor?.areaM2 || 0} m²</div>
              </div>
              <div
                className={`p-2 rounded border ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Floor Volume</div>
                <div className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{floor?.volumeM3 || 0} m³</div>
              </div>
              <div
                className={`p-2 rounded border ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Z-Range (Depth/Elev)</div>
                <div className={`text-sm font-bold ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
                  {floor?.zMin.toFixed(1)}m to {floor?.zMax.toFixed(1)}m
                </div>
              </div>
              <div
                className={`p-2 rounded border ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Building Height</div>
                <div className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{building.totalHeight.toFixed(1)} m</div>
              </div>
            </div>

            {/* Active Topology Validation Clashes on this object */}
            {buildingClashes.length > 0 && (
              <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 space-y-1 text-red-900 dark:text-red-300">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span>3D Topology Collision Alert ({buildingClashes[0].id})</span>
                </div>
                <div className="text-[10px] leading-tight">{buildingClashes[0].description}</div>
              </div>
            )}
          </div>
        )}

        {/* OWNERSHIP TAB */}
        {activeTab === 'ownership' && (
          <div className="space-y-2">
            <div
              className={`p-2.5 rounded border space-y-2 ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>RECORD STATUS</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {isRealDataMode ? 'Verified Authorized' : 'Demo Synthetic'}
                </span>
              </div>

              <div>
                <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Owner of Record</div>
                <div className={`font-bold text-xs ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{ownerRecord?.ownerName || 'Demo Owner'}</div>
              </div>

              <div>
                <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Tenure Classification</div>
                <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{ownerRecord?.tenure || 'Freehold Title Deed'}</div>
              </div>

              <div>
                <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Registration Document Ref</div>
                <div className={`text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-800 font-medium'}`}>{ownerRecord?.registrationReference}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAX TAB */}
        {activeTab === 'tax' && (
          <div className="space-y-2">
            <div
              className={`p-2.5 rounded border space-y-2 ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>TAX ASSESSMENT (FY 2025-26)</span>
                <span className="px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-300 text-[10px] font-semibold">
                  {taxAssessment?.taxStatus}
                </span>
              </div>

              <div
                className={`p-2 rounded border ${
                  isDark ? 'bg-black/40 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Estimated Annual Municipal Tax</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  ₹ {taxAssessment?.estimatedAnnualTax.toLocaleString('en-IN') || 0}
                </div>
              </div>

              <div className={`space-y-1 text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-800 font-medium'}`}>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-normal'}>Base Rate:</span>
                  <span>₹ {taxAssessment?.baseRatePerM2} / m²</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-normal'}>Zone Multiplier:</span>
                  <span>× {taxAssessment?.zoneMultiplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-normal'}>Floor Level Coeff:</span>
                  <span>× {taxAssessment?.floorMultiplier}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POLICIES TAB */}
        {activeTab === 'policies' && (
          <div className="space-y-2">
            {policies.map((p) => (
              <div
                key={p.policyId}
                className={`p-2 rounded border space-y-1 ${
                  isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`font-bold ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>{p.policyId}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                      p.status === 'COMPLIANT'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                        : p.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                        : 'bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{p.policyName}</div>
                <div className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{p.ruleExpression}</div>
              </div>
            ))}
          </div>
        )}

        {/* PROVENANCE TAB */}
        {activeTab === 'provenance' && (
          <div
            className={`p-2.5 rounded border space-y-2 text-[10px] ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`font-bold text-[11px] pb-1 border-b ${isDark ? 'border-slate-700 text-slate-100' : 'border-slate-200 text-slate-900'}`}>
              Data Lineage & Provenance
            </div>
            <div className={`space-y-1.5 ${isDark ? 'text-slate-300' : 'text-slate-800 font-medium'}`}>
              <div>
                <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-normal'}>Cadastral Boundary:</span> {parcel.provenance.parcel}
              </div>
              <div>
                <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-normal'}>Building Footprint:</span> {building.provenance.building}
              </div>
              <div>
                <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-normal'}>Vertical Extrusion:</span> {building.provenance.geometry}
              </div>
              <div>
                <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-normal'}>Confidence Score:</span>{' '}
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                  {(building.provenance.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel Bottom Download Action Bar */}
      <div
        className={`p-3 border-t space-y-2 transition-colors ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className={`text-[10px] font-bold uppercase tracking-wider text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Export Cadastral Dossier
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleDownloadDossier('json')}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
          <button
            onClick={() => handleDownloadDossier('csv')}
            className={`flex items-center justify-center gap-1 px-3 py-2 rounded border text-xs transition-colors cursor-pointer shadow-xs font-semibold ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> CSV Sheet
          </button>
        </div>
      </div>

      {showCertModal && (
        <UlpinCertificateModal
          building={building}
          parcel={parcel}
          onClose={() => setShowCertModal(false)}
          onFlyTo3D={() => {
            setShowCertModal(false);
            setExplodeFloorsValue(2.5);
          }}
        />
      )}
    </div>
  );
};
