# Corporate Software Developer Task Logger

A modern, enterprise-grade daily work tracking and task logging application built specifically for corporate software engineers.

- **Backend**: **Astro 5** (SSR Mode with `@astrojs/node` adapter & REST API endpoints)
- **Frontend**: **Angular 19** (Standalone Components, Signals, Reactive Architecture)
- **Database**: **Drizzle ORM** with SQLite (`better-sqlite3`, WAL mode, foreign keys)
- **Design System**: **IBM Carbon Design System** (Flat 0px corners, IBM Plex Sans, IBM Blue `#0f62fe`, Carbon Gray-100 Dark Mode)
- **Reporting & Export**: **SheetJS (`xlsx`)** for one-click Excel downloads of Daily, Weekly, Monthly, Category-wise, and Project-wise work reports.

---

## 🚀 Features

### 1. Daily Attendance & Working Hours Tracking
- Record **Login Time** and **Logout Time** (one record per calendar day).
- Automatically calculates **Total Working Hours** (`Logout Time − Login Time`).
- Add an **Overall Day Comment / Note** summarizing the day's achievements or blockers.
- **Missed Logout / Login Reminder Banner** alert if attendance is unrecorded.

### 2. Multi-Task Logging per Day
- Log multiple tasks for any day.
- **Task Description**: Rich details of work performed.
- **11 Corporate Task Categories**:
  - `Logs Checking`
  - `Bug Fixing`
  - `API Development`
  - `Database Work`
  - `Code Review`
  - `Deployment`
  - `Testing`
  - `Documentation`
  - `Meetings`
  - `Support`
  - `Production Issue`
- **Task Status Tracking**: `In Progress` | `Pending` | `Completed` (color-coded badges).
- **Time Range & Duration**: Start Time and End Time with automatic duration computation.
- **Tags**: Predefined tags (`Production`, `UAT`, `Development`, `Testing`, `Checking`, `Log`) + custom tags.
- Full CRUD: Add, Edit, Delete tasks with instant duration recalculation.

### 3. Comprehensive Reports & Excel Download
- **Daily Work Report**: Full breakdown of a selected day (attendance, all tasks, category summary).
- **Weekly Work Report**: Aggregated breakdown for Monday–Sunday with daily summaries, total hours, and averages.
- **Monthly Work Report**: Monthly working hours, days worked, and daily logs.
- **Category-wise Report**: Time spent per category with percentage breakdown and visual progress bars.
- **Project / Tag-wise Report**: Time spent per tag/project with percentage breakdown.
- **Excel Export**: Download any report as a `.xlsx` spreadsheet formatted with headers, column widths, and metadata.

### 4. Interactive Analytics Dashboard
- Summary KPI Cards: Hours This Week, Hours This Month, Tasks Completed Today, Average Daily Hours.
- **Working Hours Trend**: 30-day interactive line chart powered by Chart.js.
- **Time by Task Category**: Interactive doughnut chart showing task time distribution.
- **Recent Activity Table**: Quick access to recent logs.

### 5. IBM Carbon Design & Dark Mode
- Strict IBM Carbon Design System tokens:
  - Flat geometry with **`0px` border-radius** everywhere.
  - **IBM Plex Sans** typography (weight 300 for display, 400 for body, 600 for emphasis).
  - High-precision `letter-spacing: 0.16px` on body text.
  - IBM Blue (`#0f62fe`) as the single confident accent.
  - Carbon hairline borders and surface elevation (no drop shadows).
  - Inverted charcoal footer (`#161616`).
- **Dark Mode Toggle**: One-click switch to Carbon Gray-100 theme, persisted in `localStorage`.

---

## 📁 Project Structure

```
corporate-software-developer-task-logger/
├── backend/                              # Astro 5 SSR Backend
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts                  # SQLite database connection & table auto-creation
│   │   │   └── schema.ts                 # Drizzle ORM schema (daily_log, task, task_tag)
│   │   ├── pages/api/
│   │   │   ├── daily-logs/
│   │   │   │   ├── index.ts              # GET (list/filter), POST (create log)
│   │   │   │   ├── [id].ts               # GET, PUT, DELETE daily log
│   │   │   │   ├── by-date/[date].ts     # GET daily log by date (YYYY-MM-DD)
│   │   │   │   └── [logId]/tasks/
│   │   │   │       └── index.ts          # GET tasks, POST create task
│   │   │   ├── tasks/
│   │   │   │   └── [id].ts               # PUT, DELETE task
│   │   │   ├── dashboard/
│   │   │   │   ├── summary.ts            # GET KPI summary metrics
│   │   │   │   ├── trends.ts             # GET 30-day hours trend
│   │   │   │   └── category-distribution.ts # GET category distribution
│   │   │   ├── reminders/
│   │   │   │   └── check.ts              # GET missed login/logout check
│   │   │   └── reports/
│   │   │       ├── daily.ts              # GET daily work report
│   │   │       ├── weekly.ts             # GET weekly work report
│   │   │       ├── monthly.ts            # GET monthly work report
│   │   │       ├── category.ts           # GET category-wise report
│   │   │       └── project.ts            # GET project/tag-wise report
│   │   ├── utils/
│   │   │   ├── response.ts               # Standard API response helpers
│   │   │   └── time.ts                   # Time computation & date helpers
│   │   └── middleware.ts                 # CORS middleware for Angular dev server
│   ├── astro.config.mjs                  # SSR mode with @astrojs/node
│   └── package.json
│
├── frontend/                             # Angular 19 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── dark-mode-toggle/     # Dark mode toggle button
│   │   │   │   ├── reminder-banner/      # Missed login/logout alert banner
│   │   │   │   └── tag-input/            # Carbon-styled tag chip selector
│   │   │   ├── models/                   # TypeScript interfaces & enums
│   │   │   ├── pages/
│   │   │   │   ├── daily-log/            # Daily Log page (main work view)
│   │   │   │   ├── dashboard/            # Analytics dashboard with charts
│   │   │   │   ├── history/              # Past logs search & filter
│   │   │   │   └── reports/              # 5 report types + Excel export
│   │   │   ├── services/                 # Angular HTTP API & Excel services
│   │   │   ├── app.component.html        # Carbon App Shell layout
│   │   │   ├── app.component.scss
│   │   │   ├── app.component.ts
│   │   │   └── app.routes.ts
│   │   ├── styles/                       # Carbon Design System tokens
│   │   └── index.html
│   └── package.json
│
├── start-backend.bat                     # Double-click script to start backend
├── start-frontend.bat                    # Double-click script to start frontend
└── package.json                          # Root convenience scripts
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18+ (tested with Node.js v24)
- **npm**: v9+

### Running the Application

Open two terminal windows:

#### Terminal 1 — Start Backend (Port 4321):
```bash
cd backend
npm run dev
```
*The backend API will run at `http://localhost:4321`.*

#### Terminal 2 — Start Frontend (Port 4200):
```bash
cd frontend
npm start
```
*The Angular UI will run at `http://localhost:4200`.*

---

## 📊 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/daily-logs?from=&to=&page=&limit=` | List logs with pagination & filters |
| `POST` | `/api/daily-logs` | Record new daily attendance log |
| `GET` | `/api/daily-logs/:id` | Get log with tasks and tags |
| `PUT` | `/api/daily-logs/:id` | Update attendance time or comment |
| `DELETE` | `/api/daily-logs/:id` | Delete daily log |
| `GET` | `/api/daily-logs/by-date/:date` | Get log by date (`YYYY-MM-DD`) |
| `GET` | `/api/daily-logs/:logId/tasks` | List tasks for a daily log |
| `POST` | `/api/daily-logs/:logId/tasks` | Add task to daily log |
| `PUT` | `/api/tasks/:id` | Update task details, status, or tags |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `GET` | `/api/dashboard/summary` | Dashboard KPI summary |
| `GET` | `/api/dashboard/trends?days=30` | 30-day working hours trend data |
| `GET` | `/api/dashboard/category-distribution` | Task time by category |
| `GET` | `/api/reminders/check` | Check for missing login/logout |
| `GET` | `/api/reports/daily?date=` | Daily breakdown report |
| `GET` | `/api/reports/weekly?date=` | Weekly summary report |
| `GET` | `/api/reports/monthly?year=&month=` | Monthly summary report |
| `GET` | `/api/reports/category?from=&to=` | Category-wise time report |
| `GET` | `/api/reports/project?from=&to=` | Project/tag-wise time report |

---

## 🎨 Design System Verification

All components strictly implement the **IBM Carbon Design System**:
- Zero rounded corners (`border-radius: 0px`) on buttons, inputs, tabs, cards, chips, and modals.
- Primary CTA background: `#0f62fe` (IBM Blue).
- Subtle hairlines (`#e0e0e0` / `#393939` in dark mode) instead of box shadows.
- Typography: IBM Plex Sans with light weights for display and `letter-spacing: 0.16px` on body text.
