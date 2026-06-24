-- ============================================
-- LeaveFlow Enterprise - Database Schema
-- Run this in Supabase Dashboard → SQL Editor
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

-- ============================================
-- Enable Row Level Security (public access for app)
-- ============================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow full access policies (app manages auth)
CREATE POLICY IF NOT EXISTS "Allow all on employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on app_users" ON app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on leave_requests" ON leave_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on holidays" ON holidays FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on leave_quotas" ON leave_quotas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Employees
INSERT INTO employees (id, name, department, position) VALUES
  ('emp-alice', 'Alice Johnson', 'Engineering', 'Senior Developer'),
  ('emp-bob', 'Bob Smith', 'HR', 'HR Manager'),
  ('emp-charlie', 'Charlie Brown', 'Finance', 'Accountant'),
  ('emp-diana', 'Diana Prince', 'Marketing', 'PR Specialist'),
  ('emp-evan', 'Evan Williams', 'IT Support', 'System Administrator')
ON CONFLICT (id) DO NOTHING;

-- Users (admin/admin123, manager/manager123, alice/user123)
INSERT INTO app_users (id, username, password, name, email, role, employee_id) VALUES
  ('usr-admin', 'admin', 'admin123', 'Administrator', 'admin@leaveflow.com', 'admin', NULL),
  ('usr-manager', 'manager', 'manager123', 'Bob Smith', 'bob@leaveflow.com', 'manager', 'emp-bob'),
  ('usr-alice', 'alice', 'user123', 'Alice Johnson', 'alice@leaveflow.com', 'employee', 'emp-alice')
ON CONFLICT (id) DO NOTHING;

-- Leave Requests
INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status, days_count) VALUES
  ('lr-1', 'emp-alice', 'Annual', CURRENT_DATE - 1, CURRENT_DATE + 1, 'Family vacation', 'APPROVED', 2),
  ('lr-2', 'emp-bob', 'Sick', CURRENT_DATE + 4, CURRENT_DATE + 6, 'Medical checkup', 'PENDING_HR', 3),
  ('lr-3', 'emp-charlie', 'Sick', CURRENT_DATE - 10, CURRENT_DATE - 8, 'Flu recovery', 'APPROVED', 3),
  ('lr-4', 'emp-diana', 'Personal', CURRENT_DATE + 9, CURRENT_DATE + 11, 'Personal matters', 'PENDING_MANAGER', 3),
  ('lr-5', 'emp-evan', 'Annual', CURRENT_DATE + 14, CURRENT_DATE + 18, 'Travel abroad', 'PENDING_MANAGER', 5),
  ('lr-6', 'emp-alice', 'Unpaid', CURRENT_DATE - 30, CURRENT_DATE - 28, 'Extended leave', 'REJECTED', 3)
ON CONFLICT (id) DO NOTHING;

-- Holidays (26 Indonesian holidays)
INSERT INTO holidays (id, name, date, type, is_recurring) VALUES
  ('hol-01', 'Tahun Baru', '2025-01-01', 'national', true),
  ('hol-02', 'Isra Miraj', '2025-01-27', 'religious', false),
  ('hol-03', 'Tahun Baru Imlek', '2025-01-29', 'religious', false),
  ('hol-04', 'Hari Raya Nyepi', '2025-03-29', 'religious', false),
  ('hol-05', 'Wafat Isa Al-Masih', '2025-04-18', 'religious', false),
  ('hol-06', 'Hari Buruh', '2025-05-01', 'national', true),
  ('hol-07', 'Hari Raya Waisak', '2025-05-12', 'religious', false),
  ('hol-08', 'Kenaikan Isa Al-Masih', '2025-05-29', 'religious', false),
  ('hol-09', 'Hari Lahir Pancasila', '2025-06-01', 'national', true),
  ('hol-10', 'Idul Adha', '2025-06-07', 'religious', false),
  ('hol-11', 'Tahun Baru Islam', '2025-06-27', 'religious', false),
  ('hol-12', 'Hari Kemerdekaan RI', '2025-08-17', 'national', true),
  ('hol-13', 'Maulid Nabi Muhammad', '2025-09-05', 'religious', false),
  ('hol-14', 'Hari Natal', '2025-12-25', 'national', true),
  ('hol-15', 'Idul Fitri Day 1', '2025-03-30', 'religious', false),
  ('hol-16', 'Idul Fitri Day 2', '2025-03-31', 'religious', false),
  ('hol-17', 'Cuti Bersama Idul Fitri 1', '2025-04-01', 'company', false),
  ('hol-18', 'Cuti Bersama Idul Fitri 2', '2025-04-02', 'company', false),
  ('hol-19', 'Cuti Bersama Idul Fitri 3', '2025-04-03', 'company', false),
  ('hol-20', 'Cuti Bersama Idul Fitri 4', '2025-04-04', 'company', false),
  ('hol-21', 'Cuti Bersama Natal', '2025-12-26', 'company', false),
  ('hol-22', 'Cuti Bersama Tahun Baru', '2025-12-31', 'company', false),
  ('hol-23', 'Hari Kartini', '2025-04-21', 'national', true),
  ('hol-24', 'Hari Pendidikan Nasional', '2025-05-02', 'national', true),
  ('hol-25', 'Hari Anak Nasional', '2025-07-23', 'national', true),
  ('hol-26', 'Hari Pahlawan', '2025-11-10', 'national', true)
ON CONFLICT (id) DO NOTHING;

-- Leave Quotas (12 days per employee, current year)
INSERT INTO leave_quotas (id, employee_id, year, total_quota, used_quota, pending_quota) VALUES
  ('lq-1', 'emp-alice', EXTRACT(YEAR FROM CURRENT_DATE)::int, 12, 2, 0),
  ('lq-2', 'emp-bob', EXTRACT(YEAR FROM CURRENT_DATE)::int, 12, 0, 3),
  ('lq-3', 'emp-charlie', EXTRACT(YEAR FROM CURRENT_DATE)::int, 12, 3, 0),
  ('lq-4', 'emp-diana', EXTRACT(YEAR FROM CURRENT_DATE)::int, 12, 0, 3),
  ('lq-5', 'emp-evan', EXTRACT(YEAR FROM CURRENT_DATE)::int, 12, 0, 5)
ON CONFLICT (employee_id, year) DO NOTHING;

-- Audit Logs
INSERT INTO audit_logs (action, performed_by, details) VALUES
  ('SEED', 'system', 'Database seeded with initial data');
