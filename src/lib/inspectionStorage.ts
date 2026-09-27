/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vehicle, Driver, InspectionRecord, CheckStatus, DailyCheckRow, DamagePointState } from '../types/inspection';

// Helper to create empty daily row
export function createEmptyDailyRow(dateStr: string = ''): DailyCheckRow {
  return {
    date: dateStr,
    openingKms: '',
    signature: '',
    time: '',
    general: { a: 'OK', b: 'OK', c: 'OK', d: 'OK', e: 'OK', f: 'OK' },
    lights: { a: 'OK', b: 'OK', c: 'OK', d: 'OK', e: 'OK', f: 'OK' },
    interior: { a: 'OK', b: 'OK', c: 'OK', d: 'OK', e: 'OK' },
    engine: { a: 'OK', b: 'OK', c: 'OK', d: 'OK' },
  };
}

// Default damage hotspot points corresponding to the Isuzu diagram
export const INITIAL_DAMAGE_POINTS: Record<string, Omit<DamagePointState, 'status' | 'damages' | 'comments'>> = {
  // LEFT SIDE
  'left_front_bumper': { partId: 'left_front_bumper', label: 'FRONT BUMPER', view: 'left' },
  'left_headlights': { partId: 'left_headlights', label: 'HEADLIGHTS', view: 'left' },
  'left_wheels_tyres': { partId: 'left_wheels_tyres', label: 'WHEELS/TYRES', view: 'left' },
  'left_door': { partId: 'left_door', label: 'LEFT DOOR', view: 'left' },
  'left_fender': { partId: 'left_fender', label: 'LEFT FENDER', view: 'left' },
  'left_bed': { partId: 'left_bed', label: 'LEFT BED', view: 'left' },
  'left_mirror': { partId: 'left_mirror', label: 'MIRROR', view: 'left' },

  // RIGHT SIDE
  'right_door': { partId: 'right_door', label: 'RIGHT DOOR', view: 'right' },
  'right_fender': { partId: 'right_fender', label: 'RIGHT FENDER', view: 'right' },
  'right_bed': { partId: 'right_bed', label: 'RIGHT BED', view: 'right' },
  'right_mirror': { partId: 'right_mirror', label: 'MIRROR', view: 'right' },

  // FRONT VIEW
  'front_headlights': { partId: 'front_headlights', label: 'HEADLIGHTS', view: 'front' },
  'front_bumper': { partId: 'front_bumper', label: 'FRONT BUMPER', view: 'front' },
  'front_windshield': { partId: 'front_windshield', label: 'WINDSHIELD', view: 'front' },

  // TOP VIEW
  'top_windshield': { partId: 'top_windshield', label: 'WINDSHIELD', view: 'top' },
  'top_hood': { partId: 'top_hood', label: 'HOOD', view: 'top' },
  'top_bed_inner': { partId: 'top_bed_inner', label: 'BED INNER', view: 'top' },
  'top_roof': { partId: 'top_roof', label: 'ROOF', view: 'top' },

  // REAR VIEW
  'rear_tailgate': { partId: 'rear_tailgate', label: 'TAILGATE', view: 'rear' },
  'rear_bumper': { partId: 'rear_bumper', label: 'REAR BUMPER', view: 'rear' },
  'rear_tail_lights': { partId: 'rear_tail_lights', label: 'TAIL LIGHTS', view: 'rear' },
};

export function createEmptyDamagePoints(): Record<string, DamagePointState> {
  const points: Record<string, DamagePointState> = {};
  Object.keys(INITIAL_DAMAGE_POINTS).forEach((key) => {
    points[key] = {
      ...INITIAL_DAMAGE_POINTS[key],
      status: 'OK',
      damages: [],
      comments: '',
    };
  });
  return points;
}

// Get dates of the current week starting from Monday
export function getWeekStartingDate(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createEmptyRecord(vehicleId: string, driverId: string, weekMondayStr: string): InspectionRecord {
  const monday = new Date(weekMondayStr);
  const getOffsetDate = (offset: number) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offset);
    return formatDateString(d);
  };

  return {
    id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    vehicleId,
    driverId,
    weekStartingDate: weekMondayStr,
    daily: {
      mon: createEmptyDailyRow(getOffsetDate(0)),
      tue: createEmptyDailyRow(getOffsetDate(1)),
      wed: createEmptyDailyRow(getOffsetDate(2)),
      thu: createEmptyDailyRow(getOffsetDate(3)),
      fri: createEmptyDailyRow(getOffsetDate(4)),
      sat: createEmptyDailyRow(getOffsetDate(5)),
      sun: createEmptyDailyRow(getOffsetDate(6)),
    },
    weeklyCheck: {
      a: 'OK', b: 'OK', c: 'OK', d: 'OK', e: 'OK', f: 'OK', g: 'OK', h: 'OK', i: 'OK', j: 'OK', k: 'OK', l: 'OK'
    },
    fireExtinguisherCheck: {
      a: 'OK', b: 'OK', c: 'OK', d: 'OK', e: 'OK', f: 'OK', g: 'OK', h: 'OK', i: 'OK', j: 'OK', k: 'OK'
    },
    weeklySignature: '',
    weeklySignatureDate: '',
    damagePoints: createEmptyDamagePoints(),
    damageComments: '',
    damageOdometer: '',
    damageInspector: '',
    damageDate: weekMondayStr,
    crossCheckedBy: '',
    crossCheckedSignature: '',
    crossCheckedDate: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isCompleted: false
  };
}

const DEFAULT_VEHICLES: Vehicle[] = [
  {
    id: 'veh_1',
    registrationNo: 'CA 552-301',
    makeModel: 'Isuzu KB250 Fleetside',
    licenseExpiryDate: '2027-04-12',
    lastServiceKms: 148500,
    lastServiceDate: '2026-08-15',
    nextServiceKms: 158500
  },
  {
    id: 'veh_2',
    registrationNo: 'GP 203 LTR',
    makeModel: 'Isuzu D-MAX 250 D-Teq',
    licenseExpiryDate: '2027-01-20',
    lastServiceKms: 92400,
    lastServiceDate: '2026-06-10',
    nextServiceKms: 107400
  }
];

const DEFAULT_DRIVERS: Driver[] = [
  { id: 'drv_1', name: 'John Peterson', licenseNo: 'LP8392110-C' },
  { id: 'drv_2', name: 'Sipho Ndlovu', licenseNo: 'LP4829304-B' },
  { id: 'drv_3', name: 'Gavin Smith', licenseNo: 'LP9021832-D' }
];

export function initializeStorage() {
  if (!localStorage.getItem('logbook_vehicles')) {
    localStorage.setItem('logbook_vehicles', JSON.stringify(DEFAULT_VEHICLES));
  }
  if (!localStorage.getItem('logbook_drivers')) {
    localStorage.setItem('logbook_drivers', JSON.stringify(DEFAULT_DRIVERS));
  }
  
  // Create a default completed inspection for GP 203 LTR for previous week to show data
  if (!localStorage.getItem('logbook_inspections')) {
    const prevWeekMon = getWeekStartingDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const prevWeekMonStr = formatDateString(prevWeekMon);
    
    const record = createEmptyRecord('veh_1', 'drv_1', prevWeekMonStr);
    record.id = 'rec_default_completed';
    record.isCompleted = true;
    record.damageOdometer = '149120';
    record.damageInspector = 'Marcus Cole (Fleet Manager)';
    record.damageDate = prevWeekMonStr;
    record.weeklySignature = 'John Peterson';
    record.weeklySignatureDate = prevWeekMonStr;
    record.crossCheckedBy = 'Marcus Cole';
    record.crossCheckedSignature = 'M. Cole';
    record.crossCheckedDate = prevWeekMonStr;
    
    // Fill daily data with checkmarks and minor comments
    const days: ('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun')[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    days.forEach((day, index) => {
      const d = record.daily[day];
      d.openingKms = String(148500 + index * 85);
      d.signature = 'JP';
      d.time = '07:15';
      if (day === 'wed') {
        // Wednesday minor issue
        d.lights.b = 'DEFECT'; // Front lights
      }
    });

    // Mark left front bumper as chipped in visual report
    record.damagePoints['left_front_bumper'] = {
      partId: 'left_front_bumper',
      label: 'FRONT BUMPER',
      view: 'left',
      status: 'DAMAGE',
      damages: ['C', 'S'],
      comments: 'Minor rock chips and slight scratch from highway driving.'
    };
    
    // Mark rear tailgate as dented
    record.damagePoints['rear_tailgate'] = {
      partId: 'rear_tailgate',
      label: 'TAILGATE',
      view: 'rear',
      status: 'DAMAGE',
      damages: ['D'],
      comments: 'Small dent near Isuzu logo.'
    };

    localStorage.setItem('logbook_inspections', JSON.stringify([record]));
  }
}

export function getVehicles(): Vehicle[] {
  initializeStorage();
  return JSON.parse(localStorage.getItem('logbook_vehicles') || '[]');
}

export function saveVehicles(vehicles: Vehicle[]) {
  localStorage.setItem('logbook_vehicles', JSON.stringify(vehicles));
}

export function getDrivers(): Driver[] {
  initializeStorage();
  return JSON.parse(localStorage.getItem('logbook_drivers') || '[]');
}

export function saveDrivers(drivers: Driver[]) {
  localStorage.setItem('logbook_drivers', JSON.stringify(drivers));
}

export function getInspections(): InspectionRecord[] {
  initializeStorage();
  return JSON.parse(localStorage.getItem('logbook_inspections') || '[]');
}

export function saveInspections(inspections: InspectionRecord[]) {
  localStorage.setItem('logbook_inspections', JSON.stringify(inspections));
}
