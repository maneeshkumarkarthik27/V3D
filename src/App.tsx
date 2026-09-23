import React, { useState, useEffect } from 'react';
import { V3DProvider, useV3D } from './state/useV3DStore';
import { Header } from './components/layout/Header';
import { LeftToolbar } from './components/layout/LeftToolbar';
import { ThreeScene } from './components/three/ThreeScene';
import { PropertyDetailPanel } from './components/property/PropertyDetailPanel';
import { TamilNaduGISMap } from './components/map/TamilNaduGISMap';
import { BlueprintStudio } from './components/blueprint/BlueprintStudio';
import { InfrastructurePanel } from './components/infrastructure/InfrastructurePanel';
import { IdentifierView } from './components/identifier/IdentifierView';
import { TaxPolicyView } from './components/tax/TaxPolicyView';
import { ValidationPanel } from './components/validation/ValidationPanel';
import { DemoStoryTour } from './components/demo/DemoStoryTour';
import { Sliders, Building, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, viewMode, theme } = useV3D();
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden select-none font-sans ${
        isDark ? 'dark bg-[#080d14] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <Header />

      <main className="flex-1 w-full h-full relative flex overflow-hidden">
        {currentView === 'twin' && (
          <div className="flex-1 w-full h-full flex overflow-hidden relative">
            {/* Desktop Left Toolbar */}
            <div className="hidden lg:flex h-full shrink-0">
              <LeftToolbar />
            </div>

            {/* Mobile Left Toolbar Drawer */}
            {showMobileTools && (
              <div className="fixed inset-0 z-40 lg:hidden flex">
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                  onClick={() => setShowMobileTools(false)}
                />
                <div className="relative z-50 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
                  <div className="absolute top-2 right-2 z-50">
                    <button
                      onClick={() => setShowMobileTools(false)}
                      className="p-1.5 rounded-full bg-slate-800 text-white hover:bg-slate-700 cursor-pointer shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <LeftToolbar />
                </div>
              </div>
            )}

            {/* Center Canvas Stage */}
            <div className="flex-1 w-full h-full flex overflow-hidden relative">
              {viewMode === '3d' ? (
                <ThreeScene />
              ) : (
                <div className="w-full h-full flex flex-col md:flex-row">
                  <div className={`w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <TamilNaduGISMap />
                  </div>
                  <div className="w-full md:w-1/2 h-1/2 md:h-full">
                    <ThreeScene />
                  </div>
                </div>
              )}

              {/* Mobile Floating Action Toggles for Tools and Property Details */}
              <div className="lg:hidden absolute bottom-4 right-4 z-30 flex items-center gap-2">
                <button
                  onClick={() => setShowMobileTools(!showMobileTools)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono font-bold shadow-lg border backdrop-blur transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-700 text-sky-400 hover:bg-slate-800'
                      : 'bg-white/95 border-slate-300 text-sky-700 hover:bg-slate-100 shadow-md'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Layers & Tools</span>
                </button>

                <button
                  onClick={() => setShowMobileDetails(!showMobileDetails)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono font-bold shadow-lg bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer"
                >
                  <Building className="w-4 h-4" />
                  <span>Property Details</span>
                </button>
              </div>
            </div>

            {/* Desktop Property Detail Panel */}
            <div className="hidden xl:flex h-full shrink-0">
              <PropertyDetailPanel />
            </div>

            {/* Mobile / Tablet Property Details Drawer */}
            {showMobileDetails && (
              <div className="fixed inset-0 z-40 xl:hidden flex justify-end">
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                  onClick={() => setShowMobileDetails(false)}
                />
                <div className="relative z-50 w-80 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-right duration-200">
                  <div className="absolute top-2 right-2 z-50">
                    <button
                      onClick={() => setShowMobileDetails(false)}
                      className="p-1.5 rounded-full bg-slate-800 text-white hover:bg-slate-700 cursor-pointer shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <PropertyDetailPanel />
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'map' && (
          <div className="flex-1 w-full h-full">
            <TamilNaduGISMap />
          </div>
        )}

        {currentView === 'blueprint' && (
          <div className="flex-1 w-full h-full">
            <BlueprintStudio />
          </div>
        )}

        {currentView === 'infrastructure' && (
          <div className="flex-1 w-full h-full">
            <InfrastructurePanel />
          </div>
        )}

        {currentView === 'identifier' && (
          <div className="flex-1 w-full h-full">
            <IdentifierView />
          </div>
        )}

        {currentView === 'tax' && (
          <div className="flex-1 w-full h-full">
            <TaxPolicyView />
          </div>
        )}

        {currentView === 'validation' && (
          <div className="flex-1 w-full h-full">
            <ValidationPanel />
          </div>
        )}
      </main>

      {/* Guided 3-Minute Evaluator Demonstration Tour */}
      <DemoStoryTour />
    </div>
  );
};

export default function App() {
  return (
    <V3DProvider>
      <MainLayout />
    </V3DProvider>
  );
}
