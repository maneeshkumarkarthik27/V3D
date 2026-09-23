import React, { useState } from 'react';
import { useV3D } from '../../state/useV3DStore';
import { BlueprintService } from '../../services/blueprintService';
import { BlueprintAnalysisResult } from '../../types';
import { Upload, Box, Cpu, Sparkles, CheckCircle2, Layers, Sliders, ArrowRight } from 'lucide-react';

export const BlueprintStudio: React.FC = () => {
  const { addBuilding, setCurrentView, setFocusTarget, theme } = useV3D();
  const isDark = theme === 'dark';

  const [uploadedFileName, setUploadedFileName] = useState('taramani_commercial_hub_plan.svg');
  const [blueprintFormat, setBlueprintFormat] = useState<'SVG' | 'DXF' | 'GEOJSON'>('SVG');
  const [floorHeight, setFloorHeight] = useState<number>(3.4);
  const [floorsCount, setFloorsCount] = useState<number>(5);
  const [hasBasement, setHasBasement] = useState<boolean>(true);
  const [groundElevation, setGroundElevation] = useState<number>(12.0);

  // Initial analyzed blueprint
  const [analysis, setAnalysis] = useState<BlueprintAnalysisResult>(() =>
    BlueprintService.analyzeBlueprint(
      { name: 'taramani_commercial_hub_plan.svg', size: 1024 * 512, type: 'image/svg+xml' },
      5,
      3.4
    )
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadedFileName(file.name);

    setTimeout(() => {
      const result = BlueprintService.analyzeBlueprint(file, floorsCount, floorHeight);
      setAnalysis(result);
      setIsProcessing(false);
    }, 600);
  };

  const handleSelectPreset = (name: string, floors: number, format: 'SVG' | 'DXF' | 'GEOJSON') => {
    setUploadedFileName(name);
    setFloorsCount(floors);
    setBlueprintFormat(format);
    const result = BlueprintService.analyzeBlueprint({ name, size: 850000, type: 'text/xml' }, floors, floorHeight);
    setAnalysis(result);
  };

  const handleExtrude3D = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const building = BlueprintService.extrudeTo3DBuilding(analysis, {
        name: `Custom Extrusion (${uploadedFileName.replace(/\.[^/.]+$/, '')})`,
        floorHeight,
        floorsCount,
        hasBasement,
        groundElevation,
        localX: 80,
        localY: 60,
      });

      addBuilding(building);
      setIsProcessing(false);
      setSuccessMessage(`Volumetric 3D building ${building.buildingId} generated successfully with ${building.floors.length} vertical levels!`);

      setTimeout(() => {
        setCurrentView('twin');
        setFocusTarget([building.localX + building.width / 2, 0, building.localY + building.depth / 2]);
      }, 1200);
    }, 800);
  };

  return (
    <div className={`w-full h-full flex flex-col select-none overflow-y-auto transition-colors ${
      isDark ? 'bg-[#0b1118] text-slate-200' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Header Banner */}
      <div className={`px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h1 className={`text-base font-bold font-mono tracking-wide ${
              isDark ? 'text-slate-100' : 'text-slate-950'
            }`}>
              BLUEPRINT → 3D BUILDING EXTRUSION ENGINE
            </h1>
          </div>
          <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Vectorize architectural floorplans (SVG, DXF, GeoJSON) and synthesize 3D vertical property volumes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <div className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-mono font-semibold border ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>AI Feature Extraction: Active (94% Conf)</span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="flex-1 p-4 sm:p-6 grid grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Upload & Parameters */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* File Upload Zone */}
          <div className={`p-4 rounded-xl border space-y-3 shadow-xs ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-300'
          }`}>
            <div className="text-xs font-mono font-bold uppercase tracking-wider flex justify-between items-center">
              <span className={isDark ? 'text-slate-300' : 'text-slate-900'}>Upload Architectural Plan</span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">SVG / DXF / GeoJSON</span>
            </div>

            <label className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDark
                ? 'border-slate-700 hover:border-sky-500 bg-slate-950/40'
                : 'border-slate-300 hover:border-sky-500 bg-slate-50'
            }`}>
              <Upload className="w-8 h-8 text-sky-600 dark:text-sky-400 mb-2" />
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Click to upload or drag & drop</span>
              <span className={`text-[10px] mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Accepts CAD DXF, SVG vectors, or GeoJSON footprints</span>
              <input type="file" onChange={handleFileUpload} accept=".svg,.dxf,.geojson,.json,.pdf,.png" className="hidden" />
            </label>

            <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Current File: <span className="text-sky-600 dark:text-sky-300 font-bold">{uploadedFileName}</span>
            </div>

            {/* Preloaded Demo Blueprints */}
            <div className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className={`text-[10px] font-mono uppercase mb-1.5 font-bold ${
                isDark ? 'text-slate-400' : 'text-slate-700'
              }`}>
                Or Load Benchmark Architectural Presets:
              </div>
              <div className="space-y-1.5">
                {[
                  { name: 'taramani_commercial_hub_plan.svg', label: 'Taramani Commercial Tower (G+5)', floors: 5, format: 'SVG' as const },
                  { name: 'omr_transit_terminal_cad.dxf', label: 'OMR Transit Terminal (G+3 with Basement)', floors: 3, format: 'DXF' as const },
                  { name: 'anna_nagar_residency.geojson', label: 'Anna Nagar Multi-Unit Residency (G+7)', floors: 7, format: 'GEOJSON' as const },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleSelectPreset(item.name, item.floors, item.format)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono flex items-center justify-between border transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    <span className="font-medium truncate pr-2">{item.label}</span>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold shrink-0">{item.format}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Extrusion Parameters */}
          <div className={`p-4 rounded-xl border space-y-3 shadow-xs font-mono text-xs ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-300'
          }`}>
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-900'}>Extrusion Parameters</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className={`flex justify-between text-[11px] mb-1 font-semibold ${
                  isDark ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  <span>Number of Above-Ground Floors:</span>
                  <span className="text-sky-600 dark:text-sky-400 font-bold">{floorsCount} Floors</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={floorsCount}
                  onChange={(e) => setFloorsCount(parseInt(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div>
                <div className={`flex justify-between text-[11px] mb-1 font-semibold ${
                  isDark ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  <span>Floor Height (Slab-to-Slab):</span>
                  <span className="text-sky-600 dark:text-sky-400 font-bold">{floorHeight} m</span>
                </div>
                <input
                  type="range"
                  min="2.8"
                  max="4.5"
                  step="0.1"
                  value={floorHeight}
                  onChange={(e) => setFloorHeight(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                  Include Subsurface Basement (-3.5m):
                </span>
                <input
                  type="checkbox"
                  checked={hasBasement}
                  onChange={(e) => setHasBasement(e.target.checked)}
                  className="w-4 h-4 accent-sky-600 cursor-pointer"
                />
              </div>

              <div>
                <div className={`flex justify-between text-[11px] mb-1 font-semibold ${
                  isDark ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  <span>Ground Elevation (MSL):</span>
                  <span className="text-sky-600 dark:text-sky-400 font-bold">+{groundElevation} m</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="0.5"
                  value={groundElevation}
                  onChange={(e) => setGroundElevation(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Extrude Button */}
            <button
              onClick={handleExtrude3D}
              disabled={isProcessing}
              className="w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <span>Synthesizing 3D Geometry...</span>
              ) : (
                <>
                  <Box className="w-4 h-4" />
                  <span>Generate 3D Building Volume</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {successMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Vector Blueprint Preview & Room Inspector */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className={`p-4 rounded-xl border shadow-xs flex flex-col h-[560px] ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
          }`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-2 ${
              isDark ? 'border-slate-800' : 'border-slate-300'
            }`}>
              <div className={`font-mono text-xs font-bold ${
                isDark ? 'text-slate-300' : 'text-slate-900'
              }`}>
                Detected Vector Geometry & Room Partitions (Scale: {analysis.detectedScale} px/m)
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>
                  Total Area: <strong className={isDark ? 'text-slate-200' : 'text-slate-900 font-bold'}>{analysis.totalAreaM2} m²</strong>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">AI Confidence: {(analysis.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* 2D Vector CAD Canvas Preview */}
            <div className={`flex-1 relative flex items-center justify-center rounded border overflow-hidden my-3 ${
              isDark ? 'bg-[#070b10] border-slate-800/80' : 'bg-slate-100 border-slate-300'
            }`}>
              <svg viewBox="-2 -2 26 24" className="w-full h-full max-h-[380px] p-2">
                {/* Floor Outer Boundary Grid */}
                <rect
                  x="0"
                  y="0"
                  width="22"
                  height="20"
                  fill={isDark ? '#0f172a' : '#f8fafc'}
                  stroke={isDark ? '#38bdf8' : '#0284c7'}
                  strokeWidth="0.35"
                />

                {/* Rooms */}
                {analysis.rooms.map((room) => {
                  const [rx, ry, rw, rh] = room.bounds;
                  const isService = room.type === 'SERVICE';
                  const isCommon = room.type === 'COMMON';

                  return (
                    <g key={room.id}>
                      <rect
                        x={rx}
                        y={ry}
                        width={rw - rx}
                        height={rh - ry}
                        fill={
                          isDark
                            ? (isService ? '#475569' : isCommon ? '#1e293b' : '#0369a1')
                            : (isService ? '#cbd5e1' : isCommon ? '#e2e8f0' : '#bae6fd')
                        }
                        fillOpacity={isDark ? 0.45 : 0.65}
                        stroke={isDark ? '#64748b' : '#94a3b8'}
                        strokeWidth="0.2"
                      />
                      <text
                        x={(rx + rw) / 2}
                        y={(ry + rh) / 2 - 0.4}
                        fill={isDark ? '#f8fafc' : '#0f172a'}
                        fontSize="0.8"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {room.name}
                      </text>
                      <text
                        x={(rx + rw) / 2}
                        y={(ry + rh) / 2 + 0.8}
                        fill={isDark ? '#94a3b8' : '#475569'}
                        fontSize="0.65"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="500"
                      >
                        {room.areaM2} m² | {room.type}
                      </text>
                    </g>
                  );
                })}

                {/* Walls */}
                {analysis.walls.map((w, idx) => (
                  <line
                    key={idx}
                    x1={w.x1}
                    y1={w.y1}
                    x2={w.x2}
                    y2={w.y2}
                    stroke={isDark ? '#cbd5e1' : '#1e293b'}
                    strokeWidth={w.thickness * 1.5}
                    strokeLinecap="square"
                  />
                ))}

                {/* Doors */}
                {analysis.doors.map((d, idx) => (
                  <circle key={idx} cx={d.x} cy={d.y} r="0.6" fill="#d97706" />
                ))}

                {/* Windows */}
                {analysis.windows.map((w, idx) => (
                  <rect key={idx} x={w.x - w.width / 2} y={w.y - 0.2} width={w.width} height="0.4" fill={isDark ? '#38bdf8' : '#0284c7'} />
                ))}
              </svg>
            </div>

            {/* Room Breakdown Chips */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-mono text-[10px] pt-2 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-300'
            }`}>
              {analysis.rooms.map((r) => (
                <div key={r.id} className={`p-1.5 rounded border truncate ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700/60'
                    : 'bg-slate-100 border-slate-300'
                }`}>
                  <div className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{r.name}</div>
                  <div className={isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}>{r.areaM2} m²</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
