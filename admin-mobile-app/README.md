# Vintage VW Admin Desk - Mobile Reply App

A dedicated React Native (Expo) mobile application designed specifically for the workshop admin to receive real-time push notifications on their Android phone whenever a customer sends a message or inquires about parts on the website, and reply directly from their phone.

---

## 🔒 Security Architecture & Session Management

1. **Direct Supabase `messages` Table Synchronization**:
   - Synchronizes directly with the exact same Supabase database `messages` table used by the web user dashboard.
   - When a user sends a message on the website, it writes to `messages`, and dispatches an instant push notification to your registered Android phone.
   - When you reply from the mobile app, it writes directly to `messages` as `sender_role: 'ADMIN'`, appearing instantly in the user's chat window.

2. **SQL Injection Defense & Input Sanitization**:
   - Dual-layer defense: Client-side input sanitization (`sanitizeClientInput`) and backend request sanitization (`sanitizeInput`).
   - Removes null-byte poisoning (`\0`), strips script tags, and enforces strict type and length limits.
   - All database operations utilize Supabase's prepared parameterized query engine to prevent SQL injection attacks.

3. **Admin Sign-In Authentication Page**:
   - Access to the mobile app is strictly guarded behind a secure Sign-In page (`LoginScreen.js`).
   - Admin logs in with email (`admin@rustyaircooled.com` or custom admin email) and password.
   - Supports alternative secret token / passkey authentication for engineer override.

4. **7-Day Session Management**:
   - Upon successful sign-in, the backend issues an authenticated JWT with `expiresIn: '7d'` and sets `expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000`.
   - The mobile app securely stores the session (`session.js`).
   - On app startup, it checks session validity. If the session is within 7 days, you are logged in automatically without re-entering credentials.
   - Once 7 days elapse, the session automatically expires, clears from storage, and requires the admin to sign in again with an alert banner.

---

## 🚀 Key Features

1. **Direct Customer Messaging & Quick Reply**:
   - Replaces external third-party chat widgets (Tawk.to) with a direct, private workshop communication channel.
   - Shows all active customer inquiries with unread badges (`🔴 X New`).
   - Interactive conversation thread between customer and lead specialist.
   - 1-Tap Quick Reply chips (e.g. *"Yes, we have that vintage part in stock"*, *"Please send engine code/photos"*, *"Preparing quote now"*).

2. **Push & Sound/Vibration Notifications**:
   - Registers your Android device with the backend API.
   - Sounds an alert and vibrates your phone whenever a customer sends a message.
   - Dedicated notification toggle switch in the app to turn alerts **ON** or **OFF** at will.
   - "Test Notification" button to verify your phone's ring and vibration immediately.

3. **Workshop Dark Aesthetic**:
   - Customized dark vintage aesthetic matching the main site (`#131314` background, `#ff7a1a` orange highlights, technical data fonts).

---

## 📱 How to Run & Test on Your Android Phone

### Step 1: Install Expo Go on Your Android Phone
- Open the **Google Play Store** on your Android phone and search for **Expo Go** (free app).
- Install **Expo Go**.

### Step 2: Start the Expo Development Server
In your terminal, navigate to the `admin-mobile-app` directory and run:

```bash
cd "admin-mobile-app"
npm install
npx expo start
```

### Step 3: Scan the QR Code
- Expo will display a large **QR code** in your terminal and browser window.
- Open **Expo Go** on your Android phone and tap **"Scan QR code"**.
- Point your phone camera at the QR code.
- The app will load onto your phone in seconds!

### Step 4: Sign In
- Log in with your admin credentials (default: `admin@rustyaircooled.com` / `admin123`).
- Your session is now active and will remain signed in for **7 days**.

---

## 🔔 Testing Push Notifications

1. When opening the app for the first time, allow notification permissions when prompted.
2. The top notification banner will display:
   **"Phone Push Notifications ON - Phone rings when customer messages"**.
3. Go to **Settings (⚙️ icon)** and tap **"TEST NOTIFICATION SOUND & VIBRATION"** to verify that your device rings and vibrates.

---

## 📦 How to Build Standalone Android APK (.apk)

If you prefer to install a standalone Android `.apk` file directly on your phone instead of using Expo Go:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in with your free Expo account:
   ```bash
   eas login
   ```
3. Build the standalone Android APK:
   ```bash
   eas build -p android --profile preview
   ```
4. Download the generated `.apk` link to your Android phone and tap **Install**!

---

## 🔒 Security Reminder
- Per project instructions, **do not push any mobile app or credentials to GitHub yet**. Everything remains strictly in your local workspace.
