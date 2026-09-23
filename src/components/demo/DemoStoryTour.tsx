import React from 'react';
import { useV3D } from '../../state/useV3DStore';
import { Play, SkipForward, CheckCircle, Sparkles, X, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Step {
  title: string;
  actionDesc: string;
  targetView: string;
  runAction: (state: any) => void;
}

export const DemoStoryTour: React.FC = () => {
  const v3d = useV3D();
  const { showTour, setShowTour, tourStep, setTourStep, theme } = v3d;
  const isDark = theme === 'dark';

  if (!showTour) return null;

  const STEPS: Step[] = [
    {
      title: '1. Real Tamil Nadu GIS Map & Project Area',
      actionDesc: 'Navigates from Tamil Nadu State level down to Chennai Taramani OMR Transit Corridor.',
      targetView: 'map',
      runAction: (s) => {
        s.setCurrentView('map');
        s.setSelectedDistrict('chennai');
        s.setSelectedProjectArea('taramani-omr');
      },
    },
    {
      title: '2. 3D Cadastral Land Twin & Parcel Selection',
      actionDesc: 'Converts 2D cadastral parcels into 3D spatial terrain, selecting Parcel P-007 (Apex IT Tower).',
      targetView: 'twin',
      runAction: (s) => {
        s.setCurrentView('twin');
        s.setSelectedParcelId('P-007');
        s.setSelectedBuildingId('B-007');
        s.setFocusTarget([120, 10, -45]);
      },
    },
    {
      title: '3. Exploded Vertical Floor System',
      actionDesc: 'Separates floors vertically into the sky, revealing individual floor slabs, units, and structural volumes.',
      targetView: 'twin',
      runAction: (s) => {
        s.setCurrentView('twin');
        s.setExplodeFloorsValue(4.5);
        s.setSelectedFloorNumber(3);
      },
    },
    {
      title: '4. Candidate 3D ULPIN & Property Identity',
      actionDesc: 'Inspects composed Candidate Identifier (TN-CH-04-10107-A-F03-U02) and internal property volume.',
      targetView: 'identifier',
      runAction: (s) => {
        s.setCurrentView('identifier');
      },
    },
    {
      title: '5. Subsurface Metro & Underground Utilities',
      actionDesc: 'Activates translucent ground slice, revealing Chennai Metro Line 4 (-16.5m) and underground pipelines.',
      targetView: 'infrastructure',
      runAction: (s) => {
        s.setCurrentView('infrastructure');
        s.setTranslucentGround(true);
      },
    },
    {
      title: '6. 3D Collision Detection: Metro vs. Basement (VAL-001)',
      actionDesc: 'Executes automated 3D collision check, detecting critical clash between Metro tunnel and B-007 Basement -2.',
      targetView: 'validation',
      runAction: (s) => {
        s.setCurrentView('twin');
        s.setSelectedConflictId('VAL-001');
        s.setFocusTarget([120, -8.2, -45]);
      },
    },
    {
      title: '7. Blueprint to 3D Building Synthesis',
      actionDesc: 'AI analyzes architectural floorplan vectors and extrudes volumetric 3D building with unit boundaries.',
      targetView: 'blueprint',
      runAction: (s) => {
        s.setCurrentView('blueprint');
      },
    },
    {
      title: '8. Tax Assessment & TNCDBR 2019 Policies',
      actionDesc: 'Evaluates municipal tax estimation and statutory building regulations (CMRL influence zone & FSI limits).',
      targetView: 'tax',
      runAction: (s) => {
        s.setCurrentView('tax');
      },
    },
    {
      title: '9. Download Cadastral Dossier & Completion',
      actionDesc: 'Generates downloadable Property Template in JSON and CSV formats with full data provenance.',
      targetView: 'twin',
      runAction: (s) => {
        s.setCurrentView('twin');
        s.setExplodeFloorsValue(0);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      },
    },
  ];

  const currentStep = STEPS[tourStep] || STEPS[0];

  const handleNext = () => {
    if (tourStep < STEPS.length - 1) {
      const nextStep = tourStep + 1;
      setTourStep(nextStep);
      STEPS[nextStep].runAction(v3d);
    } else {
      setShowTour(false);
      setTourStep(0);
    }
  };

  const handlePrev = () => {
    if (tourStep > 0) {
      const prevStep = tourStep - 1;
      setTourStep(prevStep);
      STEPS[prevStep].runAction(v3d);
    }
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md sm:w-full backdrop-blur rounded-xl shadow-2xl p-4 font-mono transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 border ${
      isDark
        ? 'bg-slate-900/95 border-sky-500/80 text-slate-200'
        : 'bg-white/95 border-sky-600 text-slate-900 shadow-xl'
    }`}>
      <div className={`flex items-center justify-between pb-2 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span className={`text-xs font-bold uppercase tracking-wider ${
            isDark ? 'text-sky-300' : 'text-sky-800'
          }`}>
            3-Minute Evaluator Demonstration Tour
          </span>
        </div>
        <button
          onClick={() => setShowTour(false)}
          className={`p-1 transition-colors cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-3 space-y-2">
        <div className={`flex items-center justify-between text-[11px] font-medium ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <span>Step {tourStep + 1} of {STEPS.length}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{currentStep.targetView.toUpperCase()}</span>
        </div>

        <div className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{currentStep.title}</div>
        <p className={`text-xs leading-relaxed p-2.5 rounded border font-medium ${
          isDark
            ? 'bg-slate-950/60 border-slate-800 text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          {currentStep.actionDesc}
        </p>

        {tourStep === STEPS.length - 1 && (
          <div className={`p-2 rounded text-center text-xs font-bold border ${
            isDark
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
              : 'bg-emerald-100 border-emerald-400 text-emerald-900'
          }`}>
            "Volumetric property model generated."
          </div>
        )}
      </div>

      <div className={`flex items-center justify-between pt-2 border-t ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <button
          onClick={handlePrev}
          disabled={tourStep === 0}
          className={`px-3 py-1.5 rounded disabled:opacity-40 text-xs flex items-center gap-1 transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === tourStep ? 'bg-sky-500 scale-125' : i < tourStep ? 'bg-emerald-500' : isDark ? 'bg-slate-700' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-colors cursor-pointer"
        >
          <span>{tourStep === STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
