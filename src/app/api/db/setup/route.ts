import supabase from '@/lib/supabase'
import { NextResponse } from 'next/server'

const MIGRATION_SQL = `
-- ============================================
-- LeaveFlow Enterprise - Auto Setup
-- ============================================

-- 1. EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. APP USERS
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'employee',
  status TEXT DEFAULT 'active',
  avatar TEXT,
  last_login TIMESTAMPTZ,
  employee_id TEXT UNIQUE REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS leave_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING_MANAGER',
  approved_by TEXT,
  review_note TEXT,
  days_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. HOLIDAYS
CREATE TABLE IF NOT EXISTS holidays (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. LEAVE QUOTAS
CREATE TABLE IF NOT EXISTS leave_quotas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_quota INTEGER DEFAULT 12,
  used_quota INTEGER DEFAULT 0,
  pending_quota INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, year)
);

-- 6. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow full access
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on employees') THEN
    CREATE POLICY "Allow all on employees" ON employees FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on app_users') THEN
    CREATE POLICY "Allow all on app_users" ON app_users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on leave_requests') THEN
    CREATE POLICY "Allow all on leave_requests" ON leave_requests FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on holidays') THEN
    CREATE POLICY "Allow all on holidays" ON holidays FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on leave_quotas') THEN
    CREATE POLICY "Allow all on leave_quotas" ON leave_quotas FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on audit_logs') THEN
    CREATE POLICY "Allow all on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

export async function POST() {
  try {
    // Check which tables exist
    const tables = ['employees', 'app_users', 'leave_requests', 'holidays', 'leave_quotas', 'audit_logs']
    const status: Record<string, string> = {}

    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1)
      status[table] = error ? '❌ missing' : '✅ exists'
    }

    const allExist = Object.values(status).every(s => s.includes('✅'))

    if (!allExist) {
      return NextResponse.json({
        status: 'tables_missing',
        tables: status,
        message: 'Some tables are missing. Please run the migration SQL in Supabase Dashboard → SQL Editor.',
        sql_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '')}/project/lhxiqucnadwfvvhapzju/sql/new`,
        migration_sql: MIGRATION_SQL,
      })
    }

    // Tables exist, try seeding if empty
    const { data: empData } = await supabase.from('employees').select('id')
    if (!empData || empData.length === 0) {
      // Seed employees
      await supabase.from('employees').upsert([
        { id: 'emp-alice', name: 'Alice Johnson', department: 'Engineering', position: 'Senior Developer' },
        { id: 'emp-bob', name: 'Bob Smith', department: 'HR', position: 'HR Manager' },
        { id: 'emp-charlie', name: 'Charlie Brown', department: 'Finance', position: 'Accountant' },
        { id: 'emp-diana', name: 'Diana Prince', department: 'Marketing', position: 'PR Specialist' },
        { id: 'emp-evan', name: 'Evan Williams', department: 'IT Support', position: 'System Administrator' },
      ])

      // Seed users
      await supabase.from('app_users').upsert([
        { id: 'usr-admin', username: 'admin', password: 'admin123', name: 'Administrator', email: 'admin@leaveflow.com', role: 'admin' },
        { id: 'usr-manager', username: 'manager', password: 'manager123', name: 'Bob Smith', email: 'bob@leaveflow.com', role: 'manager', employee_id: 'emp-bob' },
        { id: 'usr-alice', username: 'alice', password: 'user123', name: 'Alice Johnson', email: 'alice@leaveflow.com', role: 'employee', employee_id: 'emp-alice' },
      ])

      // Seed holidays
      const holidays = [
        { id: 'hol-01', name: 'Tahun Baru', date: '2025-01-01', type: 'national', is_recurring: true },
        { id: 'hol-02', name: 'Isra Miraj', date: '2025-01-27', type: 'religious', is_recurring: false },
        { id: 'hol-03', name: 'Tahun Baru Imlek', date: '2025-01-29', type: 'religious', is_recurring: false },
        { id: 'hol-04', name: 'Hari Raya Nyepi', date: '2025-03-29', type: 'religious', is_recurring: false },
        { id: 'hol-05', name: 'Wafat Isa Al-Masih', date: '2025-04-18', type: 'religious', is_recurring: false },
        { id: 'hol-06', name: 'Hari Buruh', date: '2025-05-01', type: 'national', is_recurring: true },
        { id: 'hol-07', name: 'Hari Raya Waisak', date: '2025-05-12', type: 'religious', is_recurring: false },
        { id: 'hol-08', name: 'Kenaikan Isa Al-Masih', date: '2025-05-29', type: 'religious', is_recurring: false },
        { id: 'hol-09', name: 'Hari Lahir Pancasila', date: '2025-06-01', type: 'national', is_recurring: true },
        { id: 'hol-10', name: 'Idul Adha', date: '2025-06-07', type: 'religious', is_recurring: false },
        { id: 'hol-11', name: 'Tahun Baru Islam', date: '2025-06-27', type: 'religious', is_recurring: false },
        { id: 'hol-12', name: 'Hari Kemerdekaan RI', date: '2025-08-17', type: 'national', is_recurring: true },
        { id: 'hol-13', name: 'Maulid Nabi Muhammad', date: '2025-09-05', type: 'religious', is_recurring: false },
        { id: 'hol-14', name: 'Hari Natal', date: '2025-12-25', type: 'national', is_recurring: true },
        { id: 'hol-15', name: 'Idul Fitri Day 1', date: '2025-03-30', type: 'religious', is_recurring: false },
        { id: 'hol-16', name: 'Idul Fitri Day 2', date: '2025-03-31', type: 'religious', is_recurring: false },
        { id: 'hol-17', name: 'Cuti Bersama Idul Fitri 1', date: '2025-04-01', type: 'company', is_recurring: false },
        { id: 'hol-18', name: 'Cuti Bersama Idul Fitri 2', date: '2025-04-02', type: 'company', is_recurring: false },
        { id: 'hol-19', name: 'Cuti Bersama Idul Fitri 3', date: '2025-04-03', type: 'company', is_recurring: false },
        { id: 'hol-20', name: 'Cuti Bersama Idul Fitri 4', date: '2025-04-04', type: 'company', is_recurring: false },
        { id: 'hol-21', name: 'Cuti Bersama Natal', date: '2025-12-26', type: 'company', is_recurring: false },
        { id: 'hol-22', name: 'Cuti Bersama Tahun Baru', date: '2025-12-31', type: 'company', is_recurring: false },
        { id: 'hol-23', name: 'Hari Kartini', date: '2025-04-21', type: 'national', is_recurring: true },
        { id: 'hol-24', name: 'Hari Pendidikan Nasional', date: '2025-05-02', type: 'national', is_recurring: true },
        { id: 'hol-25', name: 'Hari Anak Nasional', date: '2025-07-23', type: 'national', is_recurring: true },
        { id: 'hol-26', name: 'Hari Pahlawan', date: '2025-11-10', type: 'national', is_recurring: true },
      ]
      await supabase.from('holidays').upsert(holidays)

      // Seed leave quotas
      const year = new Date().getFullYear()
      await supabase.from('leave_quotas').upsert([
        { id: 'lq-1', employee_id: 'emp-alice', year, total_quota: 12, used_quota: 2, pending_quota: 0 },
        { id: 'lq-2', employee_id: 'emp-bob', year, total_quota: 12, used_quota: 0, pending_quota: 3 },
        { id: 'lq-3', employee_id: 'emp-charlie', year, total_quota: 12, used_quota: 3, pending_quota: 0 },
        { id: 'lq-4', employee_id: 'emp-diana', year, total_quota: 12, used_quota: 0, pending_quota: 3 },
        { id: 'lq-5', employee_id: 'emp-evan', year, total_quota: 12, used_quota: 0, pending_quota: 5 },
      ])

      // Seed leave requests
      const today = new Date().toISOString().split('T')[0]
      const relDate = (offset: number) => {
        const d = new Date()
        d.setDate(d.getDate() + offset)
        return d.toISOString().split('T')[0]
      }
      await supabase.from('leave_requests').upsert([
        { id: 'lr-1', employee_id: 'emp-alice', leave_type: 'Annual', start_date: relDate(-1), end_date: relDate(1), reason: 'Family vacation', status: 'APPROVED', days_count: 2 },
        { id: 'lr-2', employee_id: 'emp-bob', leave_type: 'Sick', start_date: relDate(4), end_date: relDate(6), reason: 'Medical checkup', status: 'PENDING_HR', days_count: 3 },
        { id: 'lr-3', employee_id: 'emp-charlie', leave_type: 'Sick', start_date: relDate(-10), end_date: relDate(-8), reason: 'Flu recovery', status: 'APPROVED', days_count: 3 },
        { id: 'lr-4', employee_id: 'emp-diana', leave_type: 'Personal', start_date: relDate(9), end_date: relDate(11), reason: 'Personal matters', status: 'PENDING_MANAGER', days_count: 3 },
        { id: 'lr-5', employee_id: 'emp-evan', leave_type: 'Annual', start_date: relDate(14), end_date: relDate(18), reason: 'Travel abroad', status: 'PENDING_MANAGER', days_count: 5 },
        { id: 'lr-6', employee_id: 'emp-alice', leave_type: 'Unpaid', start_date: relDate(-30), end_date: relDate(-28), reason: 'Extended leave', status: 'REJECTED', days_count: 3 },
      ])

      // Audit log
      await supabase.from('audit_logs').insert({ action: 'SEED', performed_by: 'system', details: 'Database seeded with initial data' })

      return NextResponse.json({ status: 'seeded', message: 'Database tables found and seeded with initial data!' })
    }

    return NextResponse.json({
      status: 'ready',
      tables: status,
      message: 'All tables exist and have data. Database is ready!',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to setup/seed the database',
    migration_sql_file: '/supabase/migration.sql',
  })
}
