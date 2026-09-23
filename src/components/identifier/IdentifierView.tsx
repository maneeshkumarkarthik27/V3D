import React, { useState } from 'react';
import { useV3D } from '../../state/useV3DStore';
import { ThreeDIdentifierService, VerticalIdentifierComposer } from '../../services/identifierService';
import { VerticalPosition } from '../../types';
import { Hash, Copy, Check, Info, ShieldCheck, Layers, FileCode } from 'lucide-react';

export const IdentifierView: React.FC = () => {
  const { parcels, theme } = useV3D();
  const isDark = theme === 'dark';

  const [baseLandId, setBaseLandId] = useState(parcels[6]?.baseLandId || 'TN-CH-04-10107');
  const [verticalPosition, setVerticalPosition] = useState<VerticalPosition>('ABOVE');
  const [floorNumber, setFloorNumber] = useState<number>(3);
  const [unitCode, setUnitCode] = useState('U02');
  const [copied, setCopied] = useState(false);

  const candidate = ThreeDIdentifierService.generateCandidate({
    baseLandId,
    verticalPosition,
    floorNumber,
    unitId: unitCode,
    internalPropNumber: 7032,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(candidate.candidateString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full h-full flex flex-col select-none overflow-y-auto p-4 sm:p-6 font-mono transition-colors ${
      isDark ? 'bg-[#0b1118] text-slate-200' : 'bg-slate-50 text-slate-800'
    }`}>
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3 ${
          isDark ? 'border-slate-800' : 'border-slate-300'
        }`}>
          <div>
            <h1 className={`text-base font-bold flex items-center gap-2 ${
              isDark ? 'text-slate-100' : 'text-slate-950'
            }`}>
              <Hash className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              VERTICAL IDENTIFIER COMPOSER & CANDIDATE 3D ULPIN ARCHITECTURE
            </h1>
            <p className={`text-xs mt-0.5 font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              SIH26011 Specification — Composing semantic volumetric coordinates for multi-tier urban property titles.
            </p>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold shrink-0 self-start sm:self-auto border ${
            isDark ? 'bg-amber-950/60 border-amber-800 text-amber-300' : 'bg-amber-100 border-amber-300 text-amber-900'
          }`}>
            <Info className="w-3.5 h-3.5" />
            <span>Prototype Standard</span>
          </div>
        </div>

        {/* Official vs Candidate Identifier Architecture Diagram */}
        <div className={`p-4 rounded-lg border shadow-xs space-y-3 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${
            isDark ? 'text-slate-200' : 'text-slate-900'
          }`}>
            Identifier System Architectural Distinction
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className={`p-3 rounded border space-y-1 ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-300'
            }`}>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">1. Official 3D ULPIN</div>
              <div className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>Pending Government Specification</div>
              <p className={`text-[10px] leading-normal font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                External standard managed by the Department of Land Resources (DoLR), MoRD, Government of India. Not hardcoded or fabricated by V3D.
              </p>
            </div>

            <div className={`p-3 rounded border space-y-1 ${
              isDark ? 'bg-sky-950/40 border-sky-700/60' : 'bg-sky-50 border-sky-300'
            }`}>
              <div className="text-[10px] text-sky-700 dark:text-sky-400 font-bold uppercase">2. Candidate Identifier</div>
              <div className="text-xs font-bold text-sky-800 dark:text-sky-200">{candidate.candidateString}</div>
              <p className={`text-[10px] leading-normal font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Composed algorithmic representation combining Base Land ID + Vertical Code + Level + Unit code.
              </p>
            </div>

            <div className={`p-3 rounded border space-y-1 ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-300'
            }`}>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">3. Internal System ID</div>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{candidate.internalPropertyId}</div>
              <p className={`text-[10px] leading-normal font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Deterministic primary key for local spatial database relations, 3D volumetric bounding boxes, and audit logging.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Vertical Identifier Composer */}
        <div className={`p-5 rounded-lg border shadow-xs space-y-4 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className={isDark ? 'text-slate-200' : 'text-slate-900'}>Interactive Composer Tool</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Base Land ID */}
            <div>
              <label className={`block text-[11px] mb-1 font-semibold ${
                isDark ? 'text-slate-400' : 'text-slate-700'
              }`}>Base Land ID (Cadastral)</label>
              <select
                value={baseLandId}
                onChange={(e) => setBaseLandId(e.target.value)}
                className={`w-full px-3 py-2 border rounded font-mono text-xs focus:outline-none focus:border-sky-500 font-medium ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                }`}
              >
                {parcels.slice(0, 15).map((p) => (
                  <option key={p.parcelId} value={p.baseLandId}>
                    {p.baseLandId} ({p.parcelId})
                  </option>
                ))}
              </select>
            </div>

            {/* Vertical Position */}
            <div>
              <label className={`block text-[11px] mb-1 font-semibold ${
                isDark ? 'text-slate-400' : 'text-slate-700'
              }`}>Vertical Category</label>
              <select
                value={verticalPosition}
                onChange={(e) => setVerticalPosition(e.target.value as VerticalPosition)}
                className={`w-full px-3 py-2 border rounded font-mono text-xs focus:outline-none focus:border-sky-500 font-medium ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                }`}
              >
                {[
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
                ].map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Floor Number */}
            <div>
              <label className={`block text-[11px] mb-1 font-semibold ${
                isDark ? 'text-slate-400' : 'text-slate-700'
              }`}>Floor Level Index</label>
              <input
                type="number"
                value={floorNumber}
                onChange={(e) => setFloorNumber(parseInt(e.target.value) || 0)}
                min="-3"
                max="30"
                className={`w-full px-3 py-2 border rounded font-mono text-xs focus:outline-none focus:border-sky-500 font-medium ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                }`}
              />
            </div>

            {/* Unit Code */}
            <div>
              <label className={`block text-[11px] mb-1 font-semibold ${
                isDark ? 'text-slate-400' : 'text-slate-700'
              }`}>Unit / Partition Code</label>
              <input
                type="text"
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value.toUpperCase())}
                placeholder="e.g. U02, COM"
                className={`w-full px-3 py-2 border rounded font-mono text-xs focus:outline-none focus:border-sky-500 font-medium ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                }`}
              />
            </div>
          </div>

          {/* Generated Result Output */}
          <div className={`p-4 rounded-lg border space-y-3 ${
            isDark ? 'bg-black/50 border-sky-800/80' : 'bg-sky-50/70 border-sky-300 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-sky-700 dark:text-sky-400 font-bold uppercase tracking-wider">
                Synthesized Candidate Volumetric Identifier:
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy String'}</span>
              </button>
            </div>

            <div className={`text-base sm:text-lg font-bold font-mono p-3 rounded border select-all break-all ${
              isDark ? 'bg-slate-900/90 border-slate-700 text-sky-300' : 'bg-white border-slate-300 text-sky-900 shadow-xs'
            }`}>
              {candidate.candidateString}
            </div>

            {/* Composition Breakdown */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-600'
            }`}>
              <div>
                <span className={`text-[10px] font-semibold block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Base Land Code:</span>
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{candidate.baseLandId}</span>
              </div>
              <div>
                <span className={`text-[10px] font-semibold block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Vertical Semantic:</span>
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{candidate.verticalComponent} ({verticalPosition})</span>
              </div>
              <div>
                <span className={`text-[10px] font-semibold block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Level Code:</span>
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{candidate.levelCode}</span>
              </div>
              <div>
                <span className={`text-[10px] font-semibold block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Unit Component:</span>
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{candidate.unitCode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
