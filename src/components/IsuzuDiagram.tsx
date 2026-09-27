/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DamagePointState, DamageCode } from '../types/inspection';
import { Shield, Check, AlertCircle, Info, Edit2 } from 'lucide-react';
import isuzuSheetImg from '../assets/images/isuzu_sheet_1790332472745.jpg';

interface IsuzuDiagramProps {
  points: Record<string, DamagePointState>;
  onChangePoint: (partId: string, updated: Partial<DamagePointState>) => void;
  readOnly?: boolean;
}

const DAMAGE_LABELS: Record<DamageCode, string> = {
  D: 'Dent',
  S: 'Scratch',
  C: 'Chip',
  B: 'Broken',
  O: 'Other',
};

// Map each checklist checkbox to its percentage coordinates on the background image
const CHECKBOX_COORDINATES: Record<string, { left: string; top: string }> = {
  // Left Side
  'left_front_bumper': { left: '5.15%', top: '17.15%' },
  'left_headlights': { left: '5.15%', top: '20.75%' },
  'left_wheels_tyres': { left: '2.05%', top: '35.25%' },
  'left_door': { left: '34.85%', top: '14.15%' },
  'left_fender': { left: '36.55%', top: '18.05%' },
  'left_bed': { left: '47.95%', top: '18.05%' },
  'left_mirror': { left: '47.15%', top: '39.35%' },

  // Right Side
  'right_door': { left: '57.85%', top: '14.15%' },
  'right_fender': { left: '57.85%', top: '18.05%' },
  'right_bed': { left: '79.95%', top: '14.15%' },
  'right_mirror': { left: '87.05%', top: '18.05%' },

  // Front View
  'front_headlights': { left: '24.85%', top: '55.05%' },
  'front_bumper': { left: '2.05%', top: '71.05%' },
  'front_windshield': { left: '30.15%', top: '73.55%' },

  // Top View
  'top_windshield': { left: '21.35%', top: '46.95%' },
  'top_hood': { left: '22.65%', top: '52.05%' },
  'top_bed_inner': { left: '53.35%', top: '72.05%' },
  'top_roof': { left: '53.35%', top: '76.05%' },

  // Rear View
  'rear_tailgate': { left: '85.95%', top: '76.95%' },
  'rear_bumper': { left: '85.95%', top: '81.35%' },
  'rear_tail_lights': { left: '85.95%', top: '85.55%' },
};

// Map hotspot click triggers on the vehicle outlines themselves
const HOTSPOT_COORDINATES: Record<string, { left: string; top: string }> = {
  // Left Side Outlines
  'left_front_bumper': { left: '17.5%', top: '25.0%' },
  'left_headlights': { left: '18.0%', top: '21.0%' },
  'left_wheels_tyres': { left: '24.0%', top: '31.0%' }, // placed over wheels
  'left_door': { left: '31.0%', top: '22.0%' },
  'left_fender': { left: '23.5%', top: '24.5%' },
  'left_bed': { left: '43.0%', top: '24.5%' },
  'left_mirror': { left: '29.5%', top: '20.0%' },

  // Right Side Outlines
  'right_door': { left: '69.5%', top: '22.0%' },
  'right_fender': { left: '77.0%', top: '24.5%' },
  'right_bed': { left: '59.0%', top: '24.5%' },
  'right_mirror': { left: '71.0%', top: '20.0%' },

  // Front View Outlines
  'front_headlights': { left: '17.0%', top: '67.0%' },
  'front_bumper': { left: '20.5%', top: '73.5%' },
  'front_windshield': { left: '20.5%', top: '61.5%' },

  // Top View Outlines
  'top_windshield': { left: '41.5%', top: '51.5%' },
  'top_hood': { left: '37.0%', top: '51.5%' },
  'top_bed_inner': { left: '60.5%', top: '51.5%' },
  'top_roof': { left: '46.5%', top: '51.5%' },

  // Rear View Outlines
  'rear_tailgate': { left: '73.0%', top: '73.5%' },
  'rear_bumper': { left: '73.0%', top: '80.5%' },
  'rear_tail_lights': { left: '78.5%', top: '76.5%' },
};

export default function IsuzuDiagram({ points, onChangePoint, readOnly = false }: IsuzuDiagramProps) {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  const handleToggleDamageCode = (point: DamagePointState, code: DamageCode) => {
    let newDamages = [...point.damages];
    if (newDamages.includes(code)) {
      newDamages = newDamages.filter((c) => c !== code);
    } else {
      newDamages.push(code);
    }
    const newStatus = newDamages.length > 0 ? 'DAMAGE' : 'OK';
    onChangePoint(point.partId, { damages: newDamages, status: newStatus });
  };

  const handleMarkOk = (point: DamagePointState) => {
    onChangePoint(point.partId, { status: 'OK', damages: [], comments: '' });
    setSelectedPartId(null);
  };

  const handleSaveComments = (point: DamagePointState, val: string) => {
    onChangePoint(point.partId, { comments: val });
  };

  const selectedPoint = selectedPartId ? points[selectedPartId] : null;

  // Derive Checklist Category Statuses dynamically for rendering checks on the table
  const getCategoryStatus = (category: string): 'OK' | 'DEFECT' => {
    switch (category) {
      case 'wheels':
        return points['left_wheels_tyres'].status === 'DAMAGE' ? 'DEFECT' : 'OK';
      case 'lights':
        return (points['left_headlights'].status === 'DAMAGE' || 
                points['front_headlights'].status === 'DAMAGE' || 
                points['rear_tail_lights'].status === 'DAMAGE') ? 'DEFECT' : 'OK';
      case 'glass':
        return (points['front_windshield'].status === 'DAMAGE' || 
                points['top_windshield'].status === 'DAMAGE' || 
                points['left_mirror'].status === 'DAMAGE' || 
                points['right_mirror'].status === 'DAMAGE') ? 'DEFECT' : 'OK';
      case 'bodywork':
        return (points['left_front_bumper'].status === 'DAMAGE' || 
                points['left_door'].status === 'DAMAGE' || 
                points['left_fender'].status === 'DAMAGE' || 
                points['left_bed'].status === 'DAMAGE' || 
                points['right_door'].status === 'DAMAGE' || 
                points['right_fender'].status === 'DAMAGE' || 
                points['right_bed'].status === 'DAMAGE' || 
                points['top_hood'].status === 'DAMAGE' || 
                points['top_bed_inner'].status === 'DAMAGE' || 
                points['top_roof'].status === 'DAMAGE' || 
                points['rear_tailgate'].status === 'DAMAGE' || 
                points['rear_bumper'].status === 'DAMAGE') ? 'DEFECT' : 'OK';
      default:
        return 'OK';
    }
  };

  // Coordinates for the 6 rows of the Category Checklist table (OK and DEFECT columns)
  const CATEGORY_CHECKBOXES = [
    { key: 'wheels', top: '43.4%' },
    { key: 'lights', top: '47.5%' },
    { key: 'glass', top: '51.6%' },
    { key: 'bodywork', top: '55.7%' },
    { key: 'undercarriage', top: '59.8%' },
    { key: 'interior', top: '63.9%' },
  ];

  return (
    <div className="relative bg-slate-100 border border-slate-300 rounded-xl p-4 select-none">
      
      {/* Top Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 mb-4">
        <div>
          <h3 className="font-sans text-sm font-black text-slate-800 uppercase tracking-tight">Interactive Damage Report</h3>
          <p className="text-[10px] text-slate-500">Click any checkbox or bakkie hotspot on the actual document to log damages.</p>
        </div>
        <div className="flex gap-2">
          {Object.entries(DAMAGE_LABELS).map(([code, label]) => (
            <span key={code} className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
              <span className="font-bold text-red-600 font-mono bg-red-50 w-4 h-4 flex items-center justify-center rounded border border-red-100">{code}</span>
              <span>{label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Grid: interactive canvas vs editor */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* EXACT PRE-PRINTED DOCUMENT CANVAS - spans 8 columns */}
        <div className="xl:col-span-8 bg-white border border-slate-300 rounded-lg p-2 shadow-inner overflow-hidden flex flex-col justify-center">
          <div className="relative w-full aspect-[1920/1080] select-none rounded bg-white">
            
            {/* The Strict Template Document Image */}
            <img 
              src={isuzuSheetImg} 
              alt="Isuzu KB250 Vehicle Inspection Report"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            />

            {/* OVERLAY 1: Label Checkboxes printed next to labels on the diagram */}
            {Object.entries(CHECKBOX_COORDINATES).map(([partId, coords]) => {
              const point = points[partId];
              if (!point) return null;
              const isSelected = selectedPartId === partId;
              const isDamaged = point.status === 'DAMAGE';

              return (
                <button
                  key={`chk_${partId}`}
                  type="button"
                  disabled={readOnly}
                  onClick={() => setSelectedPartId(partId)}
                  style={{ left: coords.left, top: coords.top }}
                  className={`absolute w-[1.5%] h-[2.5%] flex items-center justify-center transition-all focus:outline-none cursor-pointer z-20 ${
                    isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50/70' : 'hover:bg-slate-100/50'
                  }`}
                  title={`Select ${point.label}`}
                >
                  {isDamaged ? (
                    <span className="text-[9px] font-black font-mono text-red-600 leading-none">
                      {point.damages[0] || '✗'}
                    </span>
                  ) : point.status === 'OK' ? (
                    <span className="text-[10px] font-extrabold text-emerald-600 leading-none">✓</span>
                  ) : null}
                </button>
              );
            })}

            {/* OVERLAY 2: Interactive Hotspots on the actual Truck Diagrams */}
            {Object.entries(HOTSPOT_COORDINATES).map(([partId, coords]) => {
              const point = points[partId];
              if (!point) return null;
              const isSelected = selectedPartId === partId;
              const isDamaged = point.status === 'DAMAGE';

              return (
                <button
                  key={`hot_${partId}`}
                  type="button"
                  disabled={readOnly}
                  onClick={() => setSelectedPartId(partId)}
                  style={{ left: coords.left, top: coords.top }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-[3%] h-[5%] rounded-full border flex items-center justify-center shadow transition-all hover:scale-110 cursor-pointer z-30 ${
                    isDamaged
                      ? 'bg-red-500/80 border-red-700 text-white animate-pulse'
                      : isSelected
                      ? 'bg-indigo-500/80 border-indigo-700 text-white ring-2 ring-indigo-300'
                      : 'bg-emerald-500/20 border-emerald-500/60 text-emerald-700 hover:bg-emerald-500/40'
                  }`}
                  title={point.label}
                >
                  {isDamaged ? (
                    <span className="text-[8px] font-mono font-bold">{point.damages[0] || '!'}</span>
                  ) : (
                    <Check className="w-2.5 h-2.5" />
                  )}
                </button>
              );
            })}

            {/* OVERLAY 3: Checklist Category Table (Right Columns - OK/DEFECT) */}
            {CATEGORY_CHECKBOXES.map((cat) => {
              const status = getCategoryStatus(cat.key);
              const isOk = status === 'OK';
              const isDefect = status === 'DEFECT';

              return (
                <React.Fragment key={`cat_${cat.key}`}>
                  {/* OK Column Checkbox (Left Box) */}
                  <div
                    style={{ left: '84.45%', top: cat.top }}
                    className="absolute w-[1.5%] h-[2.5%] flex items-center justify-center z-10"
                  >
                    {isOk && (
                      <span className="text-[11px] font-black text-emerald-600 leading-none">✓</span>
                    )}
                  </div>

                  {/* DEFECT Column Checkbox (Right Box) */}
                  <div
                    style={{ left: '96.9%', top: cat.top }}
                    className="absolute w-[1.5%] h-[2.5%] flex items-center justify-center z-10"
                  >
                    {isDefect && (
                      <span className="text-[11px] font-black text-red-600 leading-none">✗</span>
                    )}
                  </div>
                </React.Fragment>
              );
            })}

          </div>
        </div>

        {/* SIDE BAR EDITOR - spans 4 columns */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs h-full flex flex-col justify-between">
            {selectedPoint ? (
              <div className="flex flex-col h-full justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase">
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      {selectedPoint.label}
                    </span>
                    <span className="text-[9px] text-indigo-700 font-bold capitalize bg-indigo-50 px-2 py-0.5 rounded">
                      {selectedPoint.view} view
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Status Select */}
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1.5">Condition Status:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => handleMarkOk(selectedPoint)}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-[10px] font-bold rounded border transition-all ${
                            selectedPoint.status === 'OK'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          OK (Clean)
                        </button>
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => onChangePoint(selectedPoint.partId, { status: 'DAMAGE' })}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-[10px] font-bold rounded border transition-all ${
                            selectedPoint.status === 'DAMAGE'
                              ? 'bg-red-50 border-red-300 text-red-700 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Log Damage
                        </button>
                      </div>
                    </div>

                    {/* Damage Codes selection */}
                    {selectedPoint.status === 'DAMAGE' && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Damage Codes:</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(Object.keys(DAMAGE_LABELS) as DamageCode[]).map((code) => {
                            const active = selectedPoint.damages.includes(code);
                            return (
                              <button
                                key={code}
                                type="button"
                                disabled={readOnly}
                                onClick={() => handleToggleDamageCode(selectedPoint, code)}
                                className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold rounded border transition-all text-left ${
                                  active
                                    ? 'bg-red-50 border-red-300 text-red-700 shadow-sm'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                <span className={`w-3.5 h-3.5 flex items-center justify-center font-bold text-[9px] font-mono rounded ${
                                  active ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {code}
                                </span>
                                <span>{DAMAGE_LABELS[code]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Details Comments */}
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1">Details/Comments:</span>
                      <textarea
                        disabled={readOnly}
                        value={selectedPoint.comments}
                        onChange={(e) => handleSaveComments(selectedPoint, e.target.value)}
                        placeholder="Add specific damage, scratch or dent location details..."
                        rows={3}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  Changes made here automatically update the checkboxes and categories on the strictly printed template.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full py-16 text-slate-400 gap-2">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                  <Info className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide">No Part Selected</h4>
                  <p className="text-[11px] px-3 mt-1">
                    Click any hotspot circle or checkbox on the document image to start mapping details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
