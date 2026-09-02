# 🛡️ Safe-Link AI — Campus Safety Companion

Safe-Link AI is a modern, high-performance web application designed to serve as an intelligent safety net for campus communities, laboratories, and workspaces. By combining real-time offline-first support, multimodal AI analysis, active disaster response warnings, and wearable sensor telemetry simulations, Safe-Link AI ensures individuals are never left without actionable guidance when seconds count.

---

## 📌 Problem Statement

In times of physical emergencies, disasters, or medical distress within university campuses or commercial work environments, critical information is often scattered, generic, or unavailable due to network dropouts. Users facing situations such as physical injuries, sudden falls, fires, earthquakes, chemical leaks, or flash floods struggle with:
1.  **Immediate Action Confusion:** Finding actionable, step-by-step first-aid advice versus what they must absolutely avoid doing.
2.  **Delayed Escalation & Dispatch:** Confirming safety status and dispatching geo-coordinates to emergency contacts or public emergency networks (like 112 in India).
3.  **Communication Barriers:** Explaining native vocal symptoms or understanding signs in foreign scripts under stress.
4.  **Device Connectivity Outages:** Accessing trusted emergency resource files when networks go offline.

Safe-Link AI bridges these gaps by providing an integrated, localized, intelligent, and highly accessible safety and triage companion.

---

## ✨ Key Features

### 1. 🤖 AI/Gemini Integration
*   **Intelligent Diagnostics:** Leverages server-side Gemini models to evaluate complex medical symptoms, identify laboratory hazards, and generate triage pathways.
*   **Fully Server-Side Proxy:** To prevent exposing highly sensitive API keys, all AI operations are routed securely through an internal `/api/*` middleware architecture.

### 2. 🔍 Multimodal Text + Image Analysis (Hazard Scanner)
*   **Visual Hazard Recognition:** Users can upload or snap pictures of unsafe conditions (e.g., frayed electrical wiring, structural cracks, or chemical spills).
*   **Instant Context-Aware Response:** The visual scanner identifies imminent danger categories, assigns severity ratings (Low to Critical), and produces direct responder steps.

### 3. 🩹 First Aid Guidance & Precautions
*   **Interactive Triage Workflows:** Direct interactive questions for cuts, burns, or physical injuries.
*   **What NOT to Do:** Explicit, highlighted, high-visibility warnings detailing actions that might worsen injuries (e.g., "Do NOT apply ice directly to a third-degree burn").

### 4. 🚨 Real-time Emergency Alerts
*   **Active Campus Broadcasts:** High-priority visual and auditory banners triggered instantly during severe events (Earthquakes, Floods).
*   **Split Guidance Format:** Clean, scannable cards displaying **🟢 DO NOW** and **🔴 DO NOT / AVOID** directions.
*   **"I'm Safe" Status Logger:** Enables users to check in and register their safety status immediately with campus control desks.

### 📱 5. Safe-Link Guardian (Wearable & Impact Monitoring)
*   **Sensor Indicator Status:** Displays visual permissions for Device Geolocation, Microphone, Camera, and Motion telemetry.
*   **Fall-like Motion Simulator:** Simulates unexpected physical G-force impacts. Triggers an automated "ARE YOU OKAY?" 10-second countdown with warning sounds and verification options to avoid false-positive alarms.

### 🏥 6. Medical Help & Nearest Hospital Tracker
*   **Symptom Risk Prioritizer:** A 4-stage clinical triage wizard grouping risks into **CRITICAL**, **HIGH**, **MODERATE**, or **LOW** priority levels.
*   **Interactive Map Routing:** Showcases precise GPS distances, physical contact details, and current bed occupancies of the closest campus clinics and local hospitals.

### 📞 7. Emergency Contacts & 112 Dispatch
*   **Primary Safety Contacts:** Quick shortcuts to alert pre-configured family members, guardians, hostel wardens, or security teams.
*   **India 112 Safety Bridge:** A prominent, accessible one-click dispatch button to coordinate instant reports with emergency networks.

### 🌐 8. Multilingual Translation & Voice Services
*   **Voice-Enabled Triage:** Hands-free vocal monitoring globally allows users to speak *"Help me"* to trigger an immediate automatic SOS escalation.
*   **Hinglish Doctor Summaries:** Allows colloquial native Hindi/Hinglish speech inputs (e.g., *"Mere pair mein dard hai"*) and translates them into clinical, structured medical-grade English reports.

### ♿ 9. Deep Accessibility & Offline Information
*   **Universal Design:** Configurable settings for high-contrast colors, text resizing, reduced motion, and auditory text-to-speech (TTS) playback.
*   **Offline Incident Log Cache:** Syncs critical safety profiles and local reports to local state fallback stores when networks fail.

---

## 🛠️ Technology Stack

*   **Frontend Framework:** React 19 + TypeScript + Vite
*   **Styling Engine:** Tailwind CSS
*   **Animation System:** Motion (motion/react)
*   **Testing Suite:** Vitest + Happy DOM + Testing Library React
*   **Database Sync:** Supabase JS client
*   **Production Deployment:** Netlify

---

## 📂 Project Folder Structure

```
/
├── .env.example              # Template for environment configurations
├── package.json              # App dependencies and run scripts
├── tsconfig.json             # TypeScript rules and compiler flags
├── vite.config.ts            # Development server middleware configurations
├── vitest.config.ts          # Vitest framework environment and runner settings
├── netlify.toml              # Netlify cloud routing and deployment rules
├── src/
│   ├── App.tsx               # Main application layout and router controller
│   ├── main.tsx              # React mounting entry point
│   ├── types.ts              # Centralized global TypeScript interfaces & types
│   ├── index.css             # Tailwind base and global style overrides
│   ├── components/           # Reusable UI controls and navbar blocks
│   ├── pages/                # Functional safety screens
│   │   ├── HomePage.tsx               # Primary dashboard & safety log feed
│   │   ├── GuardianPage.tsx           # Telemetry status & fall detection simulator
│   │   ├── MedicalHelpPage.tsx         # Clinical triage & Hinglish summary engine
│   │   ├── NotificationsPage.tsx       # Sub-channeled active incident feed
│   │   ├── DemoCenterPage.tsx          # 6-step Scenario Simulation playground
│   │   ├── HazardVisionPage.tsx        # Gemini-assisted multimodal camera analyzer
│   │   ├── FirstAidLibraryPage.tsx     # Offline guidance files & what-not-to-do notes
│   │   ├── EmergencyContactsPage.tsx   # Contact editor and primary alerts
│   │   └── CampusMapPage.tsx           # Hospital mapping coordinates
│   ├── services/             # Dynamic core APIs and local databases
│   │   ├── storage.ts                 # Supabase and LocalStorage caching
│   │   ├── locationService.ts         # Geolocation coordinates and zones
│   │   ├── supabaseClient.ts          # Supabase client wrapper
│   │   └── tts.ts                     # Speech synthesis playback
│   └── tests/                # Automated test specifications
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory to store your credentials:

```env
# Server-side Gemini API key (Never exposed to browser client)
GEMINI_API_KEY=your_gemini_api_key

# Supabase Real-time Sync Keys
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

*Note: In the development playground, default fallback endpoints are configured automatically to allow instant testing.*

---

## 🚀 Local Development Setup

Follow these commands to run the project locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Local Dev Server (Vite)
Runs the application on port `3000`:
```bash
npm run dev
```

### 3. Run Automated Tests
Executes the Vitest unit and integration suites:
```bash
npm run test
```

### 4. Run Production Build
Generates compiled production-ready assets in the `dist` folder:
```bash
npm run build
```

---

## 📦 Deployment Instructions

### Netlify Deployment
The app includes a fully configured `netlify.toml` layout. To publish:
1.  Connect your repository (or folder bundle) to Netlify.
2.  Configure the build settings:
    *   **Build Command:** `npm run build`
    *   **Publish Directory:** `dist`
3.  Add environment variables (`GEMINI_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Netlify site dashboard under **Site configuration > Environment variables**.

---

## 🔒 Security, Privacy & Responsible AI Limitations

1.  **Strict Client Safety:** No secret API credentials or Gemini keys are ever bundle-compiled or shared with the client-side browser runtime.
2.  **Responsible AI Medical Disclaimer:** The Symptom Priority triage and diagnostic suggestions generated by Safe-Link AI are **purely for informational guidance and campus simulator testing**. It is not a certified medical device and must never substitute professional diagnostic decisions.
3.  **Encrypted Telemetry Cache:** Physical wearable sensor telemetry metrics, fall coordinates, and incident history lists are saved directly to local browser caching stores or secure Supabase tables, and can be wiped instantly with the "Clear All Logs" setting.

---

## 🎮 Playground Preset Demo Scenarios

Test the application immediately in the **Scenario Center** (`/src/pages/DemoCenterPage.tsx`):
*   **📱 DEMO 1 — Possible Fall-like Motion:** Simulates sudden physical accelerometer fall impacts and triggers the countdown verify modal.
*   **🌎 DEMO 2 — Earthquake Alert Banner:** Broadcasts a campus disaster warning layout with DO NOW instruction columns.
*   **🌊 DEMO 3 — Campus Flood Warning:** Simulates severe flood water basements and guides users to elevated locations.
*   **🏥 DEMO 4 — Critical Medical Emergency:** Launches symptom-based high/low risk level prioritizers.
*   **⚡ DEMO 5 — Image-to-Hazard Recognition:** Feeds frayed wiring visual presets to server-side Gemini models.
*   **👨‍⚕️ DEMO 6 — Doctor Summary Translator:** Simulates Hinglish speech recognition translating to clean English medical summaries.
