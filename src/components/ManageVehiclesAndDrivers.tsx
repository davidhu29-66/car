/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Vehicle, Driver } from '../types/inspection';
import { getVehicles, saveVehicles, getDrivers, saveDrivers } from '../lib/inspectionStorage';
import { Plus, Trash2, Edit, Truck, Shield, User, Key, Calendar } from 'lucide-react';

export default function ManageVehiclesAndDrivers() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getVehicles());
  const [drivers, setDrivers] = useState<Driver[]>(() => getDrivers());

  // Form states
  const [newVeh, setNewVeh] = useState<Omit<Vehicle, 'id'>>({
    registrationNo: '',
    makeModel: '',
    licenseExpiryDate: '',
    lastServiceKms: 0,
    lastServiceDate: '',
    nextServiceKms: 0,
  });

  const [newDrv, setNewDrv] = useState<Omit<Driver, 'id'>>({
    name: '',
    licenseNo: '',
  });

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVeh.registrationNo || !newVeh.makeModel) return;
    const added: Vehicle = {
      ...newVeh,
      id: `veh_${Date.now()}`,
    };
    const updated = [...vehicles, added];
    setVehicles(updated);
    saveVehicles(updated);
    setNewVeh({
      registrationNo: '',
      makeModel: '',
      licenseExpiryDate: '',
      lastServiceKms: 0,
      lastServiceDate: '',
      nextServiceKms: 0,
    });
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrv.name || !newDrv.licenseNo) return;
    const added: Driver = {
      ...newDrv,
      id: `drv_${Date.now()}`,
    };
    const updated = [...drivers, added];
    setDrivers(updated);
    saveDrivers(updated);
    setNewDrv({
      name: '',
      licenseNo: '',
    });
  };

  const handleDeleteVehicle = (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle from the fleet registry?')) {
      const updated = vehicles.filter((v) => v.id !== id);
      setVehicles(updated);
      saveVehicles(updated);
    }
  };

  const handleDeleteDriver = (id: string) => {
    if (confirm('Are you sure you want to delete this driver profile?')) {
      const updated = drivers.filter((d) => d.id !== id);
      setDrivers(updated);
      saveDrivers(updated);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Fleet Registry</h1>
        <p className="text-xs text-slate-500">Configure and register the active vehicles and certified drivers in your operational fleet.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECTION 1: VEHICLES */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Truck className="w-5 h-5 text-[#1E3A8A]" />
              <h2 className="text-sm font-black text-slate-900 uppercase">Register New Vehicle</h2>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Registration Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CA 552-301"
                    value={newVeh.registrationNo}
                    onChange={(e) => setNewVeh({ ...newVeh, registrationNo: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E3A8A] outline-none text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Make / Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Isuzu KB250 Fleetside"
                    value={newVeh.makeModel}
                    onChange={(e) => setNewVeh({ ...newVeh, makeModel: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E3A8A] outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">License Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newVeh.licenseExpiryDate}
                    onChange={(e) => setNewVeh({ ...newVeh, licenseExpiryDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E3A8A] outline-none text-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Last Service Date</label>
                  <input
                    type="date"
                    required
                    value={newVeh.lastServiceDate}
                    onChange={(e) => setNewVeh({ ...newVeh, lastServiceDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E3A8A] outline-none text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Last Service Mileage (Km)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 148500"
                    value={newVeh.lastServiceKms || ''}
                    onChange={(e) => setNewVeh({ ...newVeh, lastServiceKms: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E3A8A] outline-none text-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Next Service Due (Km)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 158500"
                    value={newVeh.nextServiceKms || ''}
                    onChange={(e) => setNewVeh({ ...newVeh, nextServiceKms: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E3A8A] outline-none text-slate-700 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#152a61] text-white text-xs font-bold rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Fleet Vehicle
              </button>
            </form>
          </div>

          {/* List of Registered Vehicles */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Registered Vehicles ({vehicles.length})</h3>
            
            {vehicles.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No vehicles registered.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <div key={v.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black font-mono tracking-wide bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {v.registrationNo}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{v.makeModel}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>Next due: <b className="font-mono text-slate-600">{v.nextServiceKms.toLocaleString()} Km</b></span>
                        <span>·</span>
                        <span>License Expiry: <b className="font-mono text-slate-600">{v.licenseExpiryDate}</b></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: DRIVERS */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <User className="w-5 h-5 text-[#1E3A8A]" />
              <h2 className="text-sm font-black text-slate-900 uppercase">Register New Driver</h2>
            </div>

            <form onSubmit={handleAddDriver} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Driver's Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sipho Ndlovu"
                  value={newDrv.name}
                  onChange={(e) => setNewDrv({ ...newDrv, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E3A8A] outline-none text-slate-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Operator License Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LP4829304-B"
                  value={newDrv.licenseNo}
                  onChange={(e) => setNewDrv({ ...newDrv, licenseNo: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E3A8A] outline-none text-slate-700 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#152a61] text-white text-xs font-bold rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Driver Profile
              </button>
            </form>
          </div>

          {/* List of Registered Drivers */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Registered Drivers ({drivers.length})</h3>
            
            {drivers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No drivers registered.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {drivers.map((d) => (
                  <div key={d.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{d.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">License: {d.licenseNo}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteDriver(d.id)}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
