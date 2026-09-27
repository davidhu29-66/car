/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InspectionRecord, CheckStatus, DailyCheckRow, DamagePointState, WeeklyCheckRow, FireExtinguisherCheckRow } from '../types/inspection';
import { getVehicles, getDrivers } from '../lib/inspectionStorage';
import IsuzuDiagram from './IsuzuDiagram';
import SignaturePad from './SignaturePad';
import { Shield, Check, AlertTriangle, Calendar, Clock, User, Eye, Save, Plus, ArrowLeft, ClipboardList, PenTool, CheckCircle, AlertOctagon, Flame } from 'lucide-react';

interface InspectionFormProps {
  record: InspectionRecord;
  onSave: (updated: InspectionRecord) => void;
  onCancel: () => void;
}

const CHECKLIST_STRUCTURE = {
  general: {
    title: '1. General',
    items: [
      { id: 'a', label: 'Driver’s license' },
      { id: 'b', label: 'Both license plates properly fitted' },
      { id: 'c', label: 'Reverse hooter (if fitted) working' },
      { id: 'd', label: 'Hooter working' },
      { id: 'e', label: 'Fire extinguisher fitted and checked' },
      { id: 'f', label: 'Emergency kit* (first aid, triangles, jumper cables, tow rope, etc.)' },
    ]
  },
  lights: {
    title: '2. Lights',
    items: [
      { id: 'a', label: 'Strobe light fitted (if applicable) & ok' },
      { id: 'b', label: 'Front lights – ok' },
      { id: 'c', label: 'Rear lights – ok' },
      { id: 'd', label: 'Indicators back & front working' },
      { id: 'e', label: 'Brake lights working' },
      { id: 'f', label: 'License plate light working' },
    ]
  },
  interior: {
    title: '3. Interior',
    items: [
      { id: 'a', label: 'Check foot brake' },
      { id: 'b', label: 'Hand brake / gear lever – in good order' },
      { id: 'c', label: 'Pedals in good condition' },
      { id: 'd', label: 'Seatbelts in good condition and working' },
      { id: 'e', label: 'All gauges in working order' },
    ]
  },
  engine: {
    title: '4. Engine',
    items: [
      { id: 'a', label: 'Engine oil level' },
      { id: 'b', label: 'Check for oil leaks' },
      { id: 'c', label: 'Brake fluid level' },
      { id: 'd', label: 'Radiator filled and cap on' },
    ]
  }
};

const WEEK_DAYS: { key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'; label: string }[] = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

const WEEK_ITEMS = [
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
  { id: 'l', label: 'No excessive play in steering' },
];

const FIRE_EXT_ITEMS = [
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
  { id: 'k', label: 'Legible and dial not faded' },
];

export default function InspectionForm({ record, onSave, onCancel }: InspectionFormProps) {
  const [formData, setFormData] = useState<InspectionRecord>({ ...record });
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'damage'>('daily');
  const [activeDay, setActiveDay] = useState<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'>('mon');

  const vehicles = getVehicles();
  const drivers = getDrivers();
  const currentVehicle = vehicles.find((v) => v.id === formData.vehicleId);
  const currentDriver = drivers.find((d) => d.id === formData.driverId);

  const handleSave = () => {
    onSave({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
  };

  // Update specific daily check value
  const handleDailyCheckChange = (
    day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
    section: 'general' | 'lights' | 'interior' | 'engine',
    itemId: string,
    value: CheckStatus
  ) => {
    const dailyRow = { ...formData.daily[day] };
    const sectionData = { ...dailyRow[section] } as any;
    sectionData[itemId] = value;
    
    setFormData({
      ...formData,
      daily: {
        ...formData.daily,
        [day]: {
          ...dailyRow,
          [section]: sectionData,
        }
      }
    });
  };

  // Update metadata for daily row (km, time, signature, date)
  const handleDailyMetaChange = (
    day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
    field: 'openingKms' | 'signature' | 'time' | 'date',
    value: string
  ) => {
    setFormData({
      ...formData,
      daily: {
        ...formData.daily,
        [day]: {
          ...formData.daily[day],
          [field]: value,
        }
      }
    });
  };

  // Helper to mark all daily items for active day as OK
  const handleMarkAllOkToday = () => {
    const day = activeDay;
    const currentDayRow = formData.daily[day];
    
    // Set all sub-items to OK
    const updatedGeneral = { ...currentDayRow.general };
    Object.keys(updatedGeneral).forEach((k) => (updatedGeneral[k as keyof typeof updatedGeneral] = 'OK'));
    
    const updatedLights = { ...currentDayRow.lights };
    Object.keys(updatedLights).forEach((k) => (updatedLights[k as keyof typeof updatedLights] = 'OK'));

    const updatedInterior = { ...currentDayRow.interior };
    Object.keys(updatedInterior).forEach((k) => (updatedInterior[k as keyof typeof updatedInterior] = 'OK'));

    const updatedEngine = { ...currentDayRow.engine };
    Object.keys(updatedEngine).forEach((k) => (updatedEngine[k as keyof typeof updatedEngine] = 'OK'));

    setFormData({
      ...formData,
      daily: {
        ...formData.daily,
        [day]: {
          ...currentDayRow,
          general: updatedGeneral,
          lights: updatedLights,
          interior: updatedInterior,
          engine: updatedEngine,
          time: currentDayRow.time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          signature: currentDayRow.signature || currentDriver?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'JP',
        }
      }
    });
  };

  // Update weekly checklists
  const handleWeeklyItemChange = (itemId: string, value: CheckStatus) => {
    setFormData({
      ...formData,
      weeklyCheck: {
        ...formData.weeklyCheck,
        [itemId]: value,
      }
    });
  };

  const handleFireExtItemChange = (itemId: string, value: CheckStatus) => {
    setFormData({
      ...formData,
      fireExtinguisherCheck: {
        ...formData.fireExtinguisherCheck,
        [itemId]: value,
      }
    });
  };

  const handleDamagePointChange = (partId: string, updated: Partial<DamagePointState>) => {
    setFormData({
      ...formData,
      damagePoints: {
        ...formData.damagePoints,
        [partId]: {
          ...formData.damagePoints[partId],
          ...updated,
        }
      }
    });
  };

  // Highlight status cell style helper
  const getStatusButtonClass = (isActive: boolean, type: CheckStatus) => {
    if (!isActive) return 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50';
    switch (type) {
      case 'OK':
        return 'bg-emerald-500 border-emerald-600 text-white font-semibold';
      case 'DEFECT':
        return 'bg-red-500 border-red-600 text-white font-semibold animate-pulse';
      case 'NA':
        return 'bg-slate-400 border-slate-500 text-white font-semibold';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4">
      {/* Back & Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">EI-008 Rev 02</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${formData.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {formData.isCompleted ? 'Finalized' : 'Draft / Active'}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Vehicle Inspection Report Manager
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Complete Checklist Switch */}
          <label className="flex items-center gap-2 cursor-pointer bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={formData.isCompleted}
              onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
              className="rounded text-[#1E3A8A] focus:ring-[#1E3A8A] w-4 h-4"
            />
            <span>Finalize &amp; Lock Inspection</span>
          </label>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#152a61] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer w-full md:w-auto justify-center"
          >
            <Save className="w-4 h-4" />
            Save Checklist
          </button>
        </div>
      </div>

      {/* Fleet Context Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-slate-900 text-white rounded-xl p-4 mb-6 shadow-sm">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Registration No</span>
          <span className="text-sm font-black font-mono tracking-wide">{currentVehicle?.registrationNo}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Vehicle Model</span>
          <span className="text-sm font-bold truncate block">{currentVehicle?.makeModel}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Driver Name</span>
          <span className="text-sm font-bold truncate block">{currentDriver?.name}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Week Starting</span>
          <span className="text-sm font-mono flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formData.weekStartingDate}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Next Service due</span>
          <span className="text-sm font-mono text-amber-300">{currentVehicle?.nextServiceKms.toLocaleString()} Km</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">License Expiry</span>
          <span className="text-sm font-mono text-red-300">{currentVehicle?.licenseExpiryDate}</span>
        </div>
      </div>

      {/* Sub tabs switcher */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg mb-6 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
            activeTab === 'daily'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Daily Checklists (Mon-Sun)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
            activeTab === 'weekly'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Weekly &amp; Fire Ext.
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('damage')}
          className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
            activeTab === 'damage'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PenTool className="w-4 h-4" />
          Isuzu Damage Map
        </button>
      </div>

      {/* TAB 1: DAILY CHECKS */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Day selection slider */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {WEEK_DAYS.map((day) => {
              const row = formData.daily[day.key];
              const hasDefect =
                Object.values(row.general).includes('DEFECT') ||
                Object.values(row.lights).includes('DEFECT') ||
                Object.values(row.interior).includes('DEFECT') ||
                Object.values(row.engine).includes('DEFECT');
              
              const isFilled = row.signature && row.openingKms;

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setActiveDay(day.key)}
                  className={`py-3 px-2 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    activeDay === day.key
                      ? 'border-[#1E3A8A] bg-slate-50 ring-2 ring-blue-100 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-extrabold text-slate-800">{day.label}</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-1">{row.date || 'No Date'}</span>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      hasDefect
                        ? 'bg-red-100 text-red-800 animate-pulse'
                        : isFilled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {hasDefect ? 'DEFECT' : isFilled ? 'Filled' : 'Empty'}
                    </span>
                    {isFilled && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Day Daily Check Board */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 capitalize">
                  {activeDay} Daily Check details
                </h2>
                <p className="text-xs text-slate-500">
                  Fill out opening odometer, signature, and verify each checklist item.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleMarkAllOkToday}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-extrabold rounded-md transition-all cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Mark All OK for Today
                </button>
              </div>
            </div>

            {/* Active Day Metadata Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1">Check Date</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formData.daily[activeDay].date}
                    onChange={(e) => handleDailyMetaChange(activeDay, 'date', e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E3A8A] outline-none text-slate-700 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1">Opening Odometer (Km)</label>
                <input
                  type="number"
                  placeholder="e.g. 148520"
                  value={formData.daily[activeDay].openingKms}
                  onChange={(e) => handleDailyMetaChange(activeDay, 'openingKms', e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E3A8A] outline-none text-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1">Check Time</label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. 07:30"
                    value={formData.daily[activeDay].time}
                    onChange={(e) => handleDailyMetaChange(activeDay, 'time', e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E3A8A] outline-none text-slate-700 font-mono"
                  />
                </div>
              </div>
              <div>
                <SignaturePad
                  label="Driver Signature"
                  value={formData.daily[activeDay].signature}
                  onChange={(val) => handleDailyMetaChange(activeDay, 'signature', val)}
                  height={100}
                />
              </div>
            </div>

            {/* Checklist Grid */}
            <div className="space-y-6">
              {Object.entries(CHECKLIST_STRUCTURE).map(([sectionKey, section]) => {
                const dayRowSection = formData.daily[activeDay][sectionKey as 'general' | 'lights' | 'interior' | 'engine'] as any;
                
                return (
                  <div key={sectionKey} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                      <h3 className="font-sans text-xs font-extrabold text-slate-700 uppercase tracking-wider">{section.title}</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {section.items.map((item) => {
                        const status: CheckStatus = dayRowSection[item.id] || 'OK';
                        return (
                          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:py-2.5 sm:px-4 gap-3 hover:bg-slate-50/50 transition-colors">
                            <span className="text-xs text-slate-700 flex items-start gap-2">
                              <span className="font-mono font-bold text-slate-400">{item.id})</span>
                              <span>{item.label}</span>
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                              {(['OK', 'DEFECT', 'NA'] as CheckStatus[]).map((type) => {
                                const active = status === type;
                                return (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleDailyCheckChange(
                                      activeDay,
                                      sectionKey as 'general' | 'lights' | 'interior' | 'engine',
                                      item.id,
                                      type
                                    )}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-md border transition-all ${getStatusButtonClass(active, type)}`}
                                  >
                                    {type}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Minor non-conformance comments block */}
            <div className="mt-6 border-t border-slate-100 pt-6">
              <span className="text-xs font-bold text-slate-700 uppercase block mb-2">Defect reports &amp; NCR logs for {activeDay}</span>
              {Object.entries(CHECKLIST_STRUCTURE).some(([sectionKey, section]) => {
                const dayRowSection = formData.daily[activeDay][sectionKey as 'general' | 'lights' | 'interior' | 'engine'] as any;
                return Object.values(dayRowSection).includes('DEFECT');
              }) ? (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex gap-3">
                  <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold text-red-900">Active Defect Found!</h4>
                    <p className="text-xs text-red-700 mt-0.5">
                      You have flagged an issue. Please make sure to describe it on the <b>Isuzu Damage Map</b> or log details below for the Fleet Manager’s NCR submission.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic bg-slate-50 px-3 py-2.5 rounded border border-slate-100">
                  No daily defects active. All inspected items are clear.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY & FIRE EXTINGUISHER CHECKS */}
      {activeTab === 'weekly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly checks */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-200 pb-3 mb-4">
                <h2 className="text-sm font-black text-slate-900 uppercase">5. Weekly Check</h2>
                <p className="text-xs text-slate-500">Must be filled in once a week. Check components and log status.</p>
              </div>

              <div className="space-y-2.5">
                {WEEK_ITEMS.map((item) => {
                  const status = (formData.weeklyCheck as any)[item.id] || 'OK';
                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 border border-slate-100 rounded-md hover:bg-slate-50/50 gap-2">
                      <span className="text-xs text-slate-700 flex items-start gap-1.5">
                        <span className="font-mono font-bold text-slate-400">{item.id})</span>
                        <span>{item.label}</span>
                      </span>
                      <div className="flex gap-1">
                        {(['OK', 'DEFECT', 'NA'] as CheckStatus[]).map((type) => {
                          const active = status === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleWeeklyItemChange(item.id, type)}
                              className={`px-2 py-0.5 text-[9px] font-bold rounded border transition-all ${getStatusButtonClass(active, type)}`}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <SignaturePad
                  label="Weekly Signature"
                  value={formData.weeklySignature}
                  onChange={(val) => setFormData({ ...formData, weeklySignature: val })}
                  height={100}
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1">Date</label>
                <input
                  type="date"
                  value={formData.weeklySignatureDate}
                  onChange={(e) => setFormData({ ...formData, weeklySignatureDate: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#1E3A8A] outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Fire Extinguisher Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase">Fire Extinguisher Check</h2>
                  <p className="text-xs text-slate-500">Inspect the vehicle’s fire extinguisher and brackets.</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {FIRE_EXT_ITEMS.map((item) => {
                  const status = (formData.fireExtinguisherCheck as any)[item.id] || 'OK';
                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 border border-slate-100 rounded-md hover:bg-slate-50/50 gap-2">
                      <span className="text-xs text-slate-700 flex items-start gap-1.5">
                        <span className="font-mono font-bold text-slate-400">{item.id})</span>
                        <span>{item.label}</span>
                      </span>
                      <div className="flex gap-1">
                        {(['OK', 'DEFECT', 'NA'] as CheckStatus[]).map((type) => {
                          const active = status === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleFireExtItemChange(item.id, type)}
                              className={`px-2 py-0.5 text-[9px] font-bold rounded border transition-all ${getStatusButtonClass(active, type)}`}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1">Cross-checked By</label>
                <input
                  type="text"
                  placeholder="Manager's Name"
                  value={formData.crossCheckedBy}
                  onChange={(e) => setFormData({ ...formData, crossCheckedBy: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                />
              </div>
             <div>
                <SignaturePad
                  label="Manager Signature"
                  value={formData.crossCheckedSignature}
                  onChange={(val) => setFormData({ ...formData, crossCheckedSignature: val })}
                  height={100}
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1">Crosscheck Date</label>
                <input
                  type="date"
                  value={formData.crossCheckedDate}
                  onChange={(e) => setFormData({ ...formData, crossCheckedDate: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-[#1E3A8A] outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VISUAL DAMAGE MAP */}
      {activeTab === 'damage' && (
        <div className="space-y-6">
          {/* Metadata for Visual damage reports */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1">Damage Date</label>
              <input
                type="date"
                value={formData.damageDate}
                onChange={(e) => setFormData({ ...formData, damageDate: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#1E3A8A] font-mono text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1">Inspector / Assessor</label>
              <input
                type="text"
                placeholder="e.g. Sipho Ndlovu"
                value={formData.damageInspector}
                onChange={(e) => setFormData({ ...formData, damageInspector: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#1E3A8A] text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1">Odometer Km</label>
              <input
                type="number"
                placeholder="e.g. 148520"
                value={formData.damageOdometer}
                onChange={(e) => setFormData({ ...formData, damageOdometer: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#1E3A8A] font-mono text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1">Damages Odometer Comments</label>
              <input
                type="text"
                placeholder="Remarks about damage/odometer..."
                value={formData.damageComments}
                onChange={(e) => setFormData({ ...formData, damageComments: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#1E3A8A] text-slate-700"
              />
            </div>
          </div>

          <IsuzuDiagram
            points={formData.damagePoints}
            onChangePoint={handleDamagePointChange}
          />
        </div>
      )}
    </div>
  );
}
