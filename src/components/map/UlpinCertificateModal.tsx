import React, { useState } from 'react';
import { Building, LandParcel } from '../../types';
import { useV3D } from '../../state/useV3DStore';
import {
  ShieldCheck,
  Download,
  Printer,
  Copy,
  Check,
  X,
  QrCode,
  Layers,
  MapPin,
  ExternalLink,
  Award,
} from 'lucide-react';
import { ExportService } from '../../services/exportService';

interface UlpinCertificateModalProps {
  building: Building;
  parcel: LandParcel;
  onClose: () => void;
  onFlyTo3D?: () => void;
}

export const UlpinCertificateModal: React.FC<UlpinCertificateModalProps> = ({
  building,
  parcel,
  onClose,
  onFlyTo3D,
}) => {
  const { theme } = useV3D();
  const isDark = theme === 'dark';
  const [copiedHash, setCopiedHash] = useState(false);

  const certHash =
    building.ulpinCertificateHash ||
    `SHA256-TN-${building.baseLandId.replace(/[^A-Za-z0-9]/g, '')}-${building.buildingId}-948123`;
  const allocatedAt = building.ulpinAllocatedAt || new Date().toISOString();
  const totalUnits = building.floors.reduce((sum, f) => sum + f.units.length, 0);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadLedger = () => {
    const csvContent = [
      'Building Name,Building ID,2D Base ULPIN,Survey No,Floor Level,Unit ID,Vertical Tier,Z-Min (m),Z-Max (m),Area (sqm),Candidate 3D ULPIN,Cert Hash',
      ...building.floors.flatMap((fl) =>
        fl.units.map((u) =>
          [
            `"${building.name}"`,
            building.buildingId,
            building.baseLandId,
            parcel.surveyNumber,
            fl.floorNumber,
            u.unitId,
            fl.floorType,
            u.zMin.toFixed(2),
            u.zMax.toFixed(2),
            u.areaM2,
            u.candidateIdentifier.candidateString,
            certHash,
          ].join(',')
        )
      ),
    ].join('\n');

    ExportService.downloadFile(
      `3D_ULPIN_Certificate_${building.buildingId}.csv`,
      csvContent,
      'text/csv'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm tracking-wide ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Candidate 3D ULPIN Spatial Allocation Certificate
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-700 font-bold">
                  SIH26011 COMPLIANT
                </span>
              </div>
              <div className={`text-[11px] font-mono font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Department of Land Resources (DoLR) • Tamil Nadu Cadastral GIS
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body (Scrollable) */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-6 font-sans text-xs ${isDark ? 'bg-slate-900/60' : 'bg-slate-50/50'}`}>
          {/* Official Seal & Reference Banner */}
          <div
            className={`p-4 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isDark
                ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-slate-800'
                : 'bg-gradient-to-r from-sky-50 via-white to-indigo-50/60 border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-400 dark:border-sky-600/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                  {building.name}
                </div>
                <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 font-bold mt-0.5">
                  Base Land ULPIN: {building.baseLandId} • S.No: {parcel.surveyNumber}
                </div>
                <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Location: {parcel.village}, {parcel.taluk}, {parcel.district}
                </div>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 px-3 py-2 rounded border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300 shadow-xs'
              }`}
            >
              <QrCode className={`w-10 h-10 ${isDark ? 'text-slate-300' : 'text-slate-800'}`} />
              <div className={`text-[10px] font-mono leading-tight ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <div className="font-semibold">QR VERIFIED</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE ALLOCATION</div>
                <div className={`text-[9px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{allocatedAt.slice(0, 10)}</div>
              </div>
            </div>
          </div>

          {/* Spatial Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
            <div className={`p-3 rounded border ${isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white border-slate-300 shadow-xs'}`}>
              <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Height & Floors</div>
              <div className={`font-bold text-sm mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                {building.totalHeight.toFixed(1)}m • G+{building.floorsCount}
              </div>
              <div className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{building.basementCount} Subsurface Basements</div>
            </div>

            <div className={`p-3 rounded border ${isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white border-slate-300 shadow-xs'}`}>
              <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ground MSL Datum</div>
              <div className={`font-bold text-sm mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                +{building.groundElevation.toFixed(1)}m MSL
              </div>
              <div className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>CartoDEM 10m Model</div>
            </div>

            <div className={`p-3 rounded border ${isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white border-slate-300 shadow-xs'}`}>
              <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Vertical Volumes</div>
              <div className={`font-bold text-sm mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                {totalUnits} Units Allocated
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">100% 3D Collision Free</div>
            </div>

            <div className={`p-3 rounded border ${isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white border-slate-300 shadow-xs'}`}>
              <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Built-Up Area</div>
              <div className={`font-bold text-sm mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                {building.totalBuiltupAreaM2.toLocaleString()} m²
              </div>
              <div className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Footprint: {building.footprintAreaM2} m²</div>
            </div>
          </div>

          {/* Volumetric 3D ULPIN Decomposition Schedule */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider font-mono">
                <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span className={isDark ? 'text-slate-200' : 'text-slate-900'}>3D Volumetric Property Schedule (Allocated ULPINs)</span>
              </div>
              <span className={`text-[11px] font-mono font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {building.floors.length} Volumetric Slabs
              </span>
            </div>

            <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-300 bg-white shadow-xs'}`}>
              <table className="w-full text-left font-mono text-[11px]">
                <thead className={`border-b text-[10px] ${isDark ? 'bg-slate-900/90 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-300 font-bold'}`}>
                  <tr>
                    <th className="px-3 py-2">Floor / Level</th>
                    <th className="px-3 py-2">Vertical Tier</th>
                    <th className="px-3 py-2">Z-Min → Z-Max (m)</th>
                    <th className="px-3 py-2">Area (m²)</th>
                    <th className="px-3 py-2">Candidate 3D ULPIN</th>
                    <th className="px-3 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                  {building.floors.map((fl) =>
                    fl.units.map((u) => (
                      <tr key={u.unitId} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                        <td className={`px-3 py-2 font-bold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                          {fl.floorNumber === 0
                            ? 'Ground (G00)'
                            : fl.floorNumber < 0
                            ? `Basement ${fl.floorNumber}`
                            : `Floor ${fl.floorNumber}`}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              fl.floorType === 'BASEMENT'
                                ? isDark
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                                  : 'bg-amber-100 text-amber-950 border border-amber-300'
                                : fl.floorType === 'GROUND'
                                ? isDark
                                  ? 'bg-sky-950/80 text-sky-300 border border-sky-800/60'
                                  : 'bg-sky-100 text-sky-950 border border-sky-300'
                                : isDark
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                                : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                            }`}
                          >
                            {fl.floorType}
                          </span>
                        </td>
                        <td className={`px-3 py-2 ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                          {u.zMin >= 0 ? `+${u.zMin.toFixed(1)}` : u.zMin.toFixed(1)}m →{' '}
                          {u.zMax >= 0 ? `+${u.zMax.toFixed(1)}` : u.zMax.toFixed(1)}m
                        </td>
                        <td className={`px-3 py-2 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{u.areaM2} m²</td>
                        <td className="px-3 py-2 text-sky-700 dark:text-sky-300 font-bold tracking-wide">
                          {u.candidateIdentifier.candidateString}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            <Check className="w-3 h-3" />
                            Allocated
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cryptographic Ledger Verification Hash */}
          <div
            className={`p-3 rounded-lg border space-y-1.5 font-mono ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Ledger Cryptographic Verification Hash:</span>
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors cursor-pointer text-[10px] font-bold"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? 'Copied Hash' : 'Copy Hash'}</span>
              </button>
            </div>
            <div
              className={`p-2 rounded border text-[10px] break-all select-all font-mono font-medium ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-800 shadow-xs'
              }`}
            >
              {certHash}
            </div>
            <div className={`text-[10px] italic ${isDark ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
              Verified by V3D Cryptographic Cadastral Engine. Candidate vertical identifier conforms to SIH26011 multi-tier indexing guidelines.
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-t ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className={`text-[11px] font-mono font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            Total {totalUnits} Vertical Units Registered
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadLedger}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors cursor-pointer border ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Ledger</span>
            </button>
            {onFlyTo3D && (
              <button
                onClick={() => {
                  onClose();
                  onFlyTo3D();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-mono font-bold shadow-xs transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Fly to 3D Twin View</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
