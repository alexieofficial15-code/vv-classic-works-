# 🟢 Hosting Backend on Render

This guide walks you through deploying your **Express REST API Backend** (`backend/`) on **Render**.

---

## 🛠️ Step 1: Create a Render Web Service

1. Sign up or log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`Spare parts website` / `E-commernce-sales-`).

---

## ⚙️ Step 2: Configure Service Settings

Fill in the settings as follows:

| Field | Value |
|---|---|
| **Name** | `vintage-parts-backend` (or your choice) |
| **Language / Environment** | `Node` |
| **Region** | Select region closest to your users |
| **Branch** | `main` (or your active branch) |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free / Starter |

---

## 🔑 Step 3: Add Environment Variables

In the Render Dashboard under **Environment Variables**, add the following keys and values:

| Key | Description | Example Value |
|---|---|---|
| `PORT` | Render internal port | `10000` (or leave default) |
| `SUPABASE_URL` | Your Supabase Project URL | `https://xyzcompany.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase Public Anon Key | `eyJhbGciOi...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_jwt_key_here` |
| `ADMIN_EMAIL` | Master Admin Email | `admin@rustyaircooled.com` |
| `ADMIN_PASSWORD` | Master Admin Password | `admin123` |
| `ADMIN_SECRET_KEY` | Admin Secret Auth Key | `RUSTY-VINTAGE-2026` |

---

## 🚀 Step 4: Deploy & Get Backend URL

1. Click **Create Web Service**.
2. Render will build and launch your Node.js application.
3. Once live, Render displays your service URL at the top left of the dashboard:
   ```
   https://vintage-parts-backend.onrender.com
   ```
4. Test the backend root endpoint in your browser:
   ```
   https://vintage-parts-backend.onrender.com/
   ```
   You should receive a JSON response:
   ```json
   {
     "status": "ONLINE",
     "service": "Aura Vintage Engineering REST API Server",
     "guestBrowsing": "ENABLED",
     "version": "1.0.0"
   }
   ```

---

## 🔗 Step 5: Connect Vercel Frontend to Render Backend

Once your backend is deployed on Render:
1. Go to your **Vercel Dashboard** -> Project Settings -> **Environment Variables**.
2. Add a new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://vintage-parts-backend.onrender.com` (replace with your actual Render URL).
3. Redeploy your Vercel project or push a new commit so Vercel builds the frontend with the Render API URL!
