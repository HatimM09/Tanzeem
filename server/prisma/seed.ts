import { PrismaClient, Role, ComplaintStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('mahad123', 10);

  // ─── Seed Users ────────────────────────────────────────────────────────────
  const users = [
    {
      id: 'admin001',
      name: 'Admin',
      email: 'admin@mahad.com',
      role: Role.admin,
      password: hashedPassword, // Using mahad123 as hashed password
    },
    {
      id: 'sup001',
      name: 'Supervisor',
      email: 'sup@mahad.edu',
      role: Role.supervisor,
      password: hashedPassword,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashedPassword },
      create: u,
    });
  }
  console.log(`  ✓ ${users.length} users seeded (Password: mahad123)`);

  // ─── Seed Items ────────────────────────────────────────────────────────────
  const items = [
    { id: 'itm001', name: 'Dell Monitor 24"', assignedTo: 'Dr. Ahmed Khan', location: 'CS Lab - Room 201', category: 'IT Equipment', barcode: 'UNIV-IT-001', createdBy: 'Admin', createdAt: new Date('2024-05-01') },
    { id: 'itm002', name: 'Ergonomic Office Chair', assignedTo: 'Prof. Sara Ali', location: 'Faculty Office - Block A', category: 'Furniture', barcode: 'UNIV-FUR-002', createdBy: 'Admin', createdAt: new Date('2024-05-03') },
    { id: 'itm003', name: 'Oscilloscope DSO1054Z', assignedTo: 'Lab Technician', location: 'Electronics Lab - Room 105', category: 'Lab Equipment', barcode: 'UNIV-LAB-003', createdBy: 'Admin', createdAt: new Date('2024-05-05') },
    { id: 'itm004', name: 'Projector BenQ MW550', assignedTo: 'Lecture Hall Staff', location: 'Auditorium - Main Hall', category: 'IT Equipment', barcode: 'UNIV-IT-004', createdBy: 'Admin', createdAt: new Date('2024-05-07') },
    { id: 'itm005', name: 'Bookshelf (5 Tier)', assignedTo: 'Library Staff', location: 'Central Library', category: 'Library', barcode: 'UNIV-LIB-005', createdBy: 'Admin', createdAt: new Date('2024-05-08') },
    { id: 'itm006', name: 'Fire Extinguisher ABC', assignedTo: 'Safety Officer', location: 'Main Corridor - Block B', category: 'Maintenance', barcode: 'UNIV-MNT-006', createdBy: 'Admin', createdAt: new Date('2024-05-10') },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { barcode: item.barcode },
      update: {},
      create: item,
    });
  }
  console.log(`  ✓ ${items.length} items seeded`);

  // ─── Seed Complaints ───────────────────────────────────────────────────────
  const complaints = [
    {
      id: 'cmp001',
      itemId: 'itm001',
      itemName: 'Dell Monitor 24"',
      itemBarcode: 'UNIV-IT-001',
      location: 'CS Lab - Room 201',
      description: 'Screen flickering intermittently.',
      raisedBy: 'Supervisor',
      raisedAt: new Date('2024-05-12T09:30:00'),
      status: ComplaintStatus.OPEN,
    },
    {
      id: 'cmp002',
      itemId: 'itm006',
      itemName: 'Fire Extinguisher ABC',
      itemBarcode: 'UNIV-MNT-006',
      location: 'Main Corridor - Block B',
      description: 'Pressure gauge shows low pressure.',
      raisedBy: 'Supervisor',
      raisedAt: new Date('2024-05-13T11:00:00'),
      status: ComplaintStatus.OPEN,
    },
  ];

  for (const c of complaints) {
    await prisma.complaint.upsert({
      where: { id: c.id },
      update: {},
      create: c,
    });
  }
  console.log(`  ✓ ${complaints.length} complaints seeded`);

  console.log('\n✅ Seeding complete!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin:      admin@mahad.com / mahad123');
  console.log('   Supervisor: sup@mahad.edu / mahad123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
