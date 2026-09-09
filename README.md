# CampusTrack AI

CampusTrack AI is a student attendance intelligence dashboard for monitoring subject-wise attendance, predicting shortages, exploring what-if scenarios, managing Leave/On-Duty requests, and checking condonation eligibility.

The project is built as a full-stack Next.js application. It runs immediately with seeded in-memory demo data, and it includes a Supabase PostgreSQL schema for connecting the application to persistent data.

## Features

- Attendance summary across all enrolled subjects
- Subject-level attendance percentages and Safe, Warning, or Critical classifications
- Safe-miss buffer and recovery-needed calculations
- Shortage prediction based on remaining classes in the term
- What-if simulations for future absences and attendance
- Weekly attendance trends and detailed attendance logs
- Prioritized risk alerts with recommended actions
- Leave and On-Duty request submission
- Proof submission workflow for pending requests
- Condonation eligibility checks with required document lists and fees
- Rule-based attendance assistant for risk, subject, simulation, and condonation questions
- Responsive dark dashboard interface
- Supabase schema and seed data for persistent database setup

## Technology Stack

- **Framework:** Next.js 14 App Router
- **Language:** TypeScript
- **Frontend:** React 18
- **Styling:** Tailwind CSS, PostCSS, and `tailwindcss-animate`
- **UI primitives:** Radix UI
- **Icons:** Lucide React
- **Charts:** Recharts
- **Animation:** Framer Motion
- **Backend:** Next.js Route Handlers
- **Database integration:** Supabase JavaScript client and PostgreSQL
- **Application logic:** TypeScript attendance engine
- **Path alias:** `@/*` maps to `src/*`

## Requirements

- Node.js 18.17 or newer
- npm 9 or newer
- A Supabase project only if persistent database storage is required

## Quick Start

1. Clone or open the repository.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

No environment variables are required for the default demo mode. When Supabase variables are absent, the data layer uses the in-memory sample data defined in `src/lib/db.ts`.

## Environment Variables

Create a `.env.local` file in the project root when connecting to Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

These values are read by `src/lib/db.ts`. The application currently keeps the demo data path available as a fallback when either value is missing.

Do not commit `.env.local` or expose service-role keys in client-side code. Only use the Supabase anon key in `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Supabase Setup

1. Create a Supabase project.

2. Open the Supabase SQL Editor.

3. Run [`supabase/schema.sql`](supabase/schema.sql) to create the tables and UUID extension.

4. Run [`supabase/seed.sql`](supabase/seed.sql) to insert the sample student, subjects, attendance statistics, and condonation policies.

5. Add the project URL and anon key to `.env.local`.

6. Restart the development server:

   ```bash
   npm run dev
   ```

The schema includes tables for:

- `students`
- `subjects`
- `student_subject_stats`
- `attendance_logs`
- `leave_od_requests`
- `academic_calendar`
- `condonation_rules`

The current repository includes the database client setup and schema, while the demo behavior remains available for local development without Supabase credentials.

## Application Views

The main dashboard is organized into these views:

- **Summary:** Overall attendance, subject cards, and key metrics
- **Prediction:** Subject shortage and recovery projections
- **What If:** Simulate future misses or attended classes
- **Trends:** Review weekly history and attendance patterns
- **Alerts:** Review prioritized risk and low-buffer warnings
- **Leave / OD:** Submit requests and upload proof status
- **Condonation:** Check eligibility, documents, and applicable fees
- **AI Assistant:** Ask natural-language questions about the current attendance data

## API Reference

All endpoints are implemented as Next.js Route Handlers under `src/app/api`.

### `GET /api/attendance`

Returns the current student profile, overall attendance, subject statistics, generated risk alerts, and attendance logs.

Example response shape:

```json
{
  "success": true,
  "student": {},
  "overallPercentage": 76.25,
  "totalHeld": 149,
  "totalAttended": 115,
  "subjects": [],
  "alerts": [],
  "logs": []
}
```

### `GET /api/leave-od`

Returns Leave and On-Duty requests.

### `POST /api/leave-od`

Submits a new request:

```json
{
  "requestType": "LEAVE",
  "reason": "Medical rest",
  "fromDate": "2026-09-10",
  "toDate": "2026-09-12",
  "affectedSubjects": ["CS602", "CS603"]
}
```

To mark proof as submitted, send:

```json
{
  "action": "UPLOAD_PROOF",
  "requestId": "req-101"
}
```

### `POST /api/prediction`

Runs a what-if simulation for one subject or all subjects.

```json
{
  "subjectId": "CS602",
  "futureMisses": 2,
  "futureAttends": 0
}
```

Use `"subjectId": "ALL"` to return results for every subject.

### `POST /api/chat`

Processes a rule-based assistant query using the current subjects, leave requests, and condonation rules.

```json
{
  "query": "Am I at risk anywhere?"
}
```

The assistant recognizes queries about overall risk, subjects, what-if simulations, leave/OD proof, and condonation.

## Attendance Logic

The attendance engine in `src/lib/attendance-engine.ts` derives the dashboard metrics from raw subject data.

- **Attendance percentage:** `attended / held * 100`
- **Safe:** percentage is at or above the subject minimum, normally 75%
- **Warning:** percentage is at least the condonation minimum, normally 65%, but below the subject minimum
- **Critical:** percentage is below the condonation minimum
- **Safe misses:** maximum additional absences while remaining at the minimum requirement
- **Recovery needed:** consecutive classes that must be attended to reach the minimum requirement
- **Recovery feasibility:** whether the needed recovery classes fit within the remaining term classes

The default demo data contains five subjects and uses a 75% minimum attendance requirement with a 65% condonation threshold.

## Project Structure

```text
.
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── attendance/route.ts
│   │   │   ├── chat/route.ts
│   │   │   ├── leave-od/route.ts
│   │   │   └── prediction/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── AIChatAssistant.tsx
│   │   ├── AttendanceSummary.tsx
│   │   ├── CondonationChecker.tsx
│   │   ├── LeaveODManager.tsx
│   │   ├── Navbar.tsx
│   │   ├── RiskAlertCenter.tsx
│   │   ├── ShortagePredictor.tsx
│   │   ├── TrendAnalysis.tsx
│   │   └── WhatIfSimulator.tsx
│   ├── lib
│   │   ├── ai-assistant.ts
│   │   ├── attendance-engine.ts
│   │   └── db.ts
│   └── types/index.ts
├── supabase
│   ├── schema.sql
│   └── seed.sql
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm start        # Start the production server
npm run lint     # Run the configured lint command
```

For a production-like local run:

```bash
npm run build
npm start
```

## Current Scope and Limitations

- The default experience is a single-student demo dashboard.
- Demo mode stores changes in process memory; restarting the server resets them.
- The assistant is deterministic, rule-based logic. It does not call an external generative AI provider.
- Authentication and role-based access control are not currently implemented.
- Proof upload currently updates request status in the application flow; it is not a file-storage upload pipeline.
- Production deployment should add authentication, server-side authorization, Supabase Row Level Security policies, input validation, and proper file storage.

## Development Notes

- Keep shared domain types in `src/types/index.ts`.
- Keep attendance calculations in `src/lib/attendance-engine.ts` rather than duplicating formulas in components.
- API routes should return a consistent `{ success, ... }` response shape.
- Use the `@/` path alias for imports from `src`.
- Do not commit secrets or local environment files.

## License

No license has been specified for this project yet.
