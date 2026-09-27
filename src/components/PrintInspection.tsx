/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { InspectionRecord, CheckStatus } from '../types/inspection';
import { getVehicles, getDrivers } from '../lib/inspectionStorage';
import BASIXLogo from './BASIXLogo';
import { Printer, Download, Eye, ArrowLeft } from 'lucide-react';
import isuzuSheetImg from '../assets/images/isuzu_sheet_1790332472745.jpg';

interface PrintInspectionProps {
  record: InspectionRecord;
  onClose: () => void;
}

const CHECKLIST_ITEMS = {
  general: [
    { id: 'a', label: 'Driver’s license' },
    { id: 'b', label: 'Both license plates properly fitted' },
    { id: 'c', label: 'Reverse hooter (if fitted) working' },
    { id: 'd', label: 'Hooter working' },
    { id: 'e', label: 'Fire extinguisher fitted and checked' },
    { id: 'f', label: 'Emergency kit* (where applicable)' }
  ],
  lights: [
    { id: 'a', label: 'Strobe light fitted (if applicable) & ok' },
    { id: 'b', label: 'Front lights – ok' },
    { id: 'c', label: 'Rear lights – ok' },
    { id: 'd', label: 'Indicators back & front working' },
    { id: 'e', label: 'Brake lights working' },
    { id: 'f', label: 'License plate light working' }
  ],
  interior: [
    { id: 'a', label: 'Check foot brake' },
    { id: 'b', label: 'Hand brake / gear lever – in good order' },
    { id: 'c', label: 'Pedals in good condition' },
    { id: 'd', label: 'Seatbelts in good condition and working' },
    { id: 'e', label: 'All gauges in working order' }
  ],
  engine: [
    { id: 'a', label: 'Engine oil level' },
    { id: 'b', label: 'Check for oil leaks' },
    { id: 'c', label: 'Brake fluid level' },
    { id: 'd', label: 'Radiator filled and cap on' }
  ]
};

const WEEKLY_CHECKLIST = [
  { id: 'a', label: 'Tyre condition – sufficient tread' },
  { id: 'b', label: 'Tyre pressure checked' },
  { id: 'c', label: 'Wheel nuts / caps secure' },
  { id: 'd', label: 'Spare wheel condition and pressure – ok' },
  { id: 'e', label: 'Spanner & jack in good working order' },
  { id: 'f', label: 'Condition of vehicle / load bed – good' },
  { id: 'g', label: 'Condition of seats – good / adjustable' },
  { id: 'h', label: 'Windscreen undamaged' },
  { id: 'i', label: 'Windscreen wipers in good condition' },
  { id: 'j', label: 'Doors & windows in good condition' },
  { id: 'k', label: 'All mirrors adjustable & in good condition' },
  { id: 'l', label: 'No excessive play in steering' }
];

const FIRE_EXT_CHECKLIST = [
  { id: 'a', label: 'Mounted properly' },
  { id: 'b', label: 'Bracket in good condition' },
  { id: 'c', label: 'Regularly serviced' },
  { id: 'd', label: 'Plastic tie unbroken' },
  { id: 'e', label: 'Undamaged / unscratched' },
  { id: 'f', label: 'Nozzle ok' },
  { id: 'g', label: 'Hose condition ok' },
  { id: 'h', label: 'Couplings ok' },
  { id: 'i', label: 'Gauge – lens unbroken' },
  { id: 'j', label: 'Pointer present & working' },
  { id: 'k', label: 'Legible and dial not faded' }
];

const DAYS: ('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun')[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function PrintInspection({ record, onClose }: PrintInspectionProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const vehicles = getVehicles();
  const drivers = getDrivers();
  const vehicle = vehicles.find(v => v.id === record.vehicleId);
  const driver = drivers.find(d => d.id === record.driverId);

  const handleTriggerPrint = () => {
    window.print();
  };

  // Function to map status to printable string/icon
  const renderStatus = (status: CheckStatus) => {
    if (status === 'OK') return '✓';
    if (status === 'DEFECT') return '✗';
    if (status === 'NA') return 'N/A';
    return '';
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-12">
      {/* Header Controls (Hidden on Print) */}
      <div className="print:hidden bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-none">Print Preview &amp; Export</h2>
              <span className="text-[10px] text-slate-500 font-mono">Week of {record.weekStartingDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] hover:bg-[#152a61] text-white text-xs font-bold rounded-lg shadow transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Printable Area - Form replica */}
      <div className="max-w-4xl mx-auto px-4 py-8" ref={printAreaRef}>
        
        {/* Style block dedicated to forcing A4 layout on print */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
              font-size: 10px !important;
            }
            .print-container {
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
            }
            .page-break {
              page-break-after: always !important;
              break-after: page !important;
            }
          }
          @page {
            size: A4;
            margin: 1.2cm 1cm 1.2cm 1cm;
          }
        `}} />

        {/* PAGE 1: VEHICLE INSPECTION CHECKLIST (EI-008) */}
        <div className="print-container bg-white shadow-md border border-slate-300 rounded-lg p-8 mb-8 page-break text-xs text-slate-900 font-sans leading-normal">
          {/* Top layout */}
          <div className="flex items-center justify-between border border-black p-3 mb-4">
            <div className="flex items-center gap-2">
              <BASIXLogo className="h-10" />
            </div>
            <div className="text-center">
              <h1 className="text-base font-black tracking-wider text-black">VEHICLE INSPECTION</h1>
            </div>
            <div className="border-l border-black pl-4 text-center pr-2">
              <span className="font-bold block border-b border-black pb-1 text-xs">EI-008</span>
              <span className="text-[10px] block pt-1 text-slate-600 font-mono">Rev 02</span>
            </div>
          </div>

          {/* Registration Info Block */}
          <table className="w-full border-collapse border border-black text-center mb-4 text-[10px] table-fixed">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black">
                <td className="border-r border-black p-1.5 w-[16%]">Registration No.</td>
                <td className="border-r border-black p-1.5 w-[20%]">Vehicle Make/Model</td>
                <td className="border-r border-black p-1.5 w-[16%]">License Expiry Date</td>
                <td className="border-r border-black p-1.5 w-[16%]">Last Service Km's</td>
                <td className="border-r border-black p-1.5 w-[16%]">Last Service Date</td>
                <td className="p-1.5 w-[16%]">Next Service Km's</td>
              </tr>
            </thead>
            <tbody>
              <tr className="font-mono text-black font-semibold">
                <td className="border-r border-black p-1.5">{vehicle?.registrationNo || '—'}</td>
                <td className="border-r border-black p-1.5">{vehicle?.makeModel || '—'}</td>
                <td className="border-r border-black p-1.5">{vehicle?.licenseExpiryDate || '—'}</td>
                <td className="border-r border-black p-1.5">{vehicle?.lastServiceKms.toLocaleString() || '—'}</td>
                <td className="border-r border-black p-1.5">{vehicle?.lastServiceDate || '—'}</td>
                <td className="p-1.5">{vehicle?.nextServiceKms.toLocaleString() || '—'}</td>
              </tr>
            </tbody>
          </table>

          {/* Driver & Week Header */}
          <div className="flex justify-between items-center mb-4 border border-black p-2 text-[10px]">
            <div>
              <span className="font-bold">Driver Name:</span>{' '}
              <span className="underline font-semibold ml-1">{driver?.name || '—'}</span>
            </div>
            <div className="text-right">
              <span className="font-bold">Week Starting Date:</span>{' '}
              <span className="font-mono underline ml-1">{record.weekStartingDate}</span>
            </div>
          </div>

          {/* Daily Checks Columns Grid */}
          <table className="w-full border-collapse border border-black text-[9px] mb-4">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black text-center">
                <td className="border-r border-black p-1.5 text-left w-[44%] font-bold">In case of any defects, NCR to be submitted</td>
                <td className="border-r border-black p-1 w-[8%]">Mon</td>
                <td className="border-r border-black p-1 w-[8%]">Tue</td>
                <td className="border-r border-black p-1 w-[8%]">Wed</td>
                <td className="border-r border-black p-1 w-[8%]">Thu</td>
                <td className="border-r border-black p-1 w-[8%]">Fri</td>
                <td className="border-r border-black p-1 w-[8%]">Sat</td>
                <td className="p-1 w-[8%]">Sun</td>
              </tr>
            </thead>
            <tbody>
              {/* Row for specific Dates */}
              <tr className="border-b border-black text-center font-mono">
                <td className="border-r border-black p-1.5 text-left font-bold bg-slate-50">Date</td>
                {DAYS.map((day) => (
                  <td key={day} className="border-r last:border-r-0 border-black p-1 text-[8px]">
                    {record.daily[day]?.date ? record.daily[day].date.substring(5) : '—'}
                  </td>
                ))}
              </tr>

              {/* Row for Odometer */}
              <tr className="border-b border-black text-center font-mono">
                <td className="border-r border-black p-1.5 text-left font-bold bg-slate-50">Opening Km's</td>
                {DAYS.map((day) => (
                  <td key={day} className="border-r last:border-r-0 border-black p-1 text-[8px]">
                    {record.daily[day]?.openingKms || '—'}
                  </td>
                ))}
              </tr>

              {/* Section 1: General */}
              <tr className="bg-slate-100 font-bold border-b border-black">
                <td colSpan={8} className="p-1 pl-2 uppercase text-[8px] tracking-wider">1. General</td>
              </tr>
              {CHECKLIST_ITEMS.general.map((item) => (
                <tr key={item.id} className="border-b border-black/30 last:border-b border-black text-center">
                  <td className="border-r border-black p-1.5 text-left">
                    <span className="font-bold font-mono mr-1">{item.id})</span> {item.label}
                  </td>
                  {DAYS.map((day) => (
                    <td key={day} className="border-r last:border-r-0 border-black p-1 font-bold">
                      {renderStatus(record.daily[day]?.general[item.id as 'a'|'b'|'c'|'d'|'e'|'f'])}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Section 2: Lights */}
              <tr className="bg-slate-100 font-bold border-b border-black">
                <td colSpan={8} className="p-1 pl-2 uppercase text-[8px] tracking-wider">2. Lights</td>
              </tr>
              {CHECKLIST_ITEMS.lights.map((item) => (
                <tr key={item.id} className="border-b border-black/30 last:border-b border-black text-center">
                  <td className="border-r border-black p-1.5 text-left">
                    <span className="font-bold font-mono mr-1">{item.id})</span> {item.label}
                  </td>
                  {DAYS.map((day) => (
                    <td key={day} className="border-r last:border-r-0 border-black p-1 font-bold">
                      {renderStatus(record.daily[day]?.lights[item.id as 'a'|'b'|'c'|'d'|'e'|'f'])}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Section 3: Interior */}
              <tr className="bg-slate-100 font-bold border-b border-black">
                <td colSpan={8} className="p-1 pl-2 uppercase text-[8px] tracking-wider">3. Interior</td>
              </tr>
              {CHECKLIST_ITEMS.interior.map((item) => (
                <tr key={item.id} className="border-b border-black/30 last:border-b border-black text-center">
                  <td className="border-r border-black p-1.5 text-left">
                    <span className="font-bold font-mono mr-1">{item.id})</span> {item.label}
                  </td>
                  {DAYS.map((day) => (
                    <td key={day} className="border-r last:border-r-0 border-black p-1 font-bold">
                      {renderStatus(record.daily[day]?.interior[item.id as 'a'|'b'|'c'|'d'|'e'])}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Section 4: Engine */}
              <tr className="bg-slate-100 font-bold border-b border-black">
                <td colSpan={8} className="p-1 pl-2 uppercase text-[8px] tracking-wider">4. Engine</td>
              </tr>
              {CHECKLIST_ITEMS.engine.map((item) => (
                <tr key={item.id} className="border-b border-black/30 last:border-b border-black text-center">
                  <td className="border-r border-black p-1.5 text-left">
                    <span className="font-bold font-mono mr-1">{item.id})</span> {item.label}
                  </td>
                  {DAYS.map((day) => (
                    <td key={day} className="border-r last:border-r-0 border-black p-1 font-bold">
                      {renderStatus(record.daily[day]?.engine[item.id as 'a'|'b'|'c'|'d'])}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Signature Row */}
              <tr className="border-t border-black text-center font-semibold">
                <td className="border-r border-black p-1.5 text-left font-bold bg-slate-50">Signature</td>
                {DAYS.map((day) => (
                  <td key={day} className="border-r last:border-r-0 border-black p-1">
                    {record.daily[day]?.signature
                      ? <img src={record.daily[day].signature} alt="sig" className="h-6 w-full object-contain" />
                      : <span className="text-[8px] font-mono">—</span>}
                  </td>
                ))}
              </tr>

              {/* Time Row */}
              <tr className="border-t border-black text-center font-semibold">
                <td className="border-r border-black p-1.5 text-left font-bold bg-slate-50">Time</td>
                {DAYS.map((day) => (
                  <td key={day} className="border-r last:border-r-0 border-black p-1 text-[8px] font-mono">
                    {record.daily[day]?.time || '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* PAGE 1 LOWER: WEEKLY CHECK & FIRE EXTINGUISHER CHECK Side-By-Side */}
          <div className="grid grid-cols-2 gap-4 text-[8px]">
            {/* Column 1: Weekly Check */}
            <div className="border border-black p-2">
              <h3 className="font-bold border-b border-black pb-1 mb-1.5 uppercase text-[9px]">5. Weekly Check</h3>
              <table className="w-full">
                <tbody>
                  {WEEKLY_CHECKLIST.map((item) => {
                    const status = (record.weeklyCheck as any)[item.id] || 'OK';
                    return (
                      <tr key={item.id} className="border-b border-slate-200">
                        <td className="py-0.5 w-[85%]">
                          <span className="font-bold font-mono mr-1">{item.id})</span>
                          {item.label}
                        </td>
                        <td className="py-0.5 text-right font-bold font-mono">{renderStatus(status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Column 2: Fire Extinguisher Check */}
            <div className="border border-black p-2 flex flex-col justify-between">
              <div>
                <h3 className="font-bold border-b border-black pb-1 mb-1.5 uppercase text-[9px]">Fire Extinguisher Check</h3>
                <table className="w-full">
                  <tbody>
                    {FIRE_EXT_CHECKLIST.map((item) => {
                      const status = (record.fireExtinguisherCheck as any)[item.id] || 'OK';
                      return (
                        <tr key={item.id} className="border-b border-slate-200">
                          <td className="py-0.5 w-[85%]">
                            <span className="font-bold font-mono mr-1">{item.id})</span>
                            {item.label}
                          </td>
                          <td className="py-0.5 text-right font-bold font-mono">{renderStatus(status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Lower segment signature/date */}
              <div className="border-t border-black pt-2 mt-4 grid grid-cols-2 gap-2">
                <div>
                  <span className="block font-bold">Signature</span>
                  {record.weeklySignature
                    ? <img src={record.weeklySignature} alt="sig" className="h-8 w-full object-contain border-b border-slate-400 py-1" />
                    : <span className="block border-b border-slate-400 font-mono py-1">—</span>}
                </div>
                <div>
                  <span className="block font-bold">Date</span>
                  <span className="block border-b border-slate-400 font-mono py-1">{record.weeklySignatureDate || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Segment: Cross Check */}
          <div className="border border-black p-3 mt-4 flex items-center justify-between text-[9px]">
            <div className="flex-1">
              <span className="font-bold">Cross-checked By:</span>{' '}
              <span className="underline ml-1 font-semibold">{record.crossCheckedBy || '—'}</span>
            </div>
            <div className="flex-1 text-center">
              <span className="font-bold">Signature:</span>{' '}
              {record.crossCheckedSignature
                ? <img src={record.crossCheckedSignature} alt="sig" className="inline-block h-8 ml-1 object-contain" />
                : <span className="underline ml-1 font-mono">—</span>}
            </div>
            <div className="flex-1 text-right">
              <span className="font-bold">Date:</span>{' '}
              <span className="underline ml-1 font-mono">{record.crossCheckedDate || '—'}</span>
            </div>
          </div>
        </div>

        {/* PAGE 2: VEHICLE INSPECTION REPORT (Strict Image Template) */}
        <div className="print-container bg-white shadow-md border border-slate-300 rounded-lg p-0 page-break text-xs text-slate-900 font-sans leading-normal relative w-full aspect-[1920/1080] overflow-hidden">
          
          {/* Strictly used background template image */}
          <img 
            src={isuzuSheetImg} 
            alt="Isuzu KB250 Vehicle Inspection Report"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none"
          />

          {/* OVERLAY 1: Metadata Fields */}
          {/* Date */}
          <div style={{ left: '64%', top: '2.1%' }} className="absolute text-[12px] font-bold font-mono text-slate-900 tracking-wider">
            {record.damageDate || record.weekStartingDate}
          </div>
          {/* Inspector */}
          <div style={{ left: '68.5%', top: '7.5%' }} className="absolute text-[12px] font-bold text-slate-900 tracking-wide">
            {record.damageInspector || '—'}
          </div>
          {/* Odometer */}
          <div style={{ left: '86.5%', top: '2.1%' }} className="absolute text-[12px] font-bold font-mono text-slate-900 tracking-wider">
            {record.damageOdometer ? `${Number(record.damageOdometer).toLocaleString()}` : '—'}
          </div>
          {/* Reg. No. */}
          <div style={{ left: '85.2%', top: '7.5%' }} className="absolute text-[12px] font-bold font-mono text-slate-900 tracking-wider">
            {vehicle?.registrationNo || '—'}
          </div>

          {/* OVERLAY 2: Diagram Checkboxes next to each label */}
          {Object.entries({
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
          }).map(([partId, coords]) => {
            const point = record.damagePoints[partId];
            if (!point) return null;
            const isDamaged = point.status === 'DAMAGE';

            return (
              <div
                key={`chk_print_${partId}`}
                style={{ left: coords.left, top: coords.top }}
                className="absolute w-[1.5%] h-[2.5%] flex items-center justify-center text-[10px] font-black leading-none"
              >
                {isDamaged ? (
                  <span className="text-red-700 font-mono font-black">{point.damages[0] || '✗'}</span>
                ) : (
                  <span className="text-emerald-700 font-extrabold">✓</span>
                )}
              </div>
            );
          })}

          {/* OVERLAY 3: Visual Hotspot markers printed on bakkie layouts */}
          {Object.entries({
            // Left Side
            'left_front_bumper': { left: '17.5%', top: '25.0%' },
            'left_headlights': { left: '18.0%', top: '21.0%' },
            'left_wheels_tyres': { left: '24.0%', top: '31.0%' },
            'left_door': { left: '31.0%', top: '22.0%' },
            'left_fender': { left: '23.5%', top: '24.5%' },
            'left_bed': { left: '43.0%', top: '24.5%' },
            'left_mirror': { left: '29.5%', top: '20.0%' },
            // Right Side
            'right_door': { left: '69.5%', top: '22.0%' },
            'right_fender': { left: '77.0%', top: '24.5%' },
            'right_bed': { left: '59.0%', top: '24.5%' },
            'right_mirror': { left: '71.0%', top: '20.0%' },
            // Front View
            'front_headlights': { left: '17.0%', top: '67.0%' },
            'front_bumper': { left: '20.5%', top: '73.5%' },
            'front_windshield': { left: '20.5%', top: '61.5%' },
            // Top View
            'top_windshield': { left: '41.5%', top: '51.5%' },
            'top_hood': { left: '37.0%', top: '51.5%' },
            'top_bed_inner': { left: '60.5%', top: '51.5%' },
            'top_roof': { left: '46.5%', top: '51.5%' },
            // Rear View
            'rear_tailgate': { left: '73.0%', top: '73.5%' },
            'rear_bumper': { left: '73.0%', top: '80.5%' },
            'rear_tail_lights': { left: '78.5%', top: '76.5%' },
          }).map(([partId, coords]) => {
            const point = record.damagePoints[partId];
            if (!point || point.status !== 'DAMAGE') return null;

            return (
              <div
                key={`hot_print_${partId}`}
                style={{ left: coords.left, top: coords.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-[2%] h-[3.5%] rounded-full bg-red-600 border border-red-800 text-white flex items-center justify-center font-mono font-extrabold text-[8px] shadow-sm"
              >
                {point.damages[0] || '!'}
              </div>
            );
          })}

          {/* OVERLAY 4: Checklist Category Summary (Right Column - OK vs DEFECT checkboxes) */}
          {[
            { key: 'wheels', top: '43.4%', isDefect: record.damagePoints['left_wheels_tyres'].status === 'DAMAGE' },
            { key: 'lights', top: '47.5%', isDefect: (record.damagePoints['left_headlights'].status === 'DAMAGE' || record.damagePoints['front_headlights'].status === 'DAMAGE' || record.damagePoints['rear_tail_lights'].status === 'DAMAGE') },
            { key: 'glass', top: '51.6%', isDefect: (record.damagePoints['front_windshield'].status === 'DAMAGE' || record.damagePoints['top_windshield'].status === 'DAMAGE' || record.damagePoints['left_mirror'].status === 'DAMAGE' || record.damagePoints['right_mirror'].status === 'DAMAGE') },
            { key: 'bodywork', top: '55.7%', isDefect: (record.damagePoints['left_front_bumper'].status === 'DAMAGE' || record.damagePoints['left_door'].status === 'DAMAGE' || record.damagePoints['left_fender'].status === 'DAMAGE' || record.damagePoints['left_bed'].status === 'DAMAGE' || record.damagePoints['right_door'].status === 'DAMAGE' || record.damagePoints['right_fender'].status === 'DAMAGE' || record.damagePoints['right_bed'].status === 'DAMAGE' || record.damagePoints['top_hood'].status === 'DAMAGE' || record.damagePoints['top_bed_inner'].status === 'DAMAGE' || record.damagePoints['top_roof'].status === 'DAMAGE' || record.damagePoints['rear_tailgate'].status === 'DAMAGE' || record.damagePoints['rear_bumper'].status === 'DAMAGE') },
            { key: 'undercarriage', top: '59.8%', isDefect: false },
            { key: 'interior', top: '63.9%', isDefect: false },
          ].map((cat) => (
            <React.Fragment key={`cat_print_${cat.key}`}>
              {/* Left Column (OK) Check */}
              <div
                style={{ left: '84.45%', top: cat.top }}
                className="absolute w-[1.5%] h-[2.5%] flex items-center justify-center text-[11px] font-black leading-none text-emerald-800"
              >
                {!cat.isDefect && '✓'}
              </div>

              {/* Right Column (DEFECT) Check */}
              <div
                style={{ left: '96.9%', top: cat.top }}
                className="absolute w-[1.5%] h-[2.5%] flex items-center justify-center text-[11px] font-black leading-none text-red-800"
              >
                {cat.isDefect && '✗'}
              </div>
            </React.Fragment>
          ))}

        </div>
      </div>
    </div>
  );
}
