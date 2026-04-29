export interface ScannedProduct {
  barcode: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  unit: string;
  vendor: string;
  vendorLogo: string;
  stock: number;
  reorderLevel: number;
  description: string;
  weight?: string;
  origin?: string;
}

export const productDatabase: Record<string, ScannedProduct> = {
  '012345678901': {
    barcode: '012345678901',
    name: 'MacBook Pro 14" M3 Pro',
    sku: 'APPL-MBP14-M3',
    category: 'IT Equipment',
    unitPrice: 2499,
    unit: 'unit',
    vendor: 'TechSupply Co.',
    vendorLogo: '🖥️',
    stock: 8,
    reorderLevel: 5,
    description: 'Apple MacBook Pro 14-inch with M3 Pro chip, 18GB RAM, 512GB SSD',
    weight: '1.61 kg',
    origin: 'USA',
  },
  '023456789012': {
    barcode: '023456789012',
    name: 'USB-C Hub 10-in-1',
    sku: 'ACC-USBC-HUB10',
    category: 'IT Accessories',
    unitPrice: 89,
    unit: 'unit',
    vendor: 'TechSupply Co.',
    vendorLogo: '🖥️',
    stock: 42,
    reorderLevel: 10,
    description: '10-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and PD charging',
    weight: '0.12 kg',
    origin: 'China',
  },
  '034567890123': {
    barcode: '034567890123',
    name: 'A4 Copy Paper 500 sheets',
    sku: 'OFF-PAPER-A4-500',
    category: 'Office Supplies',
    unitPrice: 8.50,
    unit: 'ream',
    vendor: 'OfficeWorld',
    vendorLogo: '🗂️',
    stock: 120,
    reorderLevel: 30,
    description: 'Premium A4 80gsm copy paper, 500 sheets per ream, acid-free',
    weight: '2.5 kg',
    origin: 'Finland',
  },
  '045678901234': {
    barcode: '045678901234',
    name: 'Hard Hat Class E',
    sku: 'SAF-HHAT-CE',
    category: 'Safety Equipment',
    unitPrice: 32,
    unit: 'unit',
    vendor: 'SafetyFirst Inc.',
    vendorLogo: '🪖',
    stock: 15,
    reorderLevel: 20,
    description: 'ANSI/ISEA Z89.1 Class E hard hat, adjustable ratchet suspension',
    weight: '0.35 kg',
    origin: 'USA',
  },
  '056789012345': {
    barcode: '056789012345',
    name: 'Ergonomic Conference Chair',
    sku: 'FUR-CHAIR-CONF',
    category: 'Furniture',
    unitPrice: 420,
    unit: 'unit',
    vendor: 'FurniturePro',
    vendorLogo: '🪑',
    stock: 6,
    reorderLevel: 3,
    description: 'High-back ergonomic conference chair with lumbar support and armrests',
    weight: '14 kg',
    origin: 'Italy',
  },
  '067890123456': {
    barcode: '067890123456',
    name: 'APC Smart-UPS 3000VA',
    sku: 'PWR-UPS-3000VA',
    category: 'IT Equipment',
    unitPrice: 3200,
    unit: 'unit',
    vendor: 'TechSupply Co.',
    vendorLogo: '🖥️',
    stock: 2,
    reorderLevel: 2,
    description: 'APC Smart-UPS 3000VA LCD 120V with network management card slot',
    weight: '38.5 kg',
    origin: 'USA',
  },
  '078901234567': {
    barcode: '078901234567',
    name: 'Safety Vest Hi-Vis',
    sku: 'SAF-VEST-HV',
    category: 'Safety Equipment',
    unitPrice: 18,
    unit: 'unit',
    vendor: 'SafetyFirst Inc.',
    vendorLogo: '🪖',
    stock: 55,
    reorderLevel: 25,
    description: 'ANSI Class 2 high-visibility safety vest, breathable mesh, multiple pockets',
    weight: '0.18 kg',
    origin: 'Bangladesh',
  },
  '089012345678': {
    barcode: '089012345678',
    name: 'First Aid Kit (Large)',
    sku: 'SAF-FAK-LG',
    category: 'Safety Equipment',
    unitPrice: 94,
    unit: 'kit',
    vendor: 'SafetyFirst Inc.',
    vendorLogo: '🪖',
    stock: 12,
    reorderLevel: 5,
    description: '200-piece first aid kit for workplace use, OSHA compliant',
    weight: '1.8 kg',
    origin: 'USA',
  },
  '090123456789': {
    barcode: '090123456789',
    name: 'Magic Mouse',
    sku: 'APPL-MMOUSE',
    category: 'IT Accessories',
    unitPrice: 79,
    unit: 'unit',
    vendor: 'TechSupply Co.',
    vendorLogo: '🖥️',
    stock: 30,
    reorderLevel: 10,
    description: 'Apple Magic Mouse with Multi-Touch surface, Lightning charging',
    weight: '0.1 kg',
    origin: 'USA',
  },
  '901234567890': {
    barcode: '901234567890',
    name: 'Whiteboard Markers Set',
    sku: 'OFF-WBMK-SET',
    category: 'Office Supplies',
    unitPrice: 9,
    unit: 'pack',
    vendor: 'OfficeWorld',
    vendorLogo: '🗂️',
    stock: 88,
    reorderLevel: 20,
    description: 'Dry-erase whiteboard markers, 8 colors, chisel tip, low odor',
    weight: '0.15 kg',
    origin: 'Germany',
  },
};

export const demoBarcodes = Object.keys(productDatabase);

export interface ScanHistoryItem {
  id: string;
  barcode: string;
  product: ScannedProduct | null;
  scannedAt: string;
  quantity: number;
  addedToCart: boolean;
}
