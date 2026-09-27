export interface VehicleInspection {
  id: string;
  date: string;
  mileage: number;
  status: 'pass' | 'fail' | 'needs-attention';
  items: InspectionItem[];
  notes: string;
  inspector: string;
}

export interface InspectionItem {
  id: string;
  category: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  notes?: string;
}

export interface InspectionResult {
  passed: boolean;
  itemsPassed: number;
  itemsFailed: number;
  totalItems: number;
  failedItems: InspectionItem[];
}
