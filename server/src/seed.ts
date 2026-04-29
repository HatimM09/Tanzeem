import db from './db';
import { v4 as uuidv4 } from 'uuid';

console.log('🌱 Seeding database...');

// ─── Seed Users ────────────────────────────────────────────────────────────
const users = [
  {
    id:    'user-admin-001',
    name:  'Admin User',
    email: 'admin@mahadalzahra.edu',
    phone: '+92-300-0000001',
    role:  'admin',
  },
  {
    id:    'user-sup-001',
    name:  'Supervisor User',
    email: 'supervisor@mahadalzahra.edu',
    phone: '+92-300-0000002',
    role:  'supervisor',
  },
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, name, email, phone, role)
  VALUES (@id, @name, @email, @phone, @role)
`);

for (const u of users) insertUser.run(u);
console.log(`  ✓ ${users.length} users seeded`);

// ─── Seed Items ────────────────────────────────────────────────────────────
const items = [
  { id: 'itm001', name: 'Dell Monitor 24"',       assigned_to: 'Dr. Ahmed Khan',     location: 'CS Lab - Room 201',          category: 'IT Equipment',  barcode: 'UNIV-IT-001',  created_by: 'Admin', created_at: '2024-05-01' },
  { id: 'itm002', name: 'Ergonomic Office Chair',  assigned_to: 'Prof. Sara Ali',     location: 'Faculty Office - Block A',   category: 'Furniture',     barcode: 'UNIV-FUR-002', created_by: 'Admin', created_at: '2024-05-03' },
  { id: 'itm003', name: 'Oscilloscope DSO1054Z',   assigned_to: 'Lab Technician',     location: 'Electronics Lab - Room 105', category: 'Lab Equipment', barcode: 'UNIV-LAB-003', created_by: 'Admin', created_at: '2024-05-05' },
  { id: 'itm004', name: 'Projector BenQ MW550',    assigned_to: 'Lecture Hall Staff', location: 'Auditorium - Main Hall',     category: 'IT Equipment',  barcode: 'UNIV-IT-004',  created_by: 'Admin', created_at: '2024-05-07' },
  { id: 'itm005', name: 'Bookshelf (5 Tier)',       assigned_to: 'Library Staff',      location: 'Central Library',            category: 'Library',       barcode: 'UNIV-LIB-005', created_by: 'Admin', created_at: '2024-05-08' },
  { id: 'itm006', name: 'Fire Extinguisher ABC',   assigned_to: 'Safety Officer',     location: 'Main Corridor - Block B',    category: 'Maintenance',   barcode: 'UNIV-MNT-006', created_by: 'Admin', created_at: '2024-05-10' },
];

const insertItem = db.prepare(`
  INSERT OR IGNORE INTO items (id, name, assigned_to, location, category, photo_url, barcode, created_at, created_by)
  VALUES (@id, @name, @assigned_to, @location, @category, NULL, @barcode, @created_at, @created_by)
`);
for (const item of items) insertItem.run(item);
console.log(`  ✓ ${items.length} items seeded`);

// ─── Seed Complaints ───────────────────────────────────────────────────────
const complaints = [
  { id: 'cmp001', item_id: 'itm001', item_name: 'Dell Monitor 24"',      item_barcode: 'UNIV-IT-001',  location: 'CS Lab - Room 201',       description: 'Screen flickering intermittently.',           raised_by: 'Supervisor', raised_at: '2024-05-12 09:30', status: 'open' },
  { id: 'cmp002', item_id: 'itm006', item_name: 'Fire Extinguisher ABC', item_barcode: 'UNIV-MNT-006', location: 'Main Corridor - Block B', description: 'Pressure gauge shows low pressure.',          raised_by: 'Supervisor', raised_at: '2024-05-13 11:00', status: 'open' },
];

const insertComplaint = db.prepare(`
  INSERT OR IGNORE INTO complaints
    (id, item_id, item_name, item_barcode, location, description, raised_by, raised_at, status)
  VALUES
    (@id, @item_id, @item_name, @item_barcode, @location, @description, @raised_by, @raised_at, @status)
`);
for (const c of complaints) insertComplaint.run(c);
console.log(`  ✓ ${complaints.length} complaints seeded`);

console.log('\n✅ Seeding complete!');
console.log('\n📋 Login credentials:');
console.log('   Admin:      admin@mahadalzahra.edu');
console.log('   Supervisor: supervisor@mahadalzahra.edu');
console.log('   (OTP is sent to email on each login)\n');
process.exit(0);
