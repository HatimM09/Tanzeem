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

export interface ItemRow {
  id: string;
  name: string;
  assigned_to: string;
  location: string;
  category: string;
  photo_url: string | null;
  barcode: string;
  created_at: string;
  created_by: string;
}

export interface ScanRow {
  id: string;
  barcode: string;
  item_id: string | null;
  scanned_at: string;
  scanned_by: string;
  // joined
  item_name?: string;
  item_category?: string;
  item_location?: string;
  item_assigned_to?: string;
}

export interface ComplaintRow {
  id: string;
  item_id: string;
  item_name: string;
  item_barcode: string;
  location: string;
  description: string;
  raised_by: string;
  raised_at: string;
  status: 'open' | 'resolved';
  resolved_at?: string | null;
  resolved_by?: string | null;
  resolved_photo_url?: string | null;
  resolved_note?: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
