import React, { useState } from 'react';
import { useV3D } from '../../state/useV3DStore';
import { TaxRuleEngine } from '../../services/taxEngine';
import { PolicyEngine } from '../../services/policyEngine';
import { Landmark, FileCheck, Calculator, AlertCircle, ShieldCheck } from 'lucide-react';
import { PropertyType } from '../../types';

export const TaxPolicyView: React.FC = () => {
  const { parcels, buildings, theme } = useV3D();
  const isDark = theme === 'dark';

  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType>('COMMERCIAL');
  const [builtUpArea, setBuiltUpArea] = useState<number>(240);
  const [floorNumber, setFloorNumber] = useState<number>(3);
  const [selectedZone, setSelectedZone] = useState<string>('Transit Oriented Commercial');

  const taxAssessment = TaxRuleEngine.calculateAssessment({
    propertyId: 'V3D-SIM-TAX-01',
    propertyType: selectedPropertyType,
    builtUpAreaM2: builtUpArea,
    floorNumber,
    zone: selectedZone,
  });

  const policies = PolicyEngine.getPoliciesForProperty({
    propertyType: selectedPropertyType,
    heightMeters: 28,
    floorsCount: 7,
    zone: selectedZone,
    hasBasement: true,
    proximityToMetroMeters: 14,
  });

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
              <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>MUNICIPAL PROPERTY TAX & GOVERNMENT POLICY ENGINE</span>
            </h1>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Tamil Nadu Combined Development & Building Rules (TNCDBR 2019) + Urban Local Body Tax Assessment Simulator.
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded text-xs font-semibold ${
              isDark ? 'bg-slate-800 border border-slate-700 text-slate-300' : 'bg-white border border-slate-300 text-slate-800 shadow-xs'
            }`}
          >
            Greater Chennai Corporation / CMDA
          </div>
        </div>

        {/* Interactive Tax Assessment Simulator */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <div
              className={`p-4 rounded-xl border shadow-xs space-y-3 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
              }`}
            >
              <div
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isDark ? 'text-slate-300' : 'text-slate-900'
                }`}
              >
                <Calculator className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Tax Assessment Input Parameters</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    Property Usage Classification
                  </label>
                  <select
                    value={selectedPropertyType}
                    onChange={(e) => setSelectedPropertyType(e.target.value as PropertyType)}
                    className={`w-full px-3 py-2 border rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-200'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {['COMMERCIAL', 'RESIDENTIAL', 'INDUSTRIAL', 'GOVERNMENT', 'INSTITUTIONAL', 'PARKING'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    Cadastral Urban Zone
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className={`w-full px-3 py-2 border rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-200'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="Transit Oriented Commercial">Transit Oriented Commercial (OMR)</option>
                    <option value="IT Corridor Special Economic Zone">IT Corridor Special Economic Zone</option>
                    <option value="High-Density Residential">High-Density Residential</option>
                    <option value="Mixed Commercial & Public">Mixed Commercial & Public</option>
                  </select>
                </div>

                <div>
                  <div className={`flex justify-between text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                    <span>Built-up Carpet Area:</span>
                    <span className="text-sky-600 dark:text-sky-400 font-bold">{builtUpArea} m²</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="1500"
                    step="10"
                    value={builtUpArea}
                    onChange={(e) => setBuiltUpArea(parseInt(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className={`flex justify-between text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                    <span>Floor Level Index:</span>
                    <span className="text-sky-600 dark:text-sky-400 font-bold">{floorNumber < 0 ? `Basement ${floorNumber}` : `Floor ${floorNumber}`}</span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="15"
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(parseInt(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Assessment Result Card */}
            <div
              className={`p-4 rounded-xl border shadow-md space-y-3 ${
                isDark
                  ? 'bg-emerald-950/30 border-emerald-800/80'
                  : 'bg-emerald-50/80 border-emerald-300'
              }`}
            >
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex justify-between">
                <span>Calculated Prototype Assessment</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">FY 2025-2026</span>
              </div>

              <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                ₹ {taxAssessment.estimatedAnnualTax.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-slate-600 dark:text-slate-400">/ year</span>
              </div>

              <div
                className={`text-[11px] space-y-1 pt-2 border-t ${
                  isDark ? 'text-slate-300 border-emerald-900/60' : 'text-slate-700 border-emerald-200'
                }`}
              >
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Formula Rule:</span>
                  <span className="font-semibold">Area × Rate × Zone × Usage × Level</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Base Unit Rate:</span>
                  <span className="font-semibold">₹{taxAssessment.baseRatePerM2}/m²</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Usage Multiplier:</span>
                  <span className="font-semibold">
                    {(taxAssessment.estimatedAnnualTax / (builtUpArea * 85 * taxAssessment.zoneMultiplier * taxAssessment.floorMultiplier)).toFixed(2)}x
                  </span>
                </div>
              </div>

              <div
                className={`p-2.5 rounded text-[10px] leading-tight border ${
                  isDark
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-300/90'
                    : 'bg-amber-50 border-amber-200 text-amber-900 font-medium'
                }`}
              >
                Important: Prototype estimate based on urban local body valuation guidelines. Official demand is issued directly by Tamil Nadu Municipal Administration & Water Supply Department.
              </div>
            </div>
          </div>

          {/* Applicable Policies Table */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <div
              className={`p-4 rounded-xl border shadow-xs space-y-3 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
              }`}
            >
              <div
                className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                  isDark ? 'text-slate-300' : 'text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Applicable Government Rules & Statutory Policies</span>
                </div>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
                  {policies.length} Active Rules Evaluated
                </span>
              </div>

              <div className="space-y-3">
                {policies.map((pol) => (
                  <div
                    key={pol.policyId}
                    className={`p-3 rounded-lg border space-y-1.5 text-xs transition-colors ${
                      isDark
                        ? 'bg-slate-800/70 border-slate-700/80'
                        : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-600 dark:text-sky-400">{pol.policyId}</span>
                        <span className="text-slate-400">•</span>
                        <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {pol.authority}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pol.status === 'COMPLIANT'
                            ? isDark
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : pol.status === 'WARNING'
                            ? isDark
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isDark
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {pol.status}
                      </span>
                    </div>

                    <div className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
                      {pol.policyName}
                    </div>
                    <div
                      className={`text-[11px] p-2 rounded border leading-relaxed font-medium ${
                        isDark
                          ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      {pol.ruleExpression}
                    </div>

                    <div
                      className={`flex flex-wrap items-center justify-between gap-1 text-[10px] pt-1 ${
                        isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
                      }`}
                    >
                      <span>Source: {pol.sourceReference} (Effective: {pol.effectiveFrom})</span>
                      <span className={isDark ? 'text-slate-300 italic' : 'text-slate-700 italic font-medium'}>{pol.notes}</span>
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
