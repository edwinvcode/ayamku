# Ayamku 🐔

Aplikasi manajemen peternakan ayam KUB berbasis web. Dirancang untuk peternak individu yang ingin melacak lifecycle ayam, telur, vaksinasi, kebersihan kandang, dan keuangan dalam satu platform.

## Fitur

- **Manajemen Ayam** — Tracking batch per fase (Starter, Grower, Layer, Afkir, Indukan) dengan transisi stage otomatis dan manual
- **Manajemen Telur** — Pencatatan stok telur, inkubasi, hasil penetasan, dan penjualan
- **Vaksinasi** — Jadwal vaksin KUB 6 tahap, auto-fill jadwal berikutnya, riwayat lengkap
- **Kebersihan Kandang** — Log pembersihan dengan penjadwalan berikutnya otomatis
- **Keuangan** — Pencatatan pengeluaran & pemasukan, grafik tren 6 bulan, filter periode
- **Dashboard** — KPI ringkasan: stok ayam semua fase, mortalitas, profit bulan ini, dan peringatan otomatis

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **UI**: Tailwind CSS + shadcn/ui
- **Deploy**: Vercel

## Setup

### 1. Clone repo

```bash
git clone https://github.com/edwinvibecode/ayamku.git
cd ayamku
npm install
```

### 2. Environment variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_cron_secret
```

### 3. Database

Jalankan migration SQL di Supabase SQL Editor (urutan):

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_indexes.sql
supabase/004_categories.sql
```

### 4. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Deploy ke Vercel

1. Push repo ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan environment variables di Vercel dashboard
4. Deploy

Cron job lifecycle otomatis berjalan setiap hari pukul 00:00 WIB (dikonfigurasi di `vercel.json`).
