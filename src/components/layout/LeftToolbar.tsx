import React from 'react';
import { useV3D } from '../../state/useV3DStore';
import {
  Layers,
  Scissors,
  Ruler,
  Eye,
  Box,
  Train,
  Droplets,
  Waves,
  Zap,
  Wifi,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';

export const LeftToolbar: React.FC = () => {
  const {
    layerVisibility,
    toggleLayer,
    sectionPlaneActive,
    setSectionPlaneActive,
    sectionPlaneOffset,
    setSectionPlaneOffset,
    sectionAxis,
    setSectionAxis,
    wireframeMode,
    setWireframeMode,
    translucentGround,
    setTranslucentGround,
    activeMeasurementTool,
    setActiveMeasurementTool,
    setFocusTarget,
    theme,
  } = useV3D();

  const isDark = theme === 'dark';

  return (
    <div
      className={`w-64 h-full border-r flex flex-col select-none overflow-y-auto p-3 font-mono text-xs z-10 space-y-4 transition-colors ${
        isDark ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}
    >
      {/* 3D Layers Toggle */}
      <div className="space-y-2">
        <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
          isDark ? 'text-slate-400' : 'text-slate-800'
        }`}>
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            <span>Digital Twin Layers</span>
          </span>
          <button
            onClick={() => setFocusTarget([0, 0, 0])}
            title="Reset View"
            className="text-[10px] text-slate-400 hover:text-sky-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <label
            className={`flex items-center justify-between p-1.5 rounded border cursor-pointer transition-colors ${
              isDark ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
              <span>Cadastral Parcels</span>
            </span>
            <input
              type="checkbox"
              checked={layerVisibility.parcels}
              onChange={() => toggleLayer('parcels')}
              className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
            />
          </label>

          <label
            className={`flex items-center justify-between p-1.5 rounded border cursor-pointer transition-colors ${
              isDark ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
              <span>3D Buildings & Floors</span>
            </span>
            <input
              type="checkbox"
              checked={layerVisibility.buildings}
              onChange={() => toggleLayer('buildings')}
              className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
            />
          </label>

          <label
            className={`flex items-center justify-between p-1.5 rounded border cursor-pointer transition-colors ${
              isDark ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
              <span>Translucent Subsurface</span>
            </span>
            <input
              type="checkbox"
              checked={translucentGround}
              onChange={(e) => setTranslucentGround(e.target.checked)}
              className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
            />
          </label>

          <label
            className={`flex items-center justify-between p-1.5 rounded border cursor-pointer transition-colors ${
              isDark ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
              <span>CMRL Metro Tunnel & Stn</span>
            </span>
            <input
              type="checkbox"
              checked={layerVisibility.metro}
              onChange={() => toggleLayer('metro')}
              className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
            />
          </label>

          <label
            className={`flex items-center justify-between p-1.5 rounded border cursor-pointer transition-colors ${
              isDark ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span>Water Pipelines</span>
            </span>
            <input
              type="checkbox"
              checked={layerVisibility.water}
              onChange={() => toggleLayer('water')}
              className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
            />
          </label>

          <label
            className={`flex items-center justify-between p-1.5 rounded border cursor-pointer transition-colors ${
              isDark ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-600" />
              <span>Sewerage Trunk</span>
            </span>
            <input
              type="checkbox"
              checked={layerVisibility.sewer}
              onChange={() => toggleLayer('sewer')}
              className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
            />
          </label>

          <label
            className={`flex items-center justify-between p-1.5 rounded border cursor-pointer transition-colors ${
              isDark ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              <span>3D Spatial Clashes</span>
            </span>
            <input
              type="checkbox"
              checked={layerVisibility.conflicts}
              onChange={() => toggleLayer('conflicts')}
              className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Section View / Vertical Cross Section Tool */}
      <div
        className={`p-2.5 rounded border space-y-2 ${
          isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className={`flex items-center justify-between text-[11px] font-bold ${
          isDark ? 'text-slate-100' : 'text-slate-900'
        }`}>
          <span className="flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-sky-600" />
            <span>Section View (Clipping)</span>
          </span>
          <input
            type="checkbox"
            checked={sectionPlaneActive}
            onChange={(e) => setSectionPlaneActive(e.target.checked)}
            className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
          />
        </div>

        {sectionPlaneActive && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className={isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}>Slice Axis:</span>
              <div className="flex gap-1">
                {(['x', 'y', 'z'] as const).map((ax) => (
                  <button
                    key={ax}
                    onClick={() => setSectionAxis(ax)}
                    className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] cursor-pointer ${
                      sectionAxis === ax
                        ? 'bg-sky-600 text-white shadow-xs'
                        : isDark
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-white border border-slate-300 text-slate-800 font-semibold'
                    }`}
                  >
                    {ax}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className={`flex justify-between text-[10px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                <span>Plane Offset:</span>
                <span className="text-sky-600 font-bold">{sectionPlaneOffset}m</span>
              </div>
              <input
                type="range"
                min="-150"
                max="150"
                value={sectionPlaneOffset}
                onChange={(e) => setSectionPlaneOffset(parseInt(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3D Measurement Tools */}
      <div
        className={`p-2.5 rounded border space-y-2 ${
          isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className={`text-[11px] font-bold flex items-center gap-1.5 ${
          isDark ? 'text-slate-100' : 'text-slate-900'
        }`}>
          <Ruler className="w-3.5 h-3.5 text-sky-600" />
          <span>3D Measurement Tool</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          {[
            { id: 'distance', label: 'Distance' },
            { id: 'height', label: 'Building Height' },
            { id: 'depth', label: 'Metro Depth' },
            { id: 'clearance', label: 'Pipe Clearance' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() =>
                setActiveMeasurementTool(
                  activeMeasurementTool === tool.id ? 'none' : (tool.id as any)
                )
              }
              className={`p-1.5 rounded text-left transition-colors border cursor-pointer ${
                activeMeasurementTool === tool.id
                  ? 'bg-sky-600 text-white border-sky-500 font-bold shadow-xs'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 shadow-xs font-semibold'
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>

        {activeMeasurementTool !== 'none' && (
          <div
            className={`p-2 rounded border text-[10px] space-y-0.5 ${
              isDark ? 'bg-black/40 border-slate-700 text-sky-300' : 'bg-white border-slate-200 text-sky-800 shadow-xs'
            }`}
          >
            <div>
              Active Metric:{' '}
              <strong className={isDark ? 'text-slate-100' : 'text-slate-900'}>
                {activeMeasurementTool === 'depth'
                  ? 'Metro Depth = 16.5 m'
                  : activeMeasurementTool === 'height'
                  ? 'Tower Height = 23.8 m'
                  : activeMeasurementTool === 'clearance'
                  ? 'Subsurface Clearance = 2.4 m'
                  : 'Horizontal Distance = 45.0 m'}
              </strong>
            </div>
            <div className={isDark ? 'text-slate-400' : 'text-slate-600'}>Projected UTM metric reference</div>
          </div>
        )}
      </div>

      {/* Wireframe toggle */}
      <label
        className={`flex items-center justify-between p-2 rounded border cursor-pointer text-[11px] ${
          isDark ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
        }`}
      >
        <span>CAD Wireframe Mode</span>
        <input
          type="checkbox"
          checked={wireframeMode}
          onChange={(e) => setWireframeMode(e.target.checked)}
          className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
        />
      </label>
    </div>
  );
};
