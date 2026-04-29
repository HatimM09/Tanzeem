export type ProcurementStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'delivered' | 'cancelled';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  category: string;
}

export interface ProcurementOrder {
  id: string;
  poNumber: string;
  title: string;
  vendor: string;
  vendorLogo: string;
  status: ProcurementStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requestedBy: string;
  department: string;
  requestDate: string;
  requiredDate: string;
  approvedBy?: string;
  approvalDate?: string;
  totalAmount: number;
  currency: string;
  lineItems: LineItem[];
  notes: string;
  category: string;
  paymentTerms: string;
  deliveryAddress: string;
  trackingNumber?: string;
  progress: number;
}

export interface Vendor {
  id: string;
  name: string;
  logo: string;
  rating: number;
  category: string;
  totalOrders: number;
  onTimeDelivery: number;
  contact: string;
  email: string;
}

export const vendors: Vendor[] = [
  { id: 'v1', name: 'TechSupply Co.', logo: '🖥️', rating: 4.8, category: 'IT Equipment', totalOrders: 142, onTimeDelivery: 96, contact: '+1 (555) 0101', email: 'orders@techsupply.com' },
  { id: 'v2', name: 'OfficeWorld', logo: '🗂️', rating: 4.5, category: 'Office Supplies', totalOrders: 89, onTimeDelivery: 91, contact: '+1 (555) 0202', email: 'sales@officeworld.com' },
  { id: 'v3', name: 'MegaLogistics', logo: '🚚', rating: 4.2, category: 'Logistics', totalOrders: 67, onTimeDelivery: 88, contact: '+1 (555) 0303', email: 'ops@megalogistics.com' },
  { id: 'v4', name: 'SafetyFirst Inc.', logo: '🦺', rating: 4.9, category: 'Safety Equipment', totalOrders: 55, onTimeDelivery: 98, contact: '+1 (555) 0404', email: 'orders@safetyfirst.com' },
  { id: 'v5', name: 'FurniturePro', logo: '🪑', rating: 4.3, category: 'Furniture', totalOrders: 33, onTimeDelivery: 85, contact: '+1 (555) 0505', email: 'sales@furniturepro.com' },
];

export const procurementOrders: ProcurementOrder[] = [
  {
    id: 'po001',
    poNumber: 'PO-2024-0142',
    title: 'Laptop Fleet Refresh',
    vendor: 'TechSupply Co.',
    vendorLogo: '🖥️',
    status: 'approved',
    priority: 'high',
    requestedBy: 'Sarah Mitchell',
    department: 'Engineering',
    requestDate: '2024-05-10',
    requiredDate: '2024-06-01',
    approvedBy: 'James Carter',
    approvalDate: '2024-05-12',
    totalAmount: 48750,
    currency: 'USD',
    category: 'IT Equipment',
    paymentTerms: 'Net 30',
    deliveryAddress: '123 Tech Park, San Francisco, CA 94105',
    trackingNumber: 'TRK-88291-XZ',
    progress: 72,
    notes: 'Priority refresh for the engineering team. MacBook Pro 14" M3 preferred. Ensure all units come with 3-year AppleCare.',
    lineItems: [
      { id: 'li1', description: 'MacBook Pro 14" M3 Pro', quantity: 15, unit: 'units', unitPrice: 2499, total: 37485, category: 'Laptop' },
      { id: 'li2', description: 'USB-C Hub 10-in-1', quantity: 15, unit: 'units', unitPrice: 89, total: 1335, category: 'Accessory' },
      { id: 'li3', description: 'Magic Mouse', quantity: 15, unit: 'units', unitPrice: 79, total: 1185, category: 'Peripheral' },
      { id: 'li4', description: 'AppleCare+ 3yr', quantity: 15, unit: 'licenses', unitPrice: 249, total: 3735, category: 'Warranty' },
      { id: 'li5', description: 'Laptop Bags', quantity: 15, unit: 'units', unitPrice: 67, total: 1005, category: 'Accessory' },
    ],
  },
  {
    id: 'po002',
    poNumber: 'PO-2024-0138',
    title: 'Q2 Office Supplies',
    vendor: 'OfficeWorld',
    vendorLogo: '🗂️',
    status: 'delivered',
    priority: 'low',
    requestedBy: 'Maria Lopez',
    department: 'Operations',
    requestDate: '2024-04-28',
    requiredDate: '2024-05-10',
    approvedBy: 'James Carter',
    approvalDate: '2024-04-30',
    totalAmount: 3240,
    currency: 'USD',
    category: 'Office Supplies',
    paymentTerms: 'Net 15',
    deliveryAddress: '123 Tech Park, San Francisco, CA 94105',
    trackingNumber: 'TRK-77123-AB',
    progress: 100,
    notes: 'Standard quarterly office supply replenishment.',
    lineItems: [
      { id: 'li6', description: 'A4 Copy Paper (500 sheets)', quantity: 50, unit: 'reams', unitPrice: 8.50, total: 425, category: 'Paper' },
      { id: 'li7', description: 'Ballpoint Pens (Box of 50)', quantity: 20, unit: 'boxes', unitPrice: 12, total: 240, category: 'Stationery' },
      { id: 'li8', description: 'Sticky Notes Assorted', quantity: 30, unit: 'packs', unitPrice: 6.50, total: 195, category: 'Stationery' },
      { id: 'li9', description: 'Desk Organizer Set', quantity: 25, unit: 'sets', unitPrice: 24, total: 600, category: 'Furniture' },
      { id: 'li10', description: 'Whiteboard Markers', quantity: 40, unit: 'packs', unitPrice: 9, total: 360, category: 'Stationery' },
    ],
  },
  {
    id: 'po003',
    poNumber: 'PO-2024-0145',
    title: 'Server Room UPS Units',
    vendor: 'TechSupply Co.',
    vendorLogo: '🖥️',
    status: 'pending',
    priority: 'critical',
    requestedBy: 'David Kim',
    department: 'IT Infrastructure',
    requestDate: '2024-05-15',
    requiredDate: '2024-05-25',
    totalAmount: 22400,
    currency: 'USD',
    category: 'IT Equipment',
    paymentTerms: 'Net 30',
    deliveryAddress: 'Server Room B, 123 Tech Park, SF',
    progress: 25,
    notes: 'URGENT: Current UPS units are end-of-life. Risk of downtime without replacement.',
    lineItems: [
      { id: 'li11', description: 'APC Smart-UPS 3000VA', quantity: 4, unit: 'units', unitPrice: 3200, total: 12800, category: 'Power' },
      { id: 'li12', description: 'APC Smart-UPS 1500VA', quantity: 6, unit: 'units', unitPrice: 1200, total: 7200, category: 'Power' },
      { id: 'li13', description: 'Network Management Card', quantity: 4, unit: 'units', unitPrice: 350, total: 1400, category: 'Accessory' },
      { id: 'li14', description: 'Installation Service', quantity: 1, unit: 'service', unitPrice: 1000, total: 1000, category: 'Service' },
    ],
  },
  {
    id: 'po004',
    poNumber: 'PO-2024-0133',
    title: 'Safety Gear Restock',
    vendor: 'SafetyFirst Inc.',
    vendorLogo: '🦺',
    status: 'delivered',
    priority: 'medium',
    requestedBy: 'Tom Bradley',
    department: 'Facilities',
    requestDate: '2024-04-15',
    requiredDate: '2024-04-30',
    approvedBy: 'Linda Hayes',
    approvalDate: '2024-04-17',
    totalAmount: 8960,
    currency: 'USD',
    category: 'Safety Equipment',
    paymentTerms: 'Net 30',
    deliveryAddress: 'Warehouse A, 456 Industrial Blvd',
    trackingNumber: 'TRK-55099-SF',
    progress: 100,
    notes: 'Annual safety equipment restock for all warehouse staff.',
    lineItems: [
      { id: 'li15', description: 'Hard Hat Class E', quantity: 50, unit: 'units', unitPrice: 32, total: 1600, category: 'Head Protection' },
      { id: 'li16', description: 'Safety Vest Hi-Vis', quantity: 80, unit: 'units', unitPrice: 18, total: 1440, category: 'Body Protection' },
      { id: 'li17', description: 'Safety Goggles', quantity: 60, unit: 'units', unitPrice: 14, total: 840, category: 'Eye Protection' },
      { id: 'li18', description: 'Work Gloves (pairs)', quantity: 100, unit: 'pairs', unitPrice: 12, total: 1200, category: 'Hand Protection' },
      { id: 'li19', description: 'First Aid Kit (Large)', quantity: 20, unit: 'kits', unitPrice: 94, total: 1880, category: 'Medical' },
      { id: 'li20', description: 'Fire Extinguisher 5lb', quantity: 10, unit: 'units', unitPrice: 200, total: 2000, category: 'Fire Safety' },
    ],
  },
  {
    id: 'po005',
    poNumber: 'PO-2024-0147',
    title: 'Conference Room Furniture',
    vendor: 'FurniturePro',
    vendorLogo: '🪑',
    status: 'draft',
    priority: 'medium',
    requestedBy: 'Rachel Green',
    department: 'Facilities',
    requestDate: '2024-05-18',
    requiredDate: '2024-06-15',
    totalAmount: 15800,
    currency: 'USD',
    category: 'Furniture',
    paymentTerms: 'Net 45',
    deliveryAddress: 'Floor 3, 123 Tech Park, San Francisco',
    progress: 10,
    notes: 'New conference room setup for the 3rd floor expansion.',
    lineItems: [
      { id: 'li21', description: 'Executive Conference Table 12-seat', quantity: 1, unit: 'unit', unitPrice: 4800, total: 4800, category: 'Table' },
      { id: 'li22', description: 'Ergonomic Conference Chair', quantity: 14, unit: 'units', unitPrice: 420, total: 5880, category: 'Chair' },
      { id: 'li23', description: 'Credenza Storage Unit', quantity: 2, unit: 'units', unitPrice: 1200, total: 2400, category: 'Storage' },
      { id: 'li24', description: 'Monitor Stand (Dual)', quantity: 4, unit: 'units', unitPrice: 180, total: 720, category: 'Accessory' },
      { id: 'li25', description: 'Delivery & Assembly', quantity: 1, unit: 'service', unitPrice: 2000, total: 2000, category: 'Service' },
    ],
  },
  {
    id: 'po006',
    poNumber: 'PO-2024-0129',
    title: 'Marketing Print Materials',
    vendor: 'OfficeWorld',
    vendorLogo: '🗂️',
    status: 'rejected',
    priority: 'low',
    requestedBy: 'Nina Patel',
    department: 'Marketing',
    requestDate: '2024-04-05',
    requiredDate: '2024-04-20',
    approvedBy: 'James Carter',
    approvalDate: '2024-04-08',
    totalAmount: 5600,
    currency: 'USD',
    category: 'Marketing',
    paymentTerms: 'Net 15',
    deliveryAddress: '123 Tech Park, San Francisco, CA 94105',
    progress: 0,
    notes: 'Rejected: Budget exceeded for Q2. Resubmit in Q3 with reduced quantities.',
    lineItems: [
      { id: 'li26', description: 'Brochures Full Color A4', quantity: 5000, unit: 'units', unitPrice: 0.60, total: 3000, category: 'Print' },
      { id: 'li27', description: 'Roll-up Banners 85x200cm', quantity: 10, unit: 'units', unitPrice: 180, total: 1800, category: 'Display' },
      { id: 'li28', description: 'Business Cards Premium', quantity: 2000, unit: 'units', unitPrice: 0.40, total: 800, category: 'Print' },
    ],
  },
];

export const dashboardStats = {
  totalOrders: 47,
  pendingApproval: 8,
  totalSpend: 284600,
  budgetUsed: 68,
  onTimeDelivery: 92,
  activeVendors: 12,
  savingsAchieved: 34200,
  ordersThisMonth: 12,
};
