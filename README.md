# NextHire - Advanced AI Job Portal & ATS Platform

A full-stack modern job portal and Applicant Tracking System (ATS) built with **Python (FastAPI)** and **TypeScript (React + Vite + Tailwind CSS)**. 

Designed to run completely standalone with **zero Docker requirement**, zero credentials committed, and 100% synthetic test data conforming to strict privacy standards.

---

## 🌟 Key Advanced Features

### 1. 🤖 Intelligent AI Fit & Resume Matching Engine
- Automated scoring algorithm evaluating candidate technical competencies, experience depth, and headline keywords against job requirements.
- Returns a real-time percentage fit score (0–100%) with categorized **Matched Skills**, **Missing Skills**, and hiring recommendation.
- Visual match score meters on job cards and candidate application pipelines.

### 2. 📋 Interactive ATS (Applicant Tracking System) Kanban Board
- Full recruiting pipeline with 6 workflow stages:
  - `Applied` ➔ `Under Review` ➔ `Shortlisted` ➔ `Interview Scheduled` ➔ `Offer Extended` ➔ `Rejected`
- Instant stage transitions via dropdowns or evaluation drawer.
- **Candidate Inspection Drawer**:
  - Full candidate resume snapshot.
  - Candidate cover note.
  - Internal recruiter/hiring team private feedback notes.
  - Integrated interview scheduler with date & time picker.

### 3. 🔍 Faceted Search & Filtering Engine
- Real-time keyword search across job titles, descriptions, and required skills.
- Multi-dimensional filters:
  - Workplace style (`100% Remote`, `Hybrid`, `On-site`).
  - Experience level (`Entry`, `Mid`, `Senior`, `Lead / Architect`).
  - Employment type (`Full-time`, `Part-time`, `Contract`, `Internship`).
  - Department (`Engineering`, `DevOps & SRE`, `AI Research`, `Data Platform`).
  - Dynamic sorting by `Newest First`, `Highest Salary`, and `Most Viewed`.

### 4. 📄 Structured Resume Builder & AI Scanner
- Candidate profile management with technical competencies, work history, education, and links.
- **Smart AI Resume Scanner**: Candidates can paste raw resume text or LinkedIn summaries to automatically extract skills and title.
- One-click JSON resume export.

### 5. 📊 Platform Analytics & Labor Market Intelligence
- Aggregated real-time metrics: active jobs, hiring companies, candidates, and processed submissions.
- **Top Demanded Skills Bar Chart**: Frequency breakdown across all active listings.
- **ATS Stage Funnel**: Conversion distribution across the hiring lifecycle.

### 6. 🏢 Employer Job Console & Posting Wizard
- Publish new job postings with salary ranges, customizable skill tags, and formatting.
- Manage active vs. closed status, monitor view counts, and directly launch the ATS board for any posting.

### 7. 🛡️ Role-Based Access Control & 1-Click Demo Evaluation
- JWT Authentication (Access tokens with bcrypt password hashing).
- Roles: `job_seeker`, `employer`, `admin`.
- **1-Click Demo Switcher** in the navigation bar to immediately evaluate the system as:
  - **Alex Rivera (Candidate)**: Senior Full-Stack Engineer (`candidate@example.com`).
  - **Sarah Lin (Employer)**: VP of Talent at TechNova (`employer@example.com`).
  - **Jordan Taylor (Admin)**: Platform Administrator (`admin@example.com`).

---

## 🔒 Privacy & Security Compliance

- **No Real Credentials**: All environment variables use safe, non-sensitive local development defaults (`.env.example`).
- **Zero Real Personal Data (PII)**: All mock candidates, phone numbers (`555-01xx`), companies, and emails belong to RFC reserved test domains (`@example.com`).
- **No Docker Required**: Runs directly via standard Python virtual environment and Node.js.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

---

### Step 1: Run the Python Backend

```bash
# From repository root
./venv/bin/uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
* The backend will automatically create SQLite database tables and seed realistic sample data on its first launch.
* API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
* Health Check: `http://127.0.0.1:8000/api/health`

---

### Step 2: Run the TypeScript Frontend

```bash
# From repository root
cd frontend
npm run dev
```
* Open your browser at `http://127.0.0.1:5173`.
* The Vite dev server automatically proxies `/api` calls directly to `http://127.0.0.1:8000`.

---

## 📁 Repository Structure

```
job-portal/
├── backend/
│   ├── app/
│   │   ├── config.py           # Safe environment settings (zero real secrets)
│   │   ├── database.py         # SQLAlchemy SQLite session & engine
│   │   ├── models.py           # User, Company, Job, Application, SavedJob, ResumeProfile
│   │   ├── schemas.py          # Pydantic request/response validation schemas
│   │   ├── auth.py             # JWT token handling & bcrypt authentication
│   │   ├── matching_engine.py  # AI semantic & skills match scoring algorithm
│   │   ├── seed_data.py        # Realistic synthetic test dataset (zero PII)
│   │   └── routers/
│   │       ├── auth_router.py
│   │       ├── jobs_router.py
│   │       ├── applications_router.py
│   │       ├── resume_router.py
│   │       ├── company_router.py
│   │       └── analytics_router.py
│   ├── main.py                 # FastAPI application entrypoint & CORS
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Header with 1-click Demo Persona switcher
│   │   │   ├── AuthModal.tsx         # Sign in / Sign up dialog
│   │   │   ├── HeroSearch.tsx        # Search bar & trending tech pills
│   │   │   ├── JobList.tsx           # Job cards, match score badges, apply modal
│   │   │   ├── AtsBoard.tsx          # Kanban pipeline with candidate evaluation drawer
│   │   │   ├── ResumeBuilder.tsx     # Candidate resume editor + AI text parser
│   │   │   ├── MyApplications.tsx    # Candidate tracker with stage progress bar
│   │   │   ├── EmployerDashboard.tsx # Job posting wizard & management table
│   │   │   ├── CompanyDirectory.tsx  # Browse tech employers & open positions
│   │   │   └── AnalyticsView.tsx     # Platform hiring analytics & skill demand
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # Auth state management
│   │   ├── api.ts                    # Typed API client
│   │   ├── types.ts                  # Shared TypeScript interfaces
│   │   ├── App.tsx                   # Main tab router layout
│   │   └── index.css                 # Tailwind CSS styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── .gitignore
└── README.md
```

---

## 🧪 Testing Accounts (Demo Access)

You can click any demo persona in the top navigation bar or log in manually with the following test credentials:

| Persona | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Candidate** (Alex Rivera) | `candidate@example.com` | `Password123!` | Job Seeker |
| **Employer** (Sarah Lin) | `employer@example.com` | `Password123!` | Employer |
| **Admin** (Jordan Taylor) | `admin@example.com` | `Password123!` | System Admin |

