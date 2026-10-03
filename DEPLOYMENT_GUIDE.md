# 🌐 Master Production Deployment Guide
## Classic Aircooled VW Works

This guide provides the complete, step-by-step walkthrough to deploy the entire **Classic Aircooled VW Works** full-stack system live to the internet using **Supabase** (Database), **Render** (Backend API), and **Vercel** (Frontend UI).

---

## 🏗️ Architecture Overview

```
 ┌─────────────────────────────────────────────────────────┐
 │               Vercel Frontend (React + Vite)            │
 │            https://vintage-parts.vercel.app             │
 └────────────────────────────┬────────────────────────────┘
                              │
                              │ HTTPS REST API Calls
                              │ (VITE_API_URL)
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │            Render Backend (Express REST API)            │
 │       https://vintage-parts-backend.onrender.com        │
 └────────────────────────────┬────────────────────────────┘
                              │
                              │ Database Connection
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │           Supabase Cloud Database (PostgreSQL)          │
 │              https://xyzcompany.supabase.co             │
 └─────────────────────────────────────────────────────────┘
```

---

## ⚡ Step 1: Set Up Supabase Cloud Database

1. Log in or create an account at [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**, name it (e.g. `vintage-parts-db`), set a database password, and choose your preferred region.
3. Once the project is provisioned:
   - Go to the **SQL Editor** tab (left sidebar).
   - Click **New Query**.
   - Copy the entire contents of [backend/supabase_schema.sql](file:///d:/PROJECT/vintage%20aircooled%20vw%20qorks/E-commernce-sales--main/backend/supabase_schema.sql) and paste it into the editor.
   - Click **Run** (or `Ctrl + Enter`).
4. Go to **Project Settings** (gear icon) -> **API**.
5. Copy down these two values:
   - **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
   - **service_role secret key** (or **anon public key**)

---

## ⚡ Step 2: Deploy Backend to Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`E-commernce-sales-` / `vintage-parts-monorepo`).
4. Configure the service settings:
   - **Name**: `vintage-parts-backend` (or your choice)
   - **Language / Environment**: `Node`
   - **Region**: Closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add the following keys:

| Environment Variable | Value | Notes |
|---|---|---|
| `PORT` | `10000` | Render internal web port |
| `SUPABASE_URL` | `https://your-project-id.supabase.co` | From Supabase Project Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | From Supabase Project Settings -> API |
| `SUPABASE_ANON_KEY` | `eyJhbGciOi...` | From Supabase Project Settings -> API |
| `JWT_SECRET` | `your_secure_random_jwt_secret_here` | Any long random secret string |
| `ADMIN_EMAIL` | `admin@rustyaircooled.com` | Master Admin login email |
| `ADMIN_PASSWORD` | `admin123` | Master Admin login password |
| `ADMIN_SECRET_KEY` | `RUSTY-VINTAGE-2026` | Master Admin portal security key |

*(Optional Email Notifications)*: If you want the backend to dispatch real emails upon request status updates, also add:
`EMAIL_USER`, `EMAIL_PASS` (e.g. Gmail App Password), `EMAIL_HOST` (`smtp.gmail.com`), `EMAIL_PORT` (`587`). If left empty, emails are safely logged to Render logs without errors.

6. Click **Create Web Service**.
7. Once deployed, Render will show your live backend URL at the top left:
   ```
   https://vintage-parts-backend.onrender.com
   ```
8. Verify it by visiting `https://vintage-parts-backend.onrender.com/` in your browser. You should receive:
   ```json
   {
     "status": "ONLINE",
     "service": "Classic Aircooled VW Works REST API Server",
     "guestBrowsing": "ENABLED",
     "version": "1.0.0"
   }
   ```

*(Optional - Seed initial sample data to Supabase)*:
Run the seeder locally with your Supabase credentials in `backend/.env`:
```bash
npm run seed
```

---

## ⚡ Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Select your GitHub repository.
4. Configure the build settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default, pre-configured in `vercel.json`)
   - **Build Command**: `npm --prefix frontend run build` (automatic)
   - **Output Directory**: `frontend/dist` (automatic)
5. Under **Environment Variables**, add:

| Environment Variable | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://vintage-parts-backend.onrender.com` | Live URL of your Render backend from Step 2 |

6. Click **Deploy**.
7. Vercel will build and launch your frontend SPA at:
   ```
   https://vintage-parts-yourname.vercel.app
   ```

---

## ✅ Step 4: Verification Checklist

Once both services are live:
- [ ] Visit your Vercel URL. Browse parts catalog, filter by engine type and era.
- [ ] Click **Sign In / Register** in the top navigation and create a new customer account.
- [ ] Submit a vintage part request / reservation.
- [ ] Open the **Admin Portal** using your `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SECRET_KEY`.
- [ ] Test status updates, parts inventory management, and live chat messaging.

---

## 🔧 Local Development Reference

To run the full stack locally:
- **Backend**: `npm run dev:backend` (Runs on `http://localhost:5000`)
- **Frontend**: `npm run dev:frontend` (Runs on `http://localhost:5173`)
- **Database**: Connects to Supabase Cloud or in-memory fallback automatically.
