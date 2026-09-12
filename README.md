# 🌾 KisanQueue (किसान कतार) — Smart Mandi Queue & Procurement Management System

> **Bridging Indian Farmers to Fair Prices, Digital Mandi Queues, Transparent Weighbridges, and Instant Direct Benefit Transfers (DBT).**

---

## 🌐 Live Demos & Master Documentation

| Resource | Direct URL / File Link | Description |
| :--- | :--- | :--- |
| 🌐 **Live Web Application** | [https://farmer-jii.vercel.app](https://farmer-jii.vercel.app) | Production web portal for KisanQueue |
| ⚙️ **Production Backend API** | [https://indian-farmer.onrender.com](https://indian-farmer.onrender.com) | Render cloud hosted Node.js / Express REST API |
| 📘 **System Architecture & Workflows Guide** | [`SYSTEM_ARCHITECTURE_AND_WORKFLOWS.md`](file:///d:/indian%20farmer/SYSTEM_ARCHITECTURE_AND_WORKFLOWS.md) | Complete step-by-step user journeys & diagrams |
| 🖥️ **Interactive Architecture HTML Guide** | [`SYSTEM_ARCHITECTURE_AND_WORKFLOWS.html`](file:///d:/indian%20farmer/SYSTEM_ARCHITECTURE_AND_WORKFLOWS.html) | Formatted web view of complete architecture |
| 📄 **Hackathon Project Master Docs** | [`HACKATHON_PROJECT_DOCS.md`](file:///d:/indian%20farmer/HACKATHON_PROJECT_DOCS.md) | Full technical blueprint & hackathon submission specs |
| 📱 **Mobile App Screen Blueprint** | [`mobile_app_screen_blueprint.md`](file:///d:/indian%20farmer/mobile_app_screen_blueprint.md) | 38-screen layout & design blueprint specifications |

---

## 📌 Project Overview

**KisanQueue** is a state-of-the-art National Agritech Platform built under the vision of **Ministry of Agriculture & Farmers Welfare** and **Digital India**. During harvest seasons (Rabi & Kharif), millions of Indian farmers spend days waiting in tractor queues outside APMC Mandis, suffering from weighment errors, delayed payments, and middleman exploitation.

**KisanQueue resolves these challenges through:**
1. **Digital Slot Reservation & QR Entry Passes**: Farmers reserve arrival slots in advance, reducing mandi wait times from 30+ hours to under 25 minutes.
2. **DigiLocker KYC & Land Verification**: Instant Aadhaar & Bhoomi Abhilekh (7/12 Khasra extract) verification ensuring only genuine farmers claim Minimum Support Prices (MSP).
3. **Automated Weighbridge Integration**: Direct digital gross & tare weighment recording connected with automated moisture grade meters.
4. **Instant Form J Slips & Direct Bank Transfer (DBT)**: Instant generation of digital Form J receipts and automated payment disbursement directly to farmer bank accounts.
5. **Pan-India Admin Control & Real-time Analytics**: Government dashboard monitoring live mandi congestion, procurement volume, operator performance, and state-wise MSP budgets.

---

## 🏗️ System Architecture & Tech Stack

```mermaid
graph TD
    A[🌾 Farmer Mobile App] -->|REST API & WebSockets| C[⚙️ Node.js / Express Backend]
    B[🚜 Mandi Operator POS Desk] -->|REST API| C
    D[👑 Pan-India Admin Portal] -->|REST API| C
    C -->|ORM Queries| E[(🐘 PostgreSQL Database / Prisma)]
    C -->|OAuth 2.0| F[🔒 DigiLocker KYC API]
    C -->|Agmarknet Feed| G[🏛️ Govt Agmarknet Portal]
    C -->|Aadhaar Payment Bridge| H[💰 NPCI / PFMS DBT Gateway]
```

### 🛠️ Technology Stack

| Layer | Technology | Key Libraries / Modules |
| :--- | :--- | :--- |
| **Mobile Application** | React Native (Expo Router v3) | TypeScript, Lucide React Native Icons, React Native Safe Area Context, React Native Toast Message |
| **Backend API** | Node.js & Express | TypeScript, Prisma ORM, JSON Web Tokens (JWT), BCrypt, CORS, Dotenv |
| **Database** | PostgreSQL | Prisma Schema Engine, Automated Seeding Scripts (`seed.ts`) |
| **Integrations** | External Govt APIs | DigiLocker OAuth, PM-KISAN, e-NAM, Agmarknet MSP Feed, Bhoomi Abhilekh |
| **Web Frontends** | Next.js / Vite | React, Vanilla CSS design system, Charting libraries |

---

## 📱 Mobile Application Modules & Screen Directory (38 Screens)

The mobile application (`mobile/`) features a role-aware multi-portal architecture supporting **Farmers**, **Mandi Operators**, and **Government Admins**.

```
mobile/
├── app/
│   ├── (auth)/        # Authentication & Onboarding (Screens 1 - 6)
│   ├── (farmer)/      # Farmer Services Portal (Screens 7 - 15)
│   ├── (operator)/    # Mandi Operator Desk Tools (Screens 16 - 24)
│   ├── (admin)/       # Government Admin Control (Screens 25 - 33)
│   └── (shared)/      # Shared & Common Screens (Screens 34 - 38)
```

---

### 🔑 1. Authentication & Onboarding Module (`app/(auth)`)

| Screen # | File Path | Purpose & UI Features |
| :---: | :--- | :--- |
| **01** | `app/(auth)/change-language.tsx` | **Language Selection**: 3-column interactive grid for 9 Indian languages (Hindi, English, Punjabi, Marathi, Gujarati, Telugu, Tamil, Bengali, Kannada) with native script tags. |
| **02** | `app/(auth)/onboarding.tsx` | **App Walkthrough**: Animated 3-step carousel introducing Smart Queues, Fair MSP Payouts, and DigiLocker Verification. |
| **03** | `app/(auth)/login.tsx` | **Mobile + OTP Login**: 10-digit phone number entry with auto-trigger OTP input and mock OTP hint (`123456`). |
| **04** | `app/(auth)/digilocker-kyc.tsx` | **DigiLocker KYC Sync**: Mock DigiLocker OAuth screen verifying Aadhaar number, Khasra land record ID, and linked bank account. |
| **05** | `app/(auth)/role-select.tsx` | **Role Selection**: Interactive card selector to enter as **Farmer 🌾**, **Mandi Operator 🚜**, or **Government Admin 👑**. |
| **06** | `app/(auth)/pending-approval.tsx` | **Access Verification Status**: Application submission tracking page showing DigiLocker verification step progress. |

---

### 🌾 2. Farmer Services Portal (`app/(farmer)`)

| Screen # | File Path | Purpose & UI Features |
| :---: | :--- | :--- |
| **07** | `app/(farmer)/dashboard.tsx` | **Farmer Master Dashboard**: Active token status card with live queue position counter, estimated wait time ticker, weather advisory banner, quick action grid, and recent transactions log. |
| **08** | `app/(farmer)/mandis.tsx` | **Mandi Directory**: Searchable list of nearby APMC procurement centres with live congestion tags (`LOW`, `BUSY`, `CONGESTED`), operating hours, distance, and available weighbridge count. |
| **09** | `app/(farmer)/book-slot.tsx` | **Mandi Entry Slot Booking**: Step-by-step booking form with Mandi selector, crop commodity picker (Wheat, Paddy, Mustard, Chana), date picker, arrival time slot picker, and estimated load in Quintals. |
| **10** | `app/(farmer)/token.tsx` | **Live QR Token Pass**: Digital Mandi entry token pass displaying high-contrast scannable QR code, Token ID (`KQ-2026-8942`), assigned Gate #, current queue rank, and vehicle registration number. |
| **11** | `app/(farmer)/live-queue.tsx` | **Live Queue Tracker**: Real-time queue velocity tracker showing tokens called ahead, live weighbridge camera status, estimated call time countdown, and "Reroute Gate" option. |
| **12** | `app/(farmer)/mandi-map.tsx` | **Interactive Mandi Layout Map**: Visual map layout of procurement hub showing Gate 1/2/3 entry points, weighbridges, grain testing lab, canteen, parking bay, and exit gates. |
| **13** | `app/(farmer)/procurements.tsx` | **Procurements & Form J Slips**: List of completed grain sales with weighment weight, moisture deduction %, MSP rate applied, total payable amount, and downloadable PDF Form J slip generator. |
| **14** | `app/(farmer)/payments.tsx` | **DBT Payments & Ledger**: Direct Bank Transfer log displaying credit status (`DISBURSED`, `PENDING`), bank account (SBI •••• 8901), transaction UTR number, and payment breakdown. |
| **15** | `app/(farmer)/govt-hub.tsx` | **Government Schemes & MSP Hub**: Active Government schemes feed (PM-Kisan, Fasal Bima Yojana, Soil Health Card), real-time Agmarknet MSP pricing list, and crop advisory bulletins. |

---

### 🚜 3. Mandi Operator POS Desk (`app/(operator)`)

| Screen # | File Path | Purpose & UI Features |
| :---: | :--- | :--- |
| **16** | `app/(operator)/dashboard.tsx` | **Operator Control Center**: Active Mandi Gate selection indicator, today's total intake counter, pending queue count, gate scan shortcut button, and recent intake audit log. |
| **17** | `app/(operator)/scan.tsx` | **QR Code Gate Scanner**: Camera scanning view simulator with flash toggle, manual token ID entry backup, instant token validation badge, and gate call trigger. |
| **18** | `app/(operator)/checkin.tsx` | **Manual Token Check-In**: Manual search by Token ID or Farmer Mobile Number with vehicle details verification (Tractor Trolley / Truck number) and Gate Pass check-in trigger. |
| **19** | `app/(operator)/intake.tsx` | **Crop Intake & Quality Grading**: Quality inspection form recording grain commodity type, moisture percentage (e.g. `11.4%`), foreign matter %, quality grade (`Grade A` / `Standard`), and lab approval tag. |
| **20** | `app/(operator)/weighment.tsx` | **Weighbridge Gross & Tare Operator**: Dual-scale weighment screen reading Gross Weight (loaded trolley), Tare Weight (empty vehicle), automatically calculating Net Commodity Weight (Qtl). |
| **21** | `app/(operator)/generate-slip.tsx` | **Form J Slip Generator**: Final verification summary displaying farmer details, Net Weight, MSP Rate per Quintal, total transaction payout, and digital signature authorization button. |
| **22** | `app/(operator)/daily-report.tsx` | **Daily Procurement Summary**: End-of-day summary report breaking down total quintals procured per crop, total DBT disbursement amount, total farmers served, and CSV export. |
| **23** | `app/(operator)/stats.tsx` | **Centre Performance Metrics**: Operator speed metrics, average weighbridge turnaround time (mins/vehicle), gate congestion ratios, and hourly intake bar chart. |
| **24** | `app/(operator)/profile.tsx` | **Operator Profile Desk**: Mandi staff ID card, assigned gate & weighbridge ID, shift timing indicator, hardware status (Scale sensor online/offline), and logout button. |

---

### 👑 4. Government Admin Module (`app/(admin)`)

| Screen # | File Path | Purpose & UI Features |
| :---: | :--- | :--- |
| **25** | `app/(admin)/dashboard.tsx` | **Pan-India Control Dashboard**: Master command panel with 6 KPI cards (Total Mandis 148, Active 92, Farmers 12,540, Footfall 1,830, Revenue ₹2.3Cr, Avg Wait 22m), state activity heat map, live alert feed ticker, top 5 mandis leaderboard, and audit trail feed. |
| **26** | `app/(admin)/analytics.tsx` | **Strategic Analytics Hub**: Date range selector (`Today`, `7D`, `30D`, `Season`), metric category tabs (`Volume`, `Farmers`, `Revenue`, `Wait Time`), state comparison graphs, crop distribution breakdown, and PDF report generator. |
| **27** | `app/(admin)/centres/index.tsx` | **Mandi Centres Manager**: APMC Mandi master list with search, state filters, active status badges, gate counts, weighbridge capacity, and FAB `+ Add Centre` creation modal. |
| **28** | `app/(admin)/centres/[id].tsx` | **Centre Detail Editor**: Full Mandi detail editor updating Mandi Name, Code, District, State, GPS Lat/Long map picker, operating hours, active switch, and gate/weighbridge configuration. |
| **29** | `app/(admin)/crops.tsx` | **MSP & Commodity Master**: Commodity cards with crop names in Hindi/English, MSP rate per Quintal, category badges, Edit MSP modal, Add Crop modal, and bulk "Sync MSP from Govt Portal" action. |
| **30** | `app/(admin)/users/index.tsx` | **System Users & Staff Hub**: Multi-role user directory (`All Users`, `Farmers`, `Operators`, `Admins`), search by name/phone/Aadhaar, DigiLocker KYC status tags, and Quick Action Sheet (Activate/Deactivate, Change Role). |
| **31** | `app/(admin)/users/[id].tsx` | **User Profile & KYC Inspector**: Full user profile viewer with DigiLocker Aadhaar & Khasra land record document preview, historical booking log, DBT credit history, and push notification dispatcher modal. |
| **32** | `app/(admin)/audit-logs.tsx` | **Immutable System Audit Trail**: System event trail with category filters (`Auth`, `Booking`, `Intake`, `Payment`, `Admin`), date range picker, search bar, and expandable JSON payload metadata viewer. |
| **33** | `app/(admin)/govt-hub.tsx` | **Govt Data Sync Hub**: Govt Gateway status card, feed status badges (`Agmarknet API`, `PM-KISAN`, `Bhoomi Abhilekh`, `IMD Weather`), manual "Force Sync Now" trigger, Add Scheme modal, Add Advisory modal, and Weather Alert issuer. |

---

### 🌐 5. Shared & Common Screens (`app/(shared)`)

| Screen # | File Path | Purpose & UI Features |
| :---: | :--- | :--- |
| **34** | `app/(shared)/profile.tsx` | **Account & App Settings**: Profile card with DigiLocker badge, **Multi-Role Portal Switcher** (Farmer 🌾, Operator 🚜, Admin 👑), Weight Unit Toggle (`Quintal Qtl` vs `Kg`), Push Notifications switch, Dark Mode preview switch, Mandi shortcuts, and DPDP Data Erasure Modal. |
| **35** | `app/(shared)/notifications.tsx` | **Central Notification Center**: Category filter pills (`All`, `Queue 📊`, `Payment 💰`, `Bookings 📅`, `Weather 🌦️`, `Admin 📢`), unread badge counter, bulk mark all read button, swipe/tap item deletion, and tap-to-navigate action router. |
| **36** | `app/(shared)/support.tsx` | **Kisan Helpline & Support Hub**: 24x7 Toll-Free Kisan Call Centre (`1800-180-1551`) call button, WhatsApp support trigger, Email support, searchable FAQ accordion, ticket category picker, screenshot attachment simulator, and ticket dispatch feedback. |
| **37** | `app/(shared)/about.tsx` | **About KisanQueue & Tech Stack**: Brand card with version details and national slogan (`🌾 किसान समृद्ध भारत 🌾`), mission statement, core highlights grid, direct links to government portals (`e-NAM`, `Agmarknet`, `PM-KISAN`), and Privacy Policy & Terms modal. |
| **38** | `app/(shared)/change-language.tsx` | **Runtime Language Selector**: Reuses/extends language selection grid with dynamic back navigation when opened from settings vs onboarding. |

---

## 🗄️ Database Schema & Prisma Models

The PostgreSQL database is managed via Prisma ORM located in `backend/prisma/schema.prisma`.

```prisma
// Sample Core Entities Schema Overview
model User {
  id            String          @id @default(uuid())
  phone         String          @unique
  name          String
  role          Role            @default(FARMER) // FARMER, OPERATOR, ADMIN
  isKycVerified Boolean         @default(false)
  aadhaarHash   String?
  khasraId      String?
  farmerSlots   SlotBooking[]
  auditLogs     AuditLog[]
  createdAt     DateTime        @default(now())
}

model MandiCentre {
  id              String        @id @default(uuid())
  name            String
  code            String        @unique
  district        String
  state           String
  operatingHours  String
  gates           MandiGate[]
  weighbridges    Weighbridge[]
  slots           SlotBooking[]
}

model CropMaster {
  id          String   @id @default(uuid())
  name        String   @unique
  category    String   // Cereal, Pulse, Oilseed
  mspRate     Float    // Price in INR per Quintal
  season      String   // Rabi, Kharif
}

model SlotBooking {
  id           String            @id @default(uuid())
  tokenNo      String            @unique
  farmerId     String
  mandiId      String
  cropId       String
  bookingDate  DateTime
  slotTime     String
  weightQtl    Float
  status       BookingStatus     @default(CONFIRMED) // CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED
  procurement  ProcurementSlip?
}
```

---

## 📥 Step-by-Step Installation Guide (⚡ Quickstart)

Follow these simple steps to install and run the entire KisanQueue platform on your local computer.

### 📋 System Prerequisites
- **Node.js**: `v18.x` or `v20.x` installed ([Download Node.js](https://nodejs.org/))
- **Git**: Installed on your system ([Download Git](https://git-scm.com/))
- **PostgreSQL Database**: Installed locally or hosted online (e.g. Supabase / Neon / Render)
- **Expo Go App**: Download Expo Go on your Android or iPhone device from Play Store / App Store (Optional for physical device testing).

---

### 1️⃣ Step 1: Clone the Repository
```bash
git clone https://github.com/h-anand21/indian-farmer.git
cd "indian farmer"
```

---

### 2️⃣ Step 2: Backend API Setup (`backend/`)

Open a terminal window and execute:

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install all Node.js dependencies
npm install

# 3. Create .env configuration file
# (Replace DATABASE_URL with your local PostgreSQL connection string)
echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kisanqueue?schema=public" > .env
echo PORT=5000 >> .env
echo JWT_SECRET="kisanqueue_secret_key_2026" >> .env
echo NODE_ENV="development" >> .env

# 4. Run Prisma database migrations to create tables
npx prisma migrate dev --name init

# 5. Populate database with sample Mandis, Crops, and Test Users
npx prisma db seed

# 6. Start the backend development API server
npm run dev
```
> ✅ **Backend Server Running**: The API server will start at `http://localhost:5000/api`.

---

### 3️⃣ Step 3: Mobile App Setup (`mobile/`)

Open a **second terminal window** and execute:

```bash
# 1. Navigate to mobile folder
cd mobile

# 2. Install Expo React Native dependencies
npm install

# 3. Create .env configuration file for mobile app
echo EXPO_PUBLIC_API_URL="http://localhost:5000/api" > .env

# 4. Verify TypeScript compilation
npx tsc --noEmit

# 5. Launch Expo development server
npx expo start
```

#### 📱 Running the Mobile App:
- **On Physical Phone**: Scan the displayed QR code using the **Expo Go** app on your iPhone or Android device.
- **On Android Emulator**: Press `a` in the terminal to launch on Android Studio Emulator.
- **On iOS Simulator**: Press `i` in the terminal to launch on Xcode iOS Simulator.

---

## 🎮 How to Use KisanQueue (User Guide & Testing)

KisanQueue supports **3 distinct user workflows** within the same application. You can switch between roles dynamically during testing.

---

### 🌾 1. The Farmer Workflow (How Farmers Use KisanQueue)

1. **Launch App**: Open KisanQueue on your device.
2. **Select Language**: Pick your preferred language on the initial screen (Hindi, English, Punjabi, etc.).
3. **Login with Mobile**: Enter your 10-digit phone number and submit mock OTP `123456`.
4. **DigiLocker KYC**: Tap **"Sync DigiLocker KYC"** to auto-verify Aadhaar, Land Khasra ID, and bank account.
5. **Book Mandi Entry Slot**:
   - Tap **"Book Slot"** on the dashboard.
   - Select your nearest APMC Mandi (e.g. *Khanna APMC Market*).
   - Choose your crop commodity (e.g. *Wheat / Gehun*).
   - Pick arrival date and a 2-hour arrival window (e.g. *09:30 AM - 11:30 AM*).
   - Enter estimated load in Quintals and tap **"Confirm Booking"**.
6. **View Digital QR Token**: Tap **"My Bookings"** to access your scannable QR token pass (`KQ-2026-8942`). Present this at the mandi entrance gate.
7. **Track Live Queue**: Tap **"Live Queue"** to view real-time tractor position ahead of you and estimated call time.
8. **Download Form J & Check Payout**: Once weighed, view **"Procurements & Form J"** to download your digital receipt and check **"Payments"** for bank DBT credit status.

---

### 🚜 2. The Mandi Operator Workflow (How Operators Use the Mandi POS)

1. **Switch to Operator Mode**: Go to **Profile & Settings** -> Scroll to **🔄 Switch View Mode** -> Tap **Operator 🚜**.
2. **Scan Mandi Gate Token**:
   - Tap **"Gate QR Scanner"** from the operator menu.
   - Align camera over farmer's QR token pass (or manually type token ID `KQ-2026-8942`).
   - Tap **"Verify & Check-In Vehicle"**.
3. **Record Quality & Moisture**:
   - Open **"Crop Intake & Quality Grading"**.
   - Input moisture meter reading (e.g. `11.4%`) and foreign matter %.
   - Select grade (**Grade A**) and tap **"Approve Inspection"**.
4. **Record Weighbridge Weights**:
   - Open **"Weighbridge Gross & Tare"**.
   - Capture **Gross Weight** (loaded tractor trolley).
   - Unload grain into mandi silo.
   - Capture **Tare Weight** (empty tractor trolley).
   - System automatically calculates **Net Commodity Weight (Quintals)**.
5. **Issue Form J Slip & Payout**: Tap **"Generate Form J Slip"** -> Authorize payout -> Farmer receives SMS & instant DBT transfer!

---

### 👑 3. The Government Admin Workflow (How Admins Monitor Mandis)

1. **Switch to Admin Mode**: Go to **Profile & Settings** -> Scroll to **🔄 Switch View Mode** -> Tap **Admin 👑**.
2. **Pan-India Master Control**: View real-time KPI cards (Total Mandis 148, Active 92, Footfall 1,830, Revenue ₹2.3Cr), state heat map, and live congestion alert feed.
3. **Strategic Analytics**: Filter charts by `Today`, `7D`, `30D`, or `Season` to track procurement volumes, state leaderboards, and crop market share distribution.
4. **Manage Mandis & MSP Rates**:
   - Open **"APMC Mandi Centres"** to edit gate counts, weighbridges, and capacity.
   - Open **"MSP Crop Master"** to update crop support rates and trigger "Sync MSP from Govt Portal".
   - Open **"User Management"** to view registered farmers, operators, and toggle account activation status.
5. **Audit Logs & Govt Sync**: Monitor immutable event audit logs and trigger manual data sync with Agmarknet & PM-KISAN APIs.

---

## 🔄 Dynamic Role Switching Guide

For easy demo and hackathon presentation purposes, KisanQueue includes an instant **Multi-Role Portal Switcher**:

1. Open the **Profile & Settings** screen (`app/(shared)/profile.tsx`).
2. Scroll to the **🔄 Switch Portal View Mode** section.
3. Tap **Farmer 🌾**, **Operator 🚜**, or **Admin 👑**.
4. The active navigation state, dashboard tools, and permissions will instantly update across the app without requiring re-login!

---

## 📜 License & Acknowledgments

- **Developer Team**: Built with ❤️ for Indian Farmers.
- **Initiative**: Digital India & Ministry of Agriculture Agritech Hackathon.
- **Open Source Dependencies**: Expo React Native, Node.js, Prisma ORM, Lucide Icons, React Native Toast Message.

---
*KisanQueue — Smart Farming | Fair Prices | Better Tomorrow* 🌾

