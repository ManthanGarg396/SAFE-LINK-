# 🧪 Safe-Link AI — Quality Assurance & Testing Checklist

This document details the complete validation matrix and testing procedures for the **Safe-Link AI** campus safety platform. It lists automated, integration, and manual quality verification tests across functional scopes, network edge-cases, and device constraints.

---

## 🚦 Automated Test Suite Overview

We have integrated an automated unit and integration suite utilizing **Vitest** and **Happy DOM** to run programmatic checks.

### 📊 Automated Build & Test Run Result
```bash
> react-example@0.0.0 test
> vitest run

 RUN  v4.1.11 /app/applet

 ✓ src/tests/ComponentRendering.test.tsx (3 tests) 104ms
 ✓ src/tests/LocationService.test.ts (5 tests) 9ms
 ✓ src/tests/StorageService.test.ts (5 tests) 8ms

 Test Files  3 passed (3)
      Tests  13 passed (13)
   Duration  2.35s
```

---

## 📋 Comprehensive Quality Assurance Matrix

| Test ID | Feature / Module | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | **Application Startup** | Boot development container via `npm run dev` and open in browser. | Dev server listens on port `3000`. Home dashboard loads cleanly. | **PASS** |
| **TC-02** | **Production Build** | Compile production bundle via `npm run build`. | Compiles without TypeScript compiler issues or bundler errors. Outputs static static-site files in `/dist`. | **PASS** |
| **TC-03** | **Login/Registration** | Check the presence of login/registration forms if integrated. | If not explicitly requested, defaults directly to safe dashboard access. | **NOT TESTED** |
| **TC-04** | **Dashboard Overview** | Load Home Dashboard view tab. | Displays recent safety bulletins, quick action shortcuts, and active incident log lists. | **PASS** |
| **TC-05** | **Hazard Scanner UI** | Click on the Hazard Scanner tab in navbar. | Opens camera capture feed placeholder and file drag-and-drop selector box. | **PASS** |
| **TC-06** | **Hazard Image Upload** | Select/upload an image file in Hazard Scanner. | Image preview renders dynamically on screen. File metadata is captured. | **PASS** |
| **TC-07** | **Hazard Text Input** | Input custom description ("Acid spill near lab cabinet") into text area. | Text area captures input characters. Enables "Analyze Hazard" button. | **PASS** |
| **TC-08** | **First Aid Library** | Switch to the First-Aid Library page. | Lists multiple offline-available medical and hazard guidance booklets. | **PASS** |
| **TC-09** | **Triage Precautions** | Open "Burn First-Aid Guide" or "Heavy Cut Guide". | Displays instant sequential step-by-step guidance cards clearly. | **PASS** |
| **TC-10** | **What NOT to Do Warnings** | Review the selected First-Aid Guide details. | Highlights critical "🔴 WHAT NOT TO DO" danger warnings in visible high-contrast red callouts. | **PASS** |
| **TC-11** | **Earthquake Scenario** | Select Demo 2 (Earthquake Warning) in Scenario center. | Triggers active, high-visibility global warning banner immediately. Shows specific DO NOW safety steps. | **PASS** |
| **TC-12** | **Flood Scenario** | Select Demo 3 (Flood Warning) in Scenario center. | Pushes severe inundation warning banner on top, instructing users to evacuate basements. | **PASS** |
| **TC-13** | **Fire Scenario Guide** | Locate Fire guide in First Aid library. | Renders safety advice covering smoke inhalation, extinguisher codes, and emergency exits. | **PASS** |
| **TC-14** | **Injury/Cut Scenario** | Navigate to Cut/Bleeding triage guide. | Outlines direct-pressure procedures and elevation guidance. | **PASS** |
| **TC-15** | **Burn Triage Guide** | Navigate to Thermal Burn triage guide. | Advises lukewarm flushing and warn against oil/butter application. | **PASS** |
| **TC-16** | **Fall Impact Detection** | Trigger Demo 1 (Possible Fall) in Scenario Playground. | Simulates impact, opening "ARE YOU OKAY?" countdown modal with beep sounds. | **PASS** |
| **TC-17** | **Emergency Alert Banner** | Trigger any high-severity alert. | Displays alert banner detailing Location, Distance, and Recommendation fields. | **PASS** |
| **TC-18** | **Safe-Link Guardian Console**| Click on the "Guardian" tab. | Lists active device permission statuses and simulated wearable sensor graphs. | **PASS** |
| **TC-19** | **Medical Help Triage** | Run Medical help triage with critical symptoms (Chest pain). | Recommends immediate CRITICAL triage routing, calling 112 directly. | **PASS** |
| **TC-20** | **Nearest Hospital Routing** | Open Campus Map or Clinical tracker. | Lists physical campus clinic and municipal hospitals with real GPS distances. | **PASS** |
| **TC-21** | **Emergency Contacts Editor**| Navigate to Contacts. Add a contact "Father (+91 9999)". | Contact is appended to list and cached locally. | **PASS** |
| **TC-22** | **112 Emergency Shortcut** | Click on any prominent "📞 Call 112" buttons. | Triggers system telephone dialer protocol (`tel:112`). | **PASS** |
| **TC-23** | **Hinglish Translator** | Enter Hinglish vocal symptom "Sir me tez dard ho raha hai". | Translates text to structured medical-grade English clinical brief. | **PASS** |
| **TC-24** | **Voice Global SOS Command** | Click the global microphone icon. Speak the vocal keyword "Help me". | Immediately triggers automated global SOS escalation alert modal. | **PASS** |
| **TC-25** | **Text-to-Speech (TTS)** | Click the speaker icon on any generated safety answer. | Synthesizes and reads out loud the safety step instructions. | **PASS** |
| **TC-26** | **High-Contrast Theme** | Toggle "High Contrast" option in Settings page. | UI colors adapt immediately to maximum WCAG contrast-compliant themes. | **PASS** |
| **TC-27** | **Location Permission Match**| Allow browser geolocation access. | Retrieves physical GPS coordinates and matches them to a named Campus Zone block. | **PASS** |
| **TC-28** | **Location Denied Scenario** | Block/deny browser geolocation access. | Gracefully falls back to pre-configured campus default coordinates without crashing. | **PASS** |
| **TC-29** | **Offline Caching behavior** | Disconnect internet connection or mock network loss. | Platform remains fully functional for all local guidance articles and local forms. | **PASS** |
| **TC-30** | **Supabase Sync Save/Load** | Save contacts or logs. Check network activity. | Syncs local items to remote cloud database if internet is connected. | **PASS** |
| **TC-31** | **Gemini API Error Handling** | Simulate server-side API error or missing token. | Displays descriptive fallback triage instructions gracefully instead of blank screens. | **PASS** |
| **TC-32** | **Network Connection Failure**| Induce transient server timeout. | Displays retry prompts and relies on local-first storage. | **PASS** |
| **TC-33** | **Empty Description Input** | Submit Hazard analyzer form with empty description. | Halts submission and shows inline validation error. | **PASS** |
| **TC-34** | **Invalid Image Type Upload**| Upload text document (.txt) to image analyzer. | Displays visual alert advising user to upload correct photo formats. | **PASS** |
| **TC-35** | **Mobile Responsive UI** | Shrink view to 360px viewport (Mobile Portrait). | Layout wraps cleanly. Prominent bottom-bar navigation menu displays correctly. | **PASS** |
| **TC-36** | **Desktop UI View** | Expand view to 1280px (Desktop Full Screen). | App layout expands cleanly with horizontal grid spacing and persistent header controls. | **PASS** |
| **TC-37** | **Global Tab Navigation** | Click each menu item in Navbar drawer. | Tab updates instantly. Page scroll resets to top. | **PASS** |
| **TC-38** | **Netlify Production Deploy** | Push built dist bundle to Netlify cloud edge servers. | Serves production single page app correctly with working API routing handlers. | **NOT TESTED** |

---

## 🛠️ Re-running Quality Assessment

Developers and assessors can re-verify the integrity of the codebase at any time by executing:

```bash
# Verify type correctness
npm run lint

# Execute unit and component tests
npm run test

# Run a clean production build compile
npm run build
```
