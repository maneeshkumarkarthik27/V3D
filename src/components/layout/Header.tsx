import React from 'react';
import { useV3D } from '../../state/useV3DStore';
import { UserRole } from '../../types';
import {
  Box,
  Map,
  Cpu,
  Train,
  Hash,
  Landmark,
  ShieldAlert,
  Play,
  User,
  Layers,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    viewMode,
    setViewMode,
    userRole,
    setUserRole,
    isRealDataMode,
    setIsRealDataMode,
    setShowTour,
    setTourStep,
    conflicts,
    theme,
    setTheme,
  } = useV3D();

  const handleStartTour = () => {
    setTourStep(0);
    setShowTour(true);
  };

  const navItems = [
    { id: 'map', label: 'Tamil Nadu Map & 3D ULPIN', icon: Map },
    { id: 'twin', label: '3D Twin View', icon: Box },
    { id: 'blueprint', label: 'Blueprint → 3D', icon: Cpu },
    { id: 'infrastructure', label: 'Metro & Subsurface', icon: Train },
    { id: 'identifier', label: 'Candidate ULPIN', icon: Hash },
    { id: 'tax', label: 'Tax & Policy', icon: Landmark },
    {
      id: 'validation',
      label: '3D Validation',
      icon: ShieldAlert,
      badge: conflicts.length.toString(),
    },
  ];

  const isDark = theme === 'dark';

  return (
    <header
      className={`w-full border-b select-none z-30 font-mono transition-colors ${
        isDark ? 'bg-[#0c121b] border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
      }`}
    >
      {/* Top Utility Bar */}
      <div
        className={`flex items-center justify-between px-3 sm:px-4 py-2 border-b text-xs transition-colors gap-2 overflow-x-auto ${
          isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-slate-50 border-slate-300 text-slate-900'
        }`}
      >
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-xs text-xs shrink-0">
              TN
            </div>
            <div>
              <span className={`font-bold tracking-wider text-xs sm:text-sm ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                V3D CADASTRE
              </span>
              <span className={`text-[10px] ml-1.5 font-medium hidden lg:inline ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                TAMIL NADU 3D DIGITAL TWIN
              </span>
            </div>
          </div>
          <span className={`hidden sm:inline ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>|</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-mono hidden xl:inline border ${
              isDark
                ? 'bg-sky-950/80 text-sky-300 border-sky-800/60'
                : 'bg-sky-50 text-sky-900 border-sky-300 font-bold'
            }`}
          >
            SIH26011 • Candidate 3D ULPIN
          </span>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Light / Dark Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900 text-amber-300 border-slate-700 hover:bg-slate-800'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 shadow-xs'
            }`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
            <span className="hidden sm:inline">{isDark ? 'Dark UI' : 'Light UI'}</span>
          </button>

          {/* Real vs Synthetic Mode Badge */}
          <button
            onClick={() => setIsRealDataMode(!isRealDataMode)}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
              isRealDataMode
                ? isDark
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : isDark
                ? 'bg-amber-950/80 text-amber-300 border-amber-700 hover:bg-amber-900/60'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            {isRealDataMode ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            )}
            <span className="hidden md:inline">{isRealDataMode ? 'AUTHORIZED DATA' : 'DEMO MODE'}</span>
          </button>

          {/* User Role Selector */}
          <div
            className={`flex items-center gap-1 border rounded px-1.5 sm:px-2 py-1 text-[11px] ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
            }`}
          >
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent focus:outline-none cursor-pointer text-inherit max-w-[100px] sm:max-w-none text-xs"
            >
              <option value="PUBLIC_VIEWER">Public Viewer</option>
              <option value="SURVEYOR">Surveyor</option>
              <option value="ENGINEER">Engineer / GIS</option>
              <option value="MUNICIPAL_USER">Municipal Officer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Quick 3-Minute Demo Tour Launcher */}
          <button
            onClick={handleStartTour}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded text-[11px] font-bold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Play className="w-3 h-3 fill-white shrink-0" />
            <span className="hidden sm:inline">3-Min Tour</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-1.5 gap-2 overflow-x-auto">
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 scrollbar-none w-full sm:w-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs transition-all cursor-pointer font-medium whitespace-nowrap shrink-0 ${
                  isActive
                    ? isDark
                      ? 'bg-sky-600/30 text-sky-300 border border-sky-500/60 font-semibold'
                      : 'bg-sky-50 text-sky-900 border border-sky-400 font-bold shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100 font-semibold'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? (isDark ? 'text-sky-400' : 'text-sky-700') : isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-bold shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* View Mode Toggle (2D / 3D / Split) for twin */}
        {currentView === 'twin' && (
          <div
            className={`flex items-center border rounded p-0.5 text-[11px] ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'
            }`}
          >
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-700 hover:text-slate-950 font-semibold'
              }`}
            >
              3D
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-700 hover:text-slate-950 font-semibold'
              }`}
            >
              2D+3D Split
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
