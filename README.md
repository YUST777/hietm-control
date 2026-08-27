# HIET Control & Examination Proctoring System
### نظام إدارة الكنترول وتوزيع المراقبات — المعهد العالي للهندسة والتكنولوجيا

[![Live Demo](https://img.shields.io/badge/Live%20Demo-hietm--control.vercel.app-1f4d78?style=for-the-badge&logo=vercel)](https://hietm-control.vercel.app)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

A modern, high-performance web and desktop management platform designed for Higher Institutes of Engineering & Technology (H.I.E.T). Provides comprehensive tools for exam scheduling, proctor allocation, conflict detection, academic hours tracking, and official 14-stage control workflows.

---

## 🌐 Live Web Application

- **Live URL:** [https://hietm-control.vercel.app](https://hietm-control.vercel.app)
- **Deployment Platform:** Vercel (Edge CDN)

---

## ✨ Features

- **🏛️ Pre-Loaded Authentic Institute Database:**
  - **72 Staff Observers** (Professors, Associate Professors, Lecturers, and Teaching Assistants).
  - **273 Academic Courses** across Basic Sciences, Architectural, Civil, and Electrical Engineering.
  - **24 Examination Halls** with floor locations and room numbers.
  - **3 Official Leadership Signatories:**
    - رئيس لجنة الجداول: د. حياه سامي على احمد
    - مدير النظام ورئيس الكنترول: أ.م.د. علي سمير عوض
    - عميد المعهد: أ.د. رجب عبد العزيز السحيمي
- **⚡ Real-Time Proctor Conflict Detection:** Flags double-booked invigilators within the same examination slot.
- **📊 Proctoring Hours Dashboard:** Instant calculation and breakdown of invigilation hours by staff title and department.
- **📋 14-Stage Official Control Matrix:** Real-time checklist and progress tracking for exam paper reception, model answers, grading, and score recording.
- **🔍 View Scaling & Zoom Controls:** Quick toggles (`70%`, `75%`, `85%`, `100%`) so extensive schedules fit on a single screen without scrolling.
- **🖨️ A4 Landscape Printing:** Pixel-perfect printable sheets with official institutional headers and 3-signatory verification blocks.
- **💾 Offline-First Storage:** Automatically synchronizes all changes with `localStorage`, with support for full JSON backup exports and factory resets.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, Cairo Font (Google Fonts)
- **Icons:** Lucide React
- **Desktop Runtime (Optional):** Electron
- **Hosting:** Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YUST777/hietm-control.git

# Navigate to the project directory
cd hietm-control

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production (Web)

```bash
npm run build
```

The output will be generated in the `dist/` directory.

### Build Desktop Executables (Optional)

```bash
# Build Linux AppImage
npm run electron:build:linux

# Build Windows Portable (.exe)
npm run electron:build:win
```

---

## 📁 Project Structure

```text
├── public/                    # Static assets and icons
├── src/
│   ├── components/            # UI Components
│   │   ├── Navbar.tsx         # Top bar with KPI pills, year selector, and zoom controls
│   │   ├── NavigationTabs.tsx # Main category and proctoring tabs
│   │   └── views/             # Module Views
│   │       ├── ScheduleView.tsx          # Exam allocation & proctor assignment
│   │       ├── HoursDashboardView.tsx    # Staff hours calculation
│   │       ├── ObserverDaysView.tsx      # Weekly attendance availability
│   │       ├── CommitteesView.tsx        # Exam hall management
│   │       ├── SubjectsView.tsx          # 273-course curriculum directory
│   │       ├── ControlWorksView.tsx      # 14-stage control matrix
│   │       └── SignaturesSettingsView.tsx # Leadership signatory editor
│   ├── lib/
│   │   ├── initialData.ts     # Pre-seeded authentic institute dataset
│   │   └── store.ts           # State management with localStorage persistence
│   ├── types/
│   │   └── control.ts         # TypeScript interfaces and domain models
│   ├── App.tsx                # Root orchestration
│   ├── main.tsx               # React application entrypoint
│   └── styles.css             # Tailwind CSS root styles
├── electron/                  # Electron main and preload scripts
├── vercel.json                # Vercel deployment configuration
└── package.json               # Scripts and dependencies
```

---

## 📄 License

MIT License — Developed for Higher Institute of Engineering & Technology (H.I.E.T).
