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
| `JWT_SECRET` | Secret key for JWT tokens (must be >= 32 characters) | `generate_random_32_plus_char_secret_string` |
| `ADMIN_EMAIL` | Master Admin Email | `admin@classicaircooledvwworks.com` |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash generated via `node backend/scripts/hash-password.js <password>` | `$2b$10$...` |
| `CLIENT_ORIGIN` | Allowed Frontend Origins (comma-separated for Vercel & custom domain) | `https://your-app.vercel.app,https://www.yourdomain.com` |
| `SUPABASE_URL` | Your Supabase Project URL | `https://xyzcompany.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (secure backend queries) | `eyJhbGciOi...` |
| `SUPABASE_ANON_KEY` | Supabase Public Anon Key | `eyJhbGciOi...` |
| `ADMIN_SECRET_KEY` | Optional Admin Secret Auth Key | `optional_secret_key` |

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
