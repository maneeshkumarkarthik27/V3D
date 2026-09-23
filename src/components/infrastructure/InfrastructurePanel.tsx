import React from 'react';
import { useV3D } from '../../state/useV3DStore';
import { Layers, Train, Droplets, Waves, Zap, Wifi, Box, ShieldAlert, Eye } from 'lucide-react';

export const InfrastructurePanel: React.FC = () => {
  const {
    theme,
    layerVisibility,
    toggleLayer,
    translucentGround,
    setTranslucentGround,
    metroStation,
    metroTunnel,
    utilities,
    conflicts,
    setFocusTarget,
    setCurrentView,
  } = useV3D();

  const isDark = theme === 'dark';

  const handleFocusMetro = () => {
    setCurrentView('twin');
    setFocusTarget([0, -16.5, -45]);
  };

  const handleFocusWaterClash = () => {
    setCurrentView('twin');
    setFocusTarget([50, -4.5, 20]);
  };

  return (
    <div className={`w-full h-full flex flex-col select-none overflow-y-auto p-4 sm:p-6 font-mono transition-colors ${
      isDark ? 'bg-[#0b1118] text-slate-200' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3 ${
          isDark ? 'border-slate-800' : 'border-slate-300'
        }`}>
          <div>
            <h1 className={`text-base font-bold flex items-center gap-2 ${
              isDark ? 'text-slate-100' : 'text-slate-950'
            }`}>
              <Train className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              UNDERGROUND & METRO INFRASTRUCTURE DIGITAL TWIN
            </h1>
            <p className={`text-xs mt-0.5 font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              True 3D subsurface modeling with depth Z-coordinates, utility networks, and multi-tier transit corridors.
            </p>
          </div>

          <button
            onClick={handleFocusMetro}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> Inspect Underground Metro (Z: -16.5m)
          </button>
        </div>

        {/* Depth Stratigraphy Schematic Diagram */}
        <div className={`p-4 rounded-lg border shadow-xs space-y-3 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="text-xs font-bold uppercase tracking-wider flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className={isDark ? 'text-slate-200' : 'text-slate-900'}>Subsurface Stratigraphy & Utility Depth Allocation</span>
            <span className="text-cyan-700 dark:text-cyan-400 text-[11px] font-semibold">Taramani Regional Soil Profile (Alluvial Clay + Granulite)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <div className={`p-2.5 rounded border text-center ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-300'
            }`}>
              <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Surface (0m to -2m)</div>
              <div className="font-bold text-cyan-700 dark:text-cyan-300 mt-1">Telecom / Optical</div>
              <div className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>ELCOT 4-Way Duct</div>
            </div>

            <div className={`p-2.5 rounded border text-center ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-300'
            }`}>
              <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Depth (-2m to -3m)</div>
              <div className="font-bold text-amber-700 dark:text-amber-300 mt-1">Electrical 33kV</div>
              <div className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>TANGEDCO Feeder</div>
            </div>

            <div className={`p-2.5 rounded border text-center ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-300'
            }`}>
              <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Depth (-4m to -5m)</div>
              <div className="font-bold text-blue-700 dark:text-blue-400 mt-1">Water Transmission</div>
              <div className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ø600mm DI Pipe</div>
            </div>

            <div className={`p-2.5 rounded border text-center ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-300'
            }`}>
              <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Depth (-3m to -7m)</div>
              <div className={`font-bold mt-1 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Private Basements</div>
              <div className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>B-1 & B-2 Parking</div>
            </div>

            <div className={`p-2.5 rounded border text-center ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-300'
            }`}>
              <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Depth (-7m to -9m)</div>
              <div className="font-bold text-amber-600 dark:text-amber-500 mt-1">Sewerage Trunk</div>
              <div className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ø900mm Gravity Line</div>
            </div>

            <div className={`p-2.5 rounded border text-center ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-300'
            }`}>
              <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Deep Subsurface (-16m)</div>
              <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-1">CMRL Metro Rail</div>
              <div className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Corridor 4 Tunnel</div>
            </div>
          </div>
        </div>

        {/* 3D Layer Toggles & Utility Asset Registry */}
        <div className="grid grid-cols-12 gap-6">
          {/* Layer Toggles */}
          <div className="col-span-12 md:col-span-4 space-y-4">
            <div className={`p-4 rounded-lg border shadow-xs space-y-3 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
            }`}>
              <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className={isDark ? 'text-slate-200' : 'text-slate-900'}>3D Infrastructure Layers</span>
              </div>

              <div className="space-y-2 text-xs">
                <label className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-900 font-medium'
                }`}>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-500" />
                    <span>Translucent Ground Shading</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={translucentGround}
                    onChange={(e) => setTranslucentGround(e.target.checked)}
                    className="w-4 h-4 accent-sky-600 cursor-pointer"
                  />
                </label>

                <label className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-900 font-medium'
                }`}>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>CMRL Metro Tunnel & Stations</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.metro}
                    onChange={() => toggleLayer('metro')}
                    className="w-4 h-4 accent-sky-600 cursor-pointer"
                  />
                </label>

                <label className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-900 font-medium'
                }`}>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span>Water Transmission Main</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.water}
                    onChange={() => toggleLayer('water')}
                    className="w-4 h-4 accent-sky-600 cursor-pointer"
                  />
                </label>

                <label className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-900 font-medium'
                }`}>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-600" />
                    <span>Underground Sewerage Network</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.sewer}
                    onChange={() => toggleLayer('sewer')}
                    className="w-4 h-4 accent-sky-600 cursor-pointer"
                  />
                </label>

                <label className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-900 font-medium'
                }`}>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>33kV Underground Power Grid</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.electrical}
                    onChange={() => toggleLayer('electrical')}
                    className="w-4 h-4 accent-sky-600 cursor-pointer"
                  />
                </label>

                <label className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-900 font-medium'
                }`}>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span>3D Subsurface Clashes</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.conflicts}
                    onChange={() => toggleLayer('conflicts')}
                    className="w-4 h-4 accent-sky-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Clash Alert Box */}
            <div className={`p-4 rounded-lg border shadow-xs space-y-2 ${
              isDark ? 'bg-red-950/40 border-red-800/80' : 'bg-red-50 border-red-300'
            }`}>
              <div className={`flex items-center gap-2 font-bold text-xs ${
                isDark ? 'text-red-300' : 'text-red-900'
              }`}>
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Underground Conflict Detected</span>
              </div>
              <p className={`text-[11px] leading-tight font-medium ${
                isDark ? 'text-red-200' : 'text-red-950'
              }`}>
                VAL-002: Parcel B-024 structural retention piles clip public Ø600mm water main at -4.5m depth.
              </p>
              <button
                onClick={handleFocusWaterClash}
                className="w-full mt-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
              >
                Inspect Conflict in 3D →
              </button>
            </div>
          </div>

          {/* Asset Registry List */}
          <div className="col-span-12 md:col-span-8 space-y-3">
            <div className={`p-4 rounded-lg border shadow-xs space-y-3 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
            }`}>
              <div className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-200' : 'text-slate-900'
              }`}>
                Authorized Subsurface Infrastructure Assets
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Metro Station Card */}
                <div className={`p-3 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-300'
                }`}>
                  <div>
                    <div className={`flex items-center gap-2 font-bold ${
                      isDark ? 'text-slate-100' : 'text-slate-950'
                    }`}>
                      <Train className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>{metroStation.name}</span>
                    </div>
                    <div className={`text-[11px] mt-1 font-medium ${
                      isDark ? 'text-slate-400' : 'text-slate-700'
                    }`}>
                      Concourse: -8.0m | Platform: {metroStation.platformElevation}m | Dimensions: {metroStation.length}m × {metroStation.width}m
                    </div>
                    <div className={`text-[10px] mt-0.5 font-medium ${
                      isDark ? 'text-slate-500' : 'text-slate-600'
                    }`}>
                      4 Surface Access Portals | Connected to Parcels: {metroStation.connectedParcels.join(', ')}
                    </div>
                  </div>
                  <button
                    onClick={handleFocusMetro}
                    className={`px-3 py-1 rounded text-[11px] font-semibold border cursor-pointer shrink-0 self-start sm:self-auto ${
                      isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                    }`}
                  >
                    Focus
                  </button>
                </div>

                {/* Utilities Cards */}
                {utilities.map((util) => (
                  <div
                    key={util.infrastructureId}
                    className={`p-3 rounded border flex items-center justify-between ${
                      isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <div>
                      <div className={`flex items-center gap-2 font-bold ${
                        isDark ? 'text-slate-100' : 'text-slate-950'
                      }`}>
                        {util.type === 'WATER_MAIN' ? (
                          <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : util.type === 'SEWER_TRUNK' ? (
                          <Waves className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                        ) : util.type === 'ELECTRICAL_CONDUIT' ? (
                          <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <Wifi className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        )}
                        <span>{util.name}</span>
                      </div>
                      <div className={`text-[11px] mt-1 font-medium ${
                        isDark ? 'text-slate-400' : 'text-slate-700'
                      }`}>
                        Diameter: {util.diameterMm} mm | Material: {util.material} | Depth Z: {util.depthZ}m
                      </div>
                      <div className={`text-[10px] mt-0.5 font-medium ${
                        isDark ? 'text-slate-500' : 'text-slate-600'
                      }`}>
                        Source: {util.source} | Status:{' '}
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{util.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
