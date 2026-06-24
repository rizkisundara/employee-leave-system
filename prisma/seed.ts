import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const today = new Date();
function relativeDate(offset: number): string {
  const d = new Date(today);
  d.setDate(today.getDate() + offset);
  return d.toISOString().split('T')[0];
}

async function main() {
  console.log('🌱 Seeding database...');

  // Delete all data in order
  await prisma.auditLog.deleteMany();
  await prisma.leaveQuota.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();

  console.log('✅ Cleared existing data');

  // Create employees
  const alice = await prisma.employee.create({
    data: {
      name: 'Alice Johnson',
      department: 'Engineering',
      position: 'Senior Developer',
    },
  });

  const bob = await prisma.employee.create({
    data: {
      name: 'Bob Smith',
      department: 'HR',
      position: 'HR Manager',
    },
  });

  const charlie = await prisma.employee.create({
    data: {
      name: 'Charlie Brown',
      department: 'Finance',
      position: 'Accountant',
    },
  });

  const diana = await prisma.employee.create({
    data: {
      name: 'Diana Prince',
      department: 'Marketing',
      position: 'PR Specialist',
    },
  });

  const evan = await prisma.employee.create({
    data: {
      name: 'Evan Williams',
      department: 'IT Support',
      position: 'System Administrator',
    },
  });

  console.log('✅ Created 5 employees');

  // Create users
  await prisma.user.create({
    data: {
      username: 'admin',
      password: 'admin123',
      name: 'Administrator',
      email: 'admin@company.com',
      role: 'admin',
    },
  });

  await prisma.user.create({
    data: {
      username: 'manager',
      password: 'manager123',
      name: 'Bob Smith',
      email: 'bob@company.com',
      role: 'manager',
      employeeId: bob.id,
    },
  });

  await prisma.user.create({
    data: {
      username: 'alice',
      password: 'user123',
      name: 'Alice Johnson',
      email: 'alice@company.com',
      role: 'employee',
      employeeId: alice.id,
    },
  });

  console.log('✅ Created 3 users');

  // Create leave requests
  await prisma.leaveRequest.createMany({
    data: [
      {
        employeeId: alice.id,
        leaveType: 'Annual',
        startDate: relativeDate(-1),
        endDate: relativeDate(1),
        reason: 'Family vacation',
        status: 'APPROVED',
        approvedBy: 'Bob Smith',
        daysCount: 3,
      },
      {
        employeeId: bob.id,
        leaveType: 'Sick',
        startDate: relativeDate(4),
        endDate: relativeDate(6),
        reason: 'Medical appointment',
        status: 'PENDING_HR',
        daysCount: 3,
      },
      {
        employeeId: charlie.id,
        leaveType: 'Sick',
        startDate: relativeDate(-10),
        endDate: relativeDate(-8),
        reason: 'Flu recovery',
        status: 'APPROVED',
        approvedBy: 'Bob Smith',
        daysCount: 3,
      },
      {
        employeeId: diana.id,
        leaveType: 'Personal',
        startDate: relativeDate(9),
        endDate: relativeDate(11),
        reason: 'Personal matters',
        status: 'PENDING_MANAGER',
        daysCount: 3,
      },
      {
        employeeId: evan.id,
        leaveType: 'Annual',
        startDate: relativeDate(14),
        endDate: relativeDate(18),
        reason: 'Holiday trip',
        status: 'PENDING_MANAGER',
        daysCount: 5,
      },
      {
        employeeId: alice.id,
        leaveType: 'Unpaid',
        startDate: relativeDate(-30),
        endDate: relativeDate(-28),
        reason: 'Extended personal leave',
        status: 'REJECTED',
        reviewNote: 'Insufficient leave balance',
        daysCount: 3,
      },
    ],
  });

  console.log('✅ Created 6 leave requests');

  // Create Indonesian holidays
  await prisma.holiday.createMany({
    data: [
      { name: 'Tahun Baru', date: '2025-01-01', type: 'national', isRecurring: true },
      { name: 'Isra Miraj', date: '2025-01-27', type: 'religious', isRecurring: false },
      { name: 'Tahun Baru Imlek', date: '2025-01-29', type: 'religious', isRecurring: false },
      { name: 'Hari Raya Nyepi', date: '2025-03-29', type: 'religious', isRecurring: false },
      { name: 'Wafat Isa Al-Masih', date: '2025-04-18', type: 'religious', isRecurring: false },
      { name: 'Hari Buruh', date: '2025-05-01', type: 'national', isRecurring: true },
      { name: 'Hari Raya Waisak', date: '2025-05-12', type: 'religious', isRecurring: false },
      { name: 'Kenaikan Isa Al-Masih', date: '2025-05-29', type: 'religious', isRecurring: false },
      { name: 'Hari Lahir Pancasila', date: '2025-06-01', type: 'national', isRecurring: true },
      { name: 'Idul Adha', date: '2025-06-07', type: 'religious', isRecurring: false },
      { name: 'Tahun Baru Islam', date: '2025-06-27', type: 'religious', isRecurring: false },
      { name: 'Hari Kemerdekaan RI', date: '2025-08-17', type: 'national', isRecurring: true },
      { name: 'Maulid Nabi Muhammad', date: '2025-09-05', type: 'religious', isRecurring: false },
      { name: 'Hari Natal', date: '2025-12-25', type: 'national', isRecurring: true },
      { name: 'Idul Fitri Day 1', date: '2025-03-30', type: 'religious', isRecurring: false },
      { name: 'Idul Fitri Day 2', date: '2025-03-31', type: 'religious', isRecurring: false },
      { name: 'Cuti Bersama Idul Fitri 1', date: '2025-04-01', type: 'company', isRecurring: false },
      { name: 'Cuti Bersama Idul Fitri 2', date: '2025-04-02', type: 'company', isRecurring: false },
      { name: 'Cuti Bersama Idul Fitri 3', date: '2025-04-03', type: 'company', isRecurring: false },
      { name: 'Cuti Bersama Idul Fitri 4', date: '2025-04-04', type: 'company', isRecurring: false },
      { name: 'Cuti Bersama Natal', date: '2025-12-26', type: 'company', isRecurring: false },
      { name: 'Cuti Bersama Tahun Baru', date: '2025-12-31', type: 'company', isRecurring: false },
      { name: 'Hari Kartini', date: '2025-04-21', type: 'national', isRecurring: true },
      { name: 'Hari Pendidikan Nasional', date: '2025-05-02', type: 'national', isRecurring: true },
      { name: 'Hari Anak Nasional', date: '2025-07-23', type: 'national', isRecurring: true },
      { name: 'Hari Pahlawan', date: '2025-11-10', type: 'national', isRecurring: true },
    ],
  });

  console.log('✅ Created 26 Indonesian holidays');

  // Create leave quotas for current year
  const currentYear = new Date().getFullYear();
  const employees = [alice, bob, charlie, diana, evan];

  await prisma.leaveQuota.createMany({
    data: employees.map((emp) => ({
      employeeId: emp.id,
      year: currentYear,
      totalQuota: 12,
      usedQuota: 0,
      pendingQuota: 0,
    })),
  });

  console.log(`✅ Created leave quotas for ${currentYear}`);

  // Add audit log entries
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'SEED_DATABASE',
        performedBy: 'system',
        details: 'Database seeded with initial data',
      },
      {
        action: 'CREATE_EMPLOYEES',
        performedBy: 'system',
        details: 'Created 5 employees',
      },
      {
        action: 'CREATE_USERS',
        performedBy: 'system',
        details: 'Created 3 users (admin, manager, alice)',
      },
      {
        action: 'CREATE_LEAVE_REQUESTS',
        performedBy: 'system',
        details: 'Created 6 leave requests with various statuses',
      },
      {
        action: 'CREATE_HOLIDAYS',
        performedBy: 'system',
        details: 'Created 26 Indonesian holidays for 2025',
      },
      {
        action: 'CREATE_LEAVE_QUOTAS',
        performedBy: 'system',
        details: `Created leave quotas for ${currentYear}`,
      },
    ],
  });

  console.log('✅ Created audit log entries');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
