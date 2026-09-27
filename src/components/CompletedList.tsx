/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InspectionRecord } from '../types/inspection';
import { getVehicles, getDrivers, createEmptyRecord, getWeekStartingDate, formatDateString } from '../lib/inspectionStorage';
import { ClipboardCheck, Plus, Search, FileText, Printer, CheckCircle, AlertCircle, Edit2, Trash2, Calendar, User, Eye, ShieldAlert } from 'lucide-react';

interface CompletedListProps {
  records: InspectionRecord[];
  onSelectRecord: (record: InspectionRecord) => void;
  onPrintRecord: (record: InspectionRecord) => void;
  onDeleteRecord: (id: string) => void;
  onCreateRecord: (record: InspectionRecord) => void;
}

export default function CompletedList({
  records,
  onSelectRecord,
  onPrintRecord,
  onDeleteRecord,
  onCreateRecord
}: CompletedListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'draft' | 'defects'>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  // New record form state
  const vehicles = getVehicles();
  const drivers = getDrivers();
  const [selectedVehId, setSelectedVehId] = useState(vehicles[0]?.id || '');
  const [selectedDrvId, setSelectedDrvId] = useState(drivers[0]?.id || '');
  const [selectedWeekDate, setSelectedWeekDate] = useState(() => formatDateString(getWeekStartingDate()));

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehId || !selectedDrvId) {
      alert('Please select a valid vehicle and driver.');
      return;
    }
    // Convert selected week date to exact Monday
    const mondayStr = formatDateString(getWeekStartingDate(new Date(selectedWeekDate)));
    const newRecord = createEmptyRecord(selectedVehId, selectedDrvId, mondayStr);
    onCreateRecord(newRecord);
    setShowNewModal(false);
  };

  // Statistics
  const totalCount = records.length;
  const completedCount = records.filter((r) => r.isCompleted).length;
  const draftCount = records.filter((r) => !r.isCompleted).length;
  
  // Total defects count
  const activeDefectRecordsCount = records.filter((record) => {
    // Check if any daily checks or weekly checks has defects or active damages
    const hasDailyDefect = Object.values(record.daily).some((day) => 
      Object.values(day.general).includes('DEFECT') ||
      Object.values(day.lights).includes('DEFECT') ||
      Object.values(day.interior).includes('DEFECT') ||
      Object.values(day.engine).includes('DEFECT')
    );
    const hasWeeklyDefect = Object.values(record.weeklyCheck).includes('DEFECT') || 
                            Object.values(record.fireExtinguisherCheck).includes('DEFECT');
    const hasDamagePoint = Object.values(record.damagePoints).some(p => p.status === 'DAMAGE');
    return hasDailyDefect || hasWeeklyDefect || hasDamagePoint;
  }).length;

  const filteredRecords = records.filter((r) => {
    const v = vehicles.find((v) => v.id === r.vehicleId);
    const d = drivers.find((d) => d.id === r.driverId);
    
    const matchesSearch =
      v?.registrationNo.toLowerCase().includes(search.toLowerCase()) ||
      v?.makeModel.toLowerCase().includes(search.toLowerCase()) ||
      d?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.weekStartingDate.includes(search);

    if (!matchesSearch) return false;

    // Filter by status
    if (statusFilter === 'completed') return r.isCompleted;
    if (statusFilter === 'draft') return !r.isCompleted;
    if (statusFilter === 'defects') {
      const hasDailyDefect = Object.values(r.daily).some((day) => 
        Object.values(day.general).includes('DEFECT') ||
        Object.values(day.lights).includes('DEFECT') ||
        Object.values(day.interior).includes('DEFECT') ||
        Object.values(day.engine).includes('DEFECT')
      );
      const hasWeeklyDefect = Object.values(r.weeklyCheck).includes('DEFECT') || 
                              Object.values(r.fireExtinguisherCheck).includes('DEFECT');
      const hasDamagePoint = Object.values(r.damagePoints).some(p => p.status === 'DAMAGE');
      return hasDailyDefect || hasWeeklyDefect || hasDamagePoint;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-6">
      
      {/* Upper stats summary header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#1E3A8A]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Inspections</span>
            <span className="text-xl font-mono font-bold text-slate-800">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Completed Forms</span>
            <span className="text-xl font-mono font-bold text-slate-800">{completedCount}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Edit2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Drafts</span>
            <span className="text-xl font-mono font-bold text-slate-800">{draftCount}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Alert / NCR defects</span>
            <span className="text-xl font-mono font-bold text-red-600">{activeDefectRecordsCount}</span>
          </div>
        </div>
      </div>

      {/* Primary Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by registration, model, or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E3A8A] outline-none text-slate-700 font-medium"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filters */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-md transition-colors ${statusFilter === 'completed' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'}`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-md transition-colors ${statusFilter === 'draft' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'}`}
            >
              Drafts
            </button>
            <button
              onClick={() => setStatusFilter('defects')}
              className={`px-3 py-1.5 rounded-md transition-colors ${statusFilter === 'defects' ? 'bg-white text-red-800 shadow-xs' : 'text-slate-600'}`}
            >
              NCR / Defects
            </button>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#152a61] text-white text-xs font-bold rounded-lg shadow transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Inspection
          </button>
        </div>
      </div>

      {/* Main logs layout */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Operational Inspection Log</h2>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">No Inspections Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No vehicle inspection forms match your search criteria. Create a new log or refine your filtering options.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-6">Vehicle (Registration)</th>
                  <th className="py-3 px-6">Driver Name</th>
                  <th className="py-3 px-6">Week starting</th>
                  <th className="py-3 px-6">Issues found</th>
                  <th className="py-3 px-6">Odometer</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => {
                  const v = vehicles.find((veh) => veh.id === r.vehicleId);
                  const d = drivers.find((drv) => drv.id === r.driverId);

                  // Calculate active defects
                  const hasDailyDefect = Object.values(r.daily).some((day) => 
                    Object.values(day.general).includes('DEFECT') ||
                    Object.values(day.lights).includes('DEFECT') ||
                    Object.values(day.interior).includes('DEFECT') ||
                    Object.values(day.engine).includes('DEFECT')
                  );
                  const hasWeeklyDefect = Object.values(r.weeklyCheck).includes('DEFECT') || 
                                          Object.values(r.fireExtinguisherCheck).includes('DEFECT');
                  const hasDamagePoint = Object.values(r.damagePoints).some(p => p.status === 'DAMAGE');
                  const hasAlerts = hasDailyDefect || hasWeeklyDefect || hasDamagePoint;

                  // Get highest mileage recorded
                  const mileages = Object.values(r.daily)
                    .map(day => Number(day.openingKms))
                    .filter(km => !isNaN(km) && km > 0);
                  const maxMileage = mileages.length > 0 ? Math.max(...mileages) : Number(r.damageOdometer) || null;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors text-xs text-slate-700">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-extrabold font-mono text-slate-900 tracking-wide">
                            {v?.registrationNo || 'Unknown'}
                          </span>
                          <span className="text-[10px] text-slate-400">{v?.makeModel}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        {d?.name || 'Unknown Driver'}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-500">
                        {r.weekStartingDate}
                      </td>
                      <td className="py-4 px-6">
                        {hasAlerts ? (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-red-100">
                            <AlertCircle className="w-3 h-3 text-red-500" />
                            Defects Flagged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-100">
                            Clean (OK)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600">
                        {maxMileage ? `${maxMileage.toLocaleString()} Km` : '—'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          r.isCompleted 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.isCompleted ? 'Finalized' : 'Draft / Active'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectRecord(r)}
                            title="Edit Report"
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onPrintRecord(r)}
                            title="Print / Export PDF"
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-[#1E3A8A] rounded transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRecord(r.id)}
                            title="Delete Log"
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW INSPECTION DIALOG MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase">Initialize Weekly Inspection</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              
              {/* Vehicle Selection */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Select Vehicle</label>
                <select
                  required
                  value={selectedVehId}
                  onChange={(e) => setSelectedVehId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#1E3A8A] text-slate-700"
                >
                  <option value="">— Select Vehicle —</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNo} ({v.makeModel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Driver Selection */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Select Driver</label>
                <select
                  required
                  value={selectedDrvId}
                  onChange={(e) => setSelectedDrvId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#1E3A8A] text-slate-700"
                >
                  <option value="">— Select Driver —</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (Lic: {d.licenseNo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Select Check Week</label>
                <input
                  type="date"
                  required
                  value={selectedWeekDate}
                  onChange={(e) => setSelectedWeekDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#1E3A8A] text-slate-700 font-mono"
                />
                <span className="text-[9px] text-slate-400 mt-1 block">
                  The system will automatically lock the start of the log to Monday of that week.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#152a61] transition-all cursor-pointer"
                >
                  Create Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
