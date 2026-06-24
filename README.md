# 🌿 LeaveFlow — Enterprise Employee Leave Management

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)

**Sistem manajemen cuti karyawan skala enterprise dengan UI modern dan database cloud.**

</div>

---

## ✨ Fitur Utama

- 🔐 **Multi-Role Authentication** — Admin, Manager, dan Employee dengan akses berbeda
- 👥 **User Management** — CRUD pengguna dengan role-based access control
- 📋 **Leave Request Management** — Pengajuan, approval multi-level (Manager → HR), dan tracking
- 📊 **Dashboard Analytics** — Statistik real-time: pending, approved, rejected leaves
- 🗓️ **Holiday Management** — 26 hari libur Indonesia pre-loaded + custom holidays
- 📅 **Leave Calendar** — Visualisasi kalender cuti karyawan
- 💼 **Employee Management** — Profil karyawan dengan kuota cuti (12 hari/tahun)
- 📝 **Audit Trail** — Log aktivitas seluruh sistem
- 🌙 **Dark/Light Mode** — Toggle tema dengan transisi halus
- 📱 **Fully Responsive** — Mobile-first design dengan glassmorphism UI
- ☁️ **Cloud Database** — Supabase PostgreSQL via HTTPS

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Database** | Supabase PostgreSQL |
| **ORM/Client** | @supabase/supabase-js |
| **Styling** | Tailwind CSS 4 |
| **Forms** | React Hook Form + Zod validation |
| **Icons** | Lucide React |
| **Auth** | Custom session-based authentication |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- Akun [Supabase](https://supabase.com) (free tier cukup)

### 1. Clone & Install

```bash
git clone https://github.com/rizkisundara/employee-leave-system.git
cd employee-leave-system
npm install
```

### 2. Setup Environment

Buat file `.env` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### 3. Setup Database

```bash
npm run dev
```

Buka **http://localhost:3000/setup** — halaman ini akan:
1. Mendeteksi tabel yang belum ada
2. Menyediakan SQL migration (klik **Copy**)
3. Link langsung ke **Supabase SQL Editor**
4. Paste SQL → Run → kembali → klik **Re-check**
5. Data seed otomatis dimasukkan!

### 4. Login

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `manager` | `manager123` | Manager |
| `alice` | `user123` | Employee |

## 📁 Project Structure

```
employee-leave-system/
├── src/
│   ├── app/
│   │   ├── (protected)/        # Auth-guarded pages
│   │   │   ├── dashboard/      # Analytics dashboard
│   │   │   ├── employees/      # Employee CRUD
│   │   │   ├── leave/          # Leave request management
│   │   │   ├── holidays/       # Holiday management
│   │   │   ├── users/          # User management
│   │   │   ├── audit/          # Audit trail
│   │   │   └── calendar/       # Leave calendar
│   │   ├── api/                # 13 REST API routes
│   │   │   ├── employees/
│   │   │   ├── leave-requests/
│   │   │   ├── users/
│   │   │   ├── holidays/
│   │   │   ├── leave-quotas/
│   │   │   ├── audit-logs/
│   │   │   ├── auth/login/
│   │   │   ├── dashboard/
│   │   │   └── db/setup/
│   │   ├── login/
│   │   └── setup/              # Database setup wizard
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Custom React hooks (API-based)
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   ├── api-client.ts       # Frontend API wrapper
│   │   └── case-utils.ts       # camelCase ↔ snake_case
│   ├── types/                  # TypeScript type definitions
│   ├── validators/             # Zod schemas
│   └── constants/              # App constants
├── supabase/
│   └── migration.sql           # Database DDL + seed data
└── prisma/                     # Legacy (migrated to Supabase)
```

## 🗄️ Database Schema

```
employees ─────────┬── leave_requests
                   ├── leave_quotas (12 days/year)
                   └── app_users (1:1 optional)

holidays           (26 Indonesian holidays)
audit_logs         (system activity trail)
```

## 📜 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/employees` | List & create employees |
| GET/PUT/DELETE | `/api/employees/[id]` | Employee CRUD |
| GET/POST | `/api/leave-requests` | List & create leave requests |
| GET/PUT | `/api/leave-requests/[id]` | View & update status |
| GET/POST | `/api/users` | List & create users |
| GET/PUT/DELETE | `/api/users/[id]` | User CRUD |
| GET/POST | `/api/holidays` | List & create holidays |
| DELETE | `/api/holidays/[id]` | Delete holiday |
| GET | `/api/leave-quotas` | List quotas |
| GET/POST | `/api/audit-logs` | Activity logs |
| POST | `/api/auth/login` | Authentication |
| GET | `/api/dashboard` | Dashboard stats |
| POST | `/api/db/setup` | Database setup & seed |

## 📸 Screenshots

> Jalankan aplikasi dan kunjungi `http://localhost:3000` untuk melihat UI.

## 🤝 Contributing

1. Fork this repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for internal use.

---

<div align="center">
  <b>Built with ❤️ by Rizki Sundara</b>
</div>
