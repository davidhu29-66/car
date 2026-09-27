/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vehicle {
  id: string;
  registrationNo: string;
  makeModel: string;
  licenseExpiryDate: string;
  lastServiceKms: number;
  lastServiceDate: string;
  nextServiceKms: number;
}

export interface Driver {
  id: string;
  name: string;
  licenseNo: string;
}

export type CheckStatus = 'OK' | 'DEFECT' | 'NA';

export interface DailyCheckRow {
  general: {
    a: CheckStatus;
    b: CheckStatus;
    c: CheckStatus;
    d: CheckStatus;
    e: CheckStatus;
    f: CheckStatus;
  };
  lights: {
    a: CheckStatus;
    b: CheckStatus;
    c: CheckStatus;
    d: CheckStatus;
    e: CheckStatus;
    f: CheckStatus;
  };
  interior: {
    a: CheckStatus;
    b: CheckStatus;
    c: CheckStatus;
    d: CheckStatus;
    e: CheckStatus;
  };
  engine: {
    a: CheckStatus;
    b: CheckStatus;
    c: CheckStatus;
    d: CheckStatus;
  };
  date: string;
  openingKms: string;
  signature: string;
  time: string;
}

export interface WeeklyCheckRow {
  a: CheckStatus; // Tyre condition – sufficient tread
  b: CheckStatus; // Tyre pressure checked
  c: CheckStatus; // Wheel nuts / caps secure
  d: CheckStatus; // Spare wheel condition and pressure – ok
  e: CheckStatus; // Spanner & jack in good working order
  f: CheckStatus; // Condition of vehicle / load bed – good
  g: CheckStatus; // Condition of seats – good / adjustable
  h: CheckStatus; // Windscreen undamaged
  i: CheckStatus; // Windscreen wipers in good condition
  j: CheckStatus; // Doors & windows in good condition
  k: CheckStatus; // All mirrors adjustable & in good condition
  l: CheckStatus; // No excessive play in steering
}

export interface FireExtinguisherCheckRow {
  a: CheckStatus; // Mounted properly
  b: CheckStatus; // Bracket in good condition
  c: CheckStatus; // Regularly serviced
  d: CheckStatus; // Plastic tie unbroken
  e: CheckStatus; // Undamaged / unscratched
  f: CheckStatus; // Nozzle ok
  g: CheckStatus; // Hose condition ok
  h: CheckStatus; // Couplings ok
  i: CheckStatus; // Gauge – lens unbroken
  j: CheckStatus; // Pointer present & working
  k: CheckStatus; // Legible and dial not faded
}

export type DamageCode = 'D' | 'S' | 'C' | 'B' | 'O'; // Dent, Scratch, Chip, Broken, Other

export interface DamagePointState {
  partId: string;
  label: string;
  view: 'left' | 'right' | 'front' | 'top' | 'rear';
  status: 'OK' | 'DAMAGE';
  damages: DamageCode[];
  comments: string;
}

export interface InspectionRecord {
  id: string;
  vehicleId: string;
  driverId: string;
  weekStartingDate: string; // Monday's date YYYY-MM-DD
  
  // Daily Checks (indexed by 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')
  daily: {
    mon: DailyCheckRow;
    tue: DailyCheckRow;
    wed: DailyCheckRow;
    thu: DailyCheckRow;
    fri: DailyCheckRow;
    sat: DailyCheckRow;
    sun: DailyCheckRow;
  };

  // Weekly checklist items
  weeklyCheck: WeeklyCheckRow;
  fireExtinguisherCheck: FireExtinguisherCheckRow;
  weeklySignature: string;
  weeklySignatureDate: string;

  // Visual Damage Report points
  damagePoints: Record<string, DamagePointState>;
  damageComments: string;
  damageOdometer: string;
  damageInspector: string;
  damageDate: string;

  // Cross-check
  crossCheckedBy: string;
  crossCheckedSignature: string;
  crossCheckedDate: string;

  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
}
