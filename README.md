# Skills Locker - Fit College LMS

**Admin Backend for Skills Locker Learning Management System**

A modern, cloud-based LMS delivering short, practical fitness education products across 15 specialized domains.

---

## 🎯 Project Overview

Skills Locker enables Fit College to deliver three tiers of education:

- **Training Bytes** (1 hour) - Quick skill acquisition
- **Microcreds** (1–2 days) - Accredited competencies  
- **Short Courses** (1–3 weeks) - Deeper learning pathways

**Current Status:** Foundation complete, admin backend in development

For full product specification, see [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md)  
For project handover details, see [`HANDOVER.md`](./HANDOVER.md)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PowerShell execution policy enabled (Windows users)

### Installation

> **Note:** PowerShell script execution may be disabled on Windows. If you encounter errors, manually install dependencies.

```bash
# Clone the repository
git clone https://github.com/FC-MBL/The-Skills-Locker.git
cd The-Skills-Locker

# Install dependencies (if PowerShell allows)
npm install

# Or manually enable PowerShell scripts (as admin):
# Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Start development server
npm run dev
```

The app will run at `http://localhost:5173`

---

## 🔐 Demo Login

Enter **any email** at the login screen to authenticate as an ADMIN user (demo mode).

Example: `admin@fitcollege.edu.au`

---

## 📁 Project Structure

```
The-Skills-Locker/
├── src/
│   ├── types/              # TypeScript interfaces & types
│   ├── utils/              # Storage layer, helpers
│   ├── contexts/           # React contexts (Auth)
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   │   ├── LoginPage.tsx
│   │   └── admin/          # Admin routes
│   │       ├── Dashboard.tsx
│   │       └── courses/    # Course management
│   ├── App.tsx             # Main app with routing
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles
├── HANDOVER.md            # Project handover document
├── PRODUCT_SPEC.md        # Product requirements
└── package.json
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **State:** React Context + Zustand
- **Styling:** Vanilla CSS (custom design tokens)
- **Storage:** localStorage (migration-ready to Firebase/Supabase)

---

## 📊 Data Model

The app uses a simple JSON-based data model stored in `localStorage`:

- **Domains** (15 fitness specializations)
- **Courses** (110 items: Bytes, Microcreds, Shorts)
- **Modules/Lessons/Blocks** (course structure)
- **Questions & Quizzes** (assessment system)
- **Cohorts** (learner groups)
- **Users** (role-based: ADMIN, EDITOR, REVIEWER, ASSESSOR, LEARNER)

See [`src/types/index.ts`](./src/types/index.ts) for full type definitions.

---

## 🎨 Design System

**Inspiration:** [Inclusive AF](https://inclusiveaf.com) - vibrant, modern, approachable

**Design Tokens** (defined in `src/index.css`):
- Primary: `#6366f1` (indigo)
- Secondary: `#ec4899` (pink)
- Accent: `#f59e0b` (amber)

---

## 🧪 Development Commands

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run test      # Run Vitest tests
npm run test:e2e  # Run Playwright E2E tests
```

---

## 📝 Current Features

### ✅ Completed (Foundation)
- Authentication context with role-based permissions
- Protected routing (admin routes require login)
- localStorage abstraction layer (easy backend migration)
- TypeScript type definitions for entire data model
- Publish checklist validation logic
- Prerequisite circular dependency detection

### 🚧 In Progress (Phase 2)
- Admin layout with navigation
- Course list view with filters
- Course form (metadata editor)
- Course builder UI

### 📅 Planned (MVP)
- Question bank & quiz builder
- Workflow gates (DRAFT → IN_REVIEW → PUBLISHED)
- Cohort management
- AI-assisted authoring (Phase 3)

---

## 🔄 Migration Path

The `storage.ts` abstraction layer allows easy migration from localStorage to:

- **Firebase Firestore** (real-time, auth integration)
- **Supabase** (Postgres, row-level security)
- **Custom API** (if backend team exists)

Simply swap the storage implementation without changing app logic.

---

## 📚 Documentation

- **[HANDOVER.md](./HANDOVER.md)** - Complete project context & handover summary
- **[PRODUCT_SPEC.md](./PRODUCT_SPEC.md)** - Product requirements & feature breakdown
- **[Implementation Plan](./brain/.../implementation_plan.md)** - 7-week MVP roadmap

---

## 🤝 Contributing

This project is built with Google AI Studio (Antigravity).

**Current development focus:** Admin backend MVP (Phase 1)

---

## 📄 License

Proprietary - Fit College (FC-MBL)

---

## 🆘 Troubleshooting

### PowerShell Script Execution Error

If you see `running scripts is disabled on this system`, run as admin:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Then retry `npm install`.

### Cannot find module '@/*'

Path aliases require TypeScript. Ensure `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### localStorage data not persisting

Check browser privacy settings. localStorage may be disabled in incognito mode.

---

**Built with ❤️ by Antigravity AI for Fit College**
