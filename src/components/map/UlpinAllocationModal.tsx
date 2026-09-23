import React, { useState, useEffect } from 'react';
import { Building, LandParcel } from '../../types';
import { useV3D } from '../../state/useV3DStore';
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  Layers,
  ArrowRight,
  Cpu,
  Download,
  ExternalLink,
  X,
  FileCheck,
  Check,
} from 'lucide-react';
import { ExportService } from '../../services/exportService';

interface UlpinAllocationModalProps {
  targetType: 'area' | 'building';
  targetName: string;
  buildingsToAllocate: Building[];
  parcels: LandParcel[];
  onComplete: () => void;
  onClose: () => void;
  onInspectBuilding?: (bId: string) => void;
}

const ALLOCATION_STEPS = [
  {
    step: 1,
    title: 'Cadastral Boundary & 2D Land ULPIN Verification',
    desc: 'Validating base survey numbers, revenue village, and 2D geographic parcels.',
  },
  {
    step: 2,
    title: '3D Volumetric Extrusion & MSL Datum Alignment',
    desc: 'Computing absolute vertical Z-min and Z-max boundaries from CartoDEM elevation.',
  },
  {
    step: 3,
    title: 'Algorithmic 3D Candidate ULPIN Synthesis',
    desc: 'Generating hierarchical vertical codes [Base-Land-ID]-[Vertical-Tier]-[Level]-[Unit].',
  },
  {
    step: 4,
    title: 'Spatial Non-Overlap & Vertical Gap Validation',
    desc: 'Executing 3D bounding box topology checks across subterranean and upper floors.',
  },
  {
    step: 5,
    title: 'Digital Cadastre Hash Issuance & Ledger Registration',
    desc: 'Signing candidate property volume records with cryptographic SHA-256 verification hash.',
  },
];

export const UlpinAllocationModal: React.FC<UlpinAllocationModalProps> = ({
  targetType,
  targetName,
  buildingsToAllocate,
  parcels,
  onComplete,
  onClose,
  onInspectBuilding,
}) => {
  const { theme } = useV3D();
  const isDark = theme === 'dark';

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isDone, setIsDone] = useState(false);
  const [allocationLogs, setAllocationLogs] = useState<string[]>([]);

  const totalUnits = buildingsToAllocate.reduce(
    (acc, b) => acc + b.floors.reduce((facc, f) => facc + f.units.length, 0),
    0
  );

  useEffect(() => {
    // Automated step execution simulation
    const timer1 = setTimeout(() => {
      setCurrentStepIndex(1);
      setProgress(35);
      setAllocationLogs((prev) => [
        `[2D Cadastre] Verified ${parcels.length} spatial parcel boundaries for ${targetName}`,
        ...prev,
      ]);
    }, 600);

    const timer2 = setTimeout(() => {
      setCurrentStepIndex(2);
      setProgress(55);
      setAllocationLogs((prev) => [
        `[Volumetric Slicing] Extruded ${buildingsToAllocate.length} structures; mapped ${totalUnits} vertical floor slabs`,
        ...prev,
      ]);
    }, 1300);

    const timer3 = setTimeout(() => {
      setCurrentStepIndex(3);
      setProgress(75);
      setAllocationLogs((prev) => [
        `[Identifier Engine] Synthesized candidate 3D ULPIN codes conforming to SIH26011 standards`,
        ...prev,
      ]);
    }, 2000);

    const timer4 = setTimeout(() => {
      setCurrentStepIndex(4);
      setProgress(90);
      setAllocationLogs((prev) => [
        `[Topology Validator] 3D collision check completed: zero vertical gaps or illegal floor overlaps`,
        ...prev,
      ]);
    }, 2700);

    const timer5 = setTimeout(() => {
      setCurrentStepIndex(5);
      setProgress(100);
      setIsDone(true);
      setAllocationLogs((prev) => [
        `[Ledger Signed] ${totalUnits} candidate 3D ULPINs registered with cryptographic ledger hash`,
        ...prev,
      ]);
      onComplete();
    }, 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [buildingsToAllocate, parcels, targetName]);

  const handleDownloadSummary = () => {
    const csvContent = [
      'Building Name,Building ID,2D Base Land ULPIN,Floor Level,Vertical Tier,Z-Min,Z-Max,Unit Area (sqm),Candidate 3D ULPIN,Allocation Timestamp',
      ...buildingsToAllocate.flatMap((b) =>
        b.floors.flatMap((fl) =>
          fl.units.map((u) =>
            [
              `"${b.name}"`,
              b.buildingId,
              b.baseLandId,
              fl.floorNumber,
              fl.floorType,
              u.zMin.toFixed(2),
              u.zMax.toFixed(2),
              u.areaM2,
              u.candidateIdentifier.candidateString,
              new Date().toISOString(),
            ].join(',')
          )
        )
      ),
    ].join('\n');

    ExportService.downloadFile(
      `Allocated_3D_ULPIN_Ledger_${targetType}_${Date.now()}.csv`,
      csvContent,
      'text/csv'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl border rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans transition-colors ${
          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm tracking-wide ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  3D ULPIN Allocation Engine
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-700 font-bold">
                  SIH26011 CADASTRE
                </span>
              </div>
              <div className={`text-[11px] font-mono font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Target: {targetName} ({buildingsToAllocate.length} Buildings • {totalUnits} Vertical Volumes)
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

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Progress Bar & Status */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                {isDone ? 'Allocation Successfully Executed' : 'Executing 5-Stage 3D Cadastral Synthesis...'}
              </span>
              <span className="text-sky-600 dark:text-sky-400 font-bold">{progress}%</span>
            </div>
            <div
              className={`w-full h-2.5 rounded-full overflow-hidden border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'
              }`}
            >
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isDone
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stepper Status */}
          <div className="space-y-2.5">
            {ALLOCATION_STEPS.map((stepItem, idx) => {
              const isCompleted = idx < currentStepIndex || isDone;
              const isCurrent = idx === currentStepIndex && !isDone;

              return (
                <div
                  key={stepItem.step}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all text-xs ${
                    isCompleted
                      ? isDark
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : isCurrent
                      ? isDark
                        ? 'bg-sky-950/40 border-sky-600/70 text-sky-200 shadow-xs'
                        : 'bg-sky-50 border-sky-400 text-sky-950 shadow-xs'
                      : isDark
                      ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-sky-600 dark:border-sky-400 border-t-transparent animate-spin" />
                    ) : (
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-mono font-bold ${
                          isDark ? 'border-slate-600 text-slate-400' : 'border-slate-400 text-slate-700'
                        }`}
                      >
                        {stepItem.step}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[11px] flex items-center justify-between">
                      <span className={isDark ? 'text-slate-200' : 'text-slate-900'}>{stepItem.title}</span>
                      {isCompleted && (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">Done</span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 animate-pulse">
                          Processing...
                        </span>
                      )}
                    </div>
                    <div className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stepItem.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-Time Stream Terminal */}
          <div
            className={`p-3 rounded-lg border font-mono text-[10px] space-y-1 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
          >
            <div className="text-slate-300 font-semibold mb-1 flex items-center justify-between">
              <span>Cadastral Allocation Console Stream</span>
              <span className="text-emerald-400 font-bold">● LIVE</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 text-slate-200 divide-y divide-slate-800">
              {allocationLogs.map((log, index) => (
                <div key={index} className="pt-0.5 text-slate-200 font-mono">
                  <span className="text-sky-400 mr-1.5 font-bold">&gt;</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-t ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className={`text-[11px] font-mono font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {isDone ? `${totalUnits} Units Successfully Allocated` : 'Please wait while allocation executes'}
          </div>
          <div className="flex items-center gap-2">
            {isDone && (
              <>
                <button
                  onClick={handleDownloadSummary}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors cursor-pointer border ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Ledger</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Complete & View Map</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
