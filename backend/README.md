# Aura Vintage Engineering — Backend API Server

Express REST API server with Supabase Cloud PostgreSQL integration for vintage car parts catalog, customer requests, authentication, and order processing.

---

## 🛠️ Environment Setup Guide

### 1. Configure Environment Variables
Copy `.env.example` to create your local `.env` file (which is gitignored):

```bash
cp .env.example .env
```

Open `backend/.env` and fill in your Supabase credentials:

```env
PORT=5000
JWT_SECRET=vintage_restorer_master_jwt_secret_key_2026_x89a2
ADMIN_EMAIL=admin@rustyaircooled.com
ADMIN_PASSWORD=admin123
ADMIN_SECRET_KEY=RUSTY-VINTAGE-2026

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Where to find your Supabase credentials:**
> Go to [Supabase Dashboard](https://supabase.com/dashboard) -> Select Project -> **Project Settings** -> **API** -> Copy **Project URL** and **`anon` `public` key**.

---

### 2. Database Schema Setup
Execute the complete DDL schema script in your Supabase project:
1. Open [Supabase Dashboard](https://supabase.com/dashboard) -> **SQL Editor** -> **New Query**.
2. Copy the contents of `backend/src/data/schema.sql`.
3. Paste into the SQL Editor and click **Run**.

---

### 3. Start Server & Seed Database

#### Start Development API Server:
```bash
npm run dev
```

#### Seed Initial Data to Supabase:
```bash
npm run seed
```

---

## 📡 Key API Endpoints

- `GET /` — Service Health Check
- `POST /api/auth/register` — Register User Account
- `POST /api/auth/login` — Login User Account
- `POST /api/auth/admin-login` — Admin Portal Login
- `POST /api/requests` — Submit Customer Part Request (Protected)
- `GET /api/requests` — Fetch User's Part Requests (Protected)
- `GET /api/admin/requests` — Fetch All Requests (Admin Protected)
- `PUT /api/admin/requests/:id` — Update Request Status (Admin Protected)
- `GET /api/admin/parts` — Public Catalog Parts
- `POST /api/admin/parts` — Add Part (Admin Protected)
- `PUT /api/admin/parts/:id` — Update Part (Admin Protected)
- `DELETE /api/admin/parts/:id` — Delete Part (Admin Protected)
