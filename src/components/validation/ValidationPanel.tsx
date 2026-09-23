import React from 'react';
import { useV3D } from '../../state/useV3DStore';
import { ShieldAlert, AlertTriangle, CheckCircle2, Navigation, Eye, Check, X } from 'lucide-react';

export const ValidationPanel: React.FC = () => {
  const {
    conflicts,
    selectedConflictId,
    setSelectedConflictId,
    setCurrentView,
    setFocusTarget,
    theme,
  } = useV3D();

  const isDark = theme === 'dark';

  const handleSelectConflict = (cId: string, loc: [number, number, number]) => {
    setSelectedConflictId(cId);
    setCurrentView('twin');
    setFocusTarget(loc);
  };

  const criticalCount = conflicts.filter((c) => c.severity === 'critical').length;
  const warningCount = conflicts.filter((c) => c.severity === 'warning').length;

  return (
    <div
      className={`w-full h-full flex flex-col select-none overflow-y-auto p-4 sm:p-6 font-mono transition-colors ${
        isDark ? 'bg-[#0b1118] text-slate-200' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 pb-4 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-300'
          }`}
        >
          <div>
            <h1
              className={`text-sm sm:text-base font-bold flex items-center gap-2 ${
                isDark ? 'text-slate-100' : 'text-slate-950'
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <span>3D TOPOLOGY VALIDATION & INTERSECTION ENGINE</span>
            </h1>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Automated spatial collision detection, underground corridor clearance checking, and cadastral boundary auditing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded text-xs font-bold ${
                isDark
                  ? 'bg-red-950/80 border border-red-800 text-red-300'
                  : 'bg-red-100 border border-red-300 text-red-900 shadow-xs'
              }`}
            >
              {criticalCount} Critical Clashes
            </span>
            <span
              className={`px-2.5 py-1 rounded text-xs font-bold ${
                isDark
                  ? 'bg-amber-950/80 border border-amber-800 text-amber-300'
                  : 'bg-amber-100 border border-amber-300 text-amber-950 shadow-xs'
              }`}
            >
              {warningCount} Warnings
            </span>
          </div>
        </div>

        {/* 2D vs True 3D Mathematical Intersection Explainer Box */}
        <div
          className={`p-4 rounded-xl border shadow-xs space-y-2 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
          }`}
        >
          <div
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-sky-400' : 'text-sky-800 font-extrabold'
            }`}
          >
            Geometric Principle: 2D Projection Overlap vs. True 3D Subsurface Intersection
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div
              className={`p-3 rounded-lg border space-y-1.5 ${
                isDark
                  ? 'bg-slate-800/60 border-slate-700/60'
                  : 'bg-emerald-50/80 border-emerald-300 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                <Check className="w-4 h-4" />
                <span>2D Overlap (Z-Clear / Non-Colliding)</span>
              </div>
              <p
                className={`text-[11px] leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700 font-medium'
                }`}
              >
                When a water pipeline (Depth: -4.5m) crosses beneath a surface parking lot (Elevation: 0m to +0.2m),
                their 2D footprints intersect in (X,Y) projection, but their 3D Z-ranges are completely disjoint
                (ΔZ = 4.3m clearance). The system correctly classifies this as non-colliding.
              </p>
            </div>

            <div
              className={`p-3 rounded-lg border space-y-1.5 ${
                isDark
                  ? 'bg-slate-800/60 border-slate-700/60'
                  : 'bg-red-50/80 border-red-300 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
                <X className="w-4 h-4" />
                <span>True 3D Intersection (Spatial Conflict)</span>
              </div>
              <p
                className={`text-[11px] leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700 font-medium'
                }`}
              >
                When a deep private basement excavation (Z: -7.0m to -10.5m) physically intrudes into the subterranean
                zone of the CMRL Metro Tunnel (Z: -13.6m to -19.4m with 15m geotechnical easement), both (X,Y) and Z
                bounds clash, triggering an automated critical engineering stop notice.
              </p>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-3">
          <div
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-slate-300' : 'text-slate-900'
            }`}
          >
            Active Cadastral & Infrastructure Spatial Issues
          </div>

          <div className="space-y-3">
            {conflicts.map((issue) => {
              const isCritical = issue.severity === 'critical';
              const isSelected = issue.id === selectedConflictId;

              return (
                <div
                  key={issue.id}
                  className={`p-4 rounded-xl transition-all border ${
                    isSelected
                      ? isDark
                        ? 'bg-slate-800/90 border-sky-400 shadow-xl'
                        : 'bg-sky-50 border-sky-400 shadow-md'
                      : isCritical
                      ? isDark
                        ? 'bg-red-950/20 border-red-800/80 hover:bg-red-950/30'
                        : 'bg-red-50/70 border-red-300 hover:bg-red-50 shadow-xs'
                      : isDark
                      ? 'bg-amber-950/20 border-amber-800/80 hover:bg-amber-950/30'
                      : 'bg-amber-50/70 border-amber-300 hover:bg-amber-50 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 pr-0 sm:pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isCritical
                              ? isDark
                                ? 'bg-red-900 text-red-200'
                                : 'bg-red-200 text-red-900 border border-red-300'
                              : isDark
                              ? 'bg-amber-900 text-amber-200'
                              : 'bg-amber-200 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {issue.severity}
                        </span>
                        <span className={`font-bold text-xs ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{issue.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{issue.issueType}</span>
                      </div>

                      <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>{issue.description}</div>

                      <div
                        className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 ${
                          isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                        }`}
                      >
                        <div>
                          Object A: <span className={isDark ? 'text-slate-300' : 'text-slate-900 font-bold'}>{issue.objectA}</span> (Z: {issue.zRangeA[0]}m to {issue.zRangeA[1]}m)
                        </div>
                        <div>
                          Object B: <span className={isDark ? 'text-slate-300' : 'text-slate-900 font-bold'}>{issue.objectB}</span> (Z: {issue.zRangeB[0]}m to {issue.zRangeB[1]}m)
                        </div>
                      </div>

                      <div
                        className={`text-[11px] pt-1 ${
                          isDark ? 'text-sky-300' : 'text-sky-900 font-bold'
                        }`}
                      >
                        Recommendation:{' '}
                        <span className={isDark ? 'text-slate-300' : 'text-slate-800 font-medium'}>
                          {issue.recommendation}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectConflict(issue.id, issue.location)}
                      className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Fly to Conflict in 3D
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
