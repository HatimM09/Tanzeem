// Central shared state for the university procurement app

export type ProcurementCategory =
  | 'Furniture'
  | 'IT Equipment'
  | 'Lab Equipment'
  | 'Library'
  | 'Sports'
  | 'Stationery'
  | 'Electrical'
  | 'Maintenance'
  | 'Other';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ProcurementItem {
  id: string;
  name: string;
  assignedTo: string;
  location: string;
  category: ProcurementCategory;
  photoUrl: string | null;
  barcode: string;
  stock: number;
  reorderLevel: number;
  condition: 'New' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  lastMaintainedAt?: string;
  nextServiceDate?: string;
  createdAt: string;
  createdBy: string;
  // IT Specific Fields
  office?: string;
  idara?: string;
  seatings?: string;
  processor?: string;
  ram?: string;
  hdd?: string;
  ssd?: string;
}

export interface ScanRecord {
  id: string;
  barcode: string;
  item: ProcurementItem | null;
  scannedAt: string;
  scannedBy: string;
}

export type ComplaintStatus = 'open' | 'resolved';

export interface MaintenanceRecord {
  id: string;
  itemId: string;
  type: 'Service' | 'Repair' | 'Calibration' | 'Inspection';
  description: string;
  cost?: number;
  performedBy: string;
  performedAt: string;
  nextServiceDate?: string;
}

export interface Complaint {
  id: string;
  itemId: string;
  itemName: string;
  itemBarcode: string;
  location: string;
  description: string;
  photoUrl?: string;
  priority: Priority;
  raisedBy: string;
  raisedAt: string;
  status: ComplaintStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedPhotoUrl?: string;
  resolvedNote?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: 'ITEM' | 'COMPLAINT' | 'SCAN' | 'MAINTENANCE';
  entityId: string;
  details: string;
  diff?: string; // JSON string of changes
  performedBy: string;
  performedAt: string;
}

// Seed data
const seed: ProcurementItem[] = [
  { id: 'itm001', name: 'Dell Monitor 24"', assignedTo: 'Dr. Ahmed Khan', location: 'CS Lab - Room 201', category: 'IT Equipment', photoUrl: null, barcode: 'UNIV-IT-001', createdAt: '2024-05-01', createdBy: 'Admin', stock: 15, reorderLevel: 5, condition: 'New' },
  { id: 'itm002', name: 'Ergonomic Office Chair', assignedTo: 'Prof. Sara Ali', location: 'Faculty Office - Block A', category: 'Furniture', photoUrl: null, barcode: 'UNIV-FUR-002', createdAt: '2024-05-03', createdBy: 'Admin', stock: 24, reorderLevel: 10, condition: 'Good' },
  { id: 'itm003', name: 'Oscilloscope DSO1054Z', assignedTo: 'Lab Technician', location: 'Electronics Lab - Room 105', category: 'Lab Equipment', photoUrl: null, barcode: 'UNIV-LAB-003', createdAt: '2024-05-05', createdBy: 'Admin', stock: 8, reorderLevel: 3, condition: 'Fair' },
  { id: 'itm004', name: 'Projector BenQ MW550', assignedTo: 'Lecture Hall Staff', location: 'Auditorium - Main Hall', category: 'IT Equipment', photoUrl: null, barcode: 'UNIV-IT-004', createdAt: '2024-05-07', createdBy: 'Admin', stock: 12, reorderLevel: 4, condition: 'Good' },
  { id: 'itm005', name: 'Bookshelf (5 Tier)', assignedTo: 'Library Staff', location: 'Central Library', category: 'Library', photoUrl: null, barcode: 'UNIV-LIB-005', createdAt: '2024-05-08', createdBy: 'Admin', stock: 45, reorderLevel: 15, condition: 'New' },
  { id: 'itm006', name: 'Fire Extinguisher ABC', assignedTo: 'Safety Officer', location: 'Main Corridor - Block B', category: 'Maintenance', photoUrl: null, barcode: 'UNIV-MNT-006', createdAt: '2024-05-10', createdBy: 'Admin', stock: 4, reorderLevel: 2, condition: 'Good' },
];

const seedComplaints: Complaint[] = [
  { id: 'cmp001', itemId: 'itm001', itemName: 'Dell Monitor 24"', itemBarcode: 'UNIV-IT-001', location: 'CS Lab - Room 201', description: 'Screen flickering intermittently, affecting student work.', priority: 'MEDIUM', raisedBy: 'Admin', raisedAt: '2024-05-12 09:30', status: 'open' },
  { id: 'cmp002', itemId: 'itm006', itemName: 'Fire Extinguisher ABC', itemBarcode: 'UNIV-MNT-006', location: 'Main Corridor - Block B', description: 'Pressure gauge shows low pressure, needs immediate inspection.', priority: 'CRITICAL', raisedBy: 'Admin', raisedAt: '2024-05-13 11:00', status: 'open' },
];

// In-memory store (React state lifted to App)
export const initialItems: ProcurementItem[] = [];
export const initialScanHistory: ScanRecord[] = [];
export const initialComplaints: Complaint[] = [];
export const initialMaintenance: MaintenanceRecord[] = [];
export const initialAuditLogs: AuditLog[] = [];
