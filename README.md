# DataPulse — AI-Powered Analytics Dashboard

A full-stack analytics platform to upload CSV/Excel datasets, visualize key metrics through interactive charts, and interact with AI-powered insights — with real-time updates and authenticated user accounts.

## Live Demo
- **Frontend:** [https://analytics-dashboard-mu-black.vercel.app]
- **Backend:** [https://analytics-dashboard-yqkw.onrender.com]

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                FRONTEND (Next.js / Vercel)           │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │AuthPage  │  │UploadZone│  │Dashboard │          │
│  │Login /   │  │Drag&drop │  │KPIs ·    │          │
│  │Register  │  │+ progress│  │Charts ·  │          │
│  └──────────┘  └──────────┘  │AI · Chat │          │
│                               └──────────┘          │
│  ┌─────────────────────────────────────────────┐    │
│  │  lib/api.ts — all fetch calls               │    │
│  │  Authorization: Bearer <JWT> on every req   │    │
│  └─────────────────────────────────────────────┘    │
│  ┌──────────────────┐  ┌────────────────────────┐   │
│  │  AuthContext.tsx  │  │  useWebSocket hook     │   │
│  │  localStorage JWT │  │  Exponential backoff   │   │
│  └──────────────────┘  └────────────────────────┘   │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS REST + WSS
┌───────────────────────▼─────────────────────────────┐
│               BACKEND (Node.js + Express / Render)   │
│                                                     │
│  ┌──────────────┐  ← public                        │
│  │ /api/auth    │  register · login · /me           │
│  └──────────────┘                                   │
│          │ protect middleware (JWT verify)           │
│  ┌───────▼──┐  ┌───────────┐  ┌──────────────────┐  │
│  │/api/     │  │/api/      │  │ /api/ai           │  │
│  │upload    │  │analytics  │  │ insights · chat   │  │
│  │multer +  │  │KPIs ·     │  │ Gemini 2.0 Flash  │  │
│  │fileParser│  │charts ·   │  │ + DB cache        │  │
│  └──────────┘  │scatter ·  │  └──────────────────┘  │
│                │correlation│                        │
│                └───────────┘                        │
│  ┌─────────────────────────────────────────────┐    │
│  │  WebSocket server — broadcast upload status │    │
│  │  Token auth via ?token= query param         │    │
│  └─────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│              PostgreSQL (Render managed DB)          │
│                                                     │
│  users          — id, name, email, bcrypt hash      │
│  datasets       — metadata, columns, summary        │
│  dataset_rows   — JSONB array of parsed rows        │
│  ai_insights    — cached Gemini responses           │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Frontend    | Next.js 14 (App Router), TypeScript            |
| Styling     | Tailwind CSS + CSS custom properties           |
| Charts      | Recharts                                       |
| Backend     | Node.js + Express 5                            |
| Database    | PostgreSQL via `pg` (Render managed)           |
| Real-time   | WebSocket (`ws` library) with broadcast        |
| File parse  | multer, csv-parser, xlsx                       |
| Auth        | JWT (`jsonwebtoken`) + bcrypt                  |
| AI          | Google Gemini 2.0 Flash (`@google/genai`)      |
| Upload UI   | react-dropzone                                 |
| Deployment  | Vercel (frontend) + Render (backend + DB)      |

---

## Features

### Core
- **CSV / XLSX Upload** — Drag-and-drop with real-time progress bar via WebSocket
- **Auto Column Detection** — Infers numeric, categorical, and date types per column
- **Dashboard KPIs** — Min, max, mean, median for every numeric column
- **Charts** — Histogram, horizontal bar, scatter plot, pie chart (Recharts)
- **Correlation Matrix** — Pearson correlation heatmap for numeric columns

### AI (Gemini 2.0 Flash)
- **AI Insights** — One-click executive summary, key insights (trend / anomaly / pattern / recommendation), KPI recommendations, data quality notes, ML opportunities
- **AI Chat** — Conversational Q&A about your dataset with full conversation history
- **Insight caching** — Gemini responses stored in PostgreSQL; regeneration is instant on revisit

### Auth
- **Register / Login** — Email + password, bcrypt hashed, JWT issued on success
- **Protected routes** — All upload, analytics, and AI endpoints require a valid Bearer token
- **Persistent sessions** — Token stored in `localStorage`; `AuthContext` validates on page load
- **Per-user data isolation** — Every DB query filters by `user_id`; users can never see each other's datasets

### Real-time
- **WebSocket upload progress** — Server broadcasts `parsing → processing → complete` events
- **Exponential backoff reconnect** — 2s → 4s → 8s → 16s → max 30s; no console spam
- **Activity feed** — Live sidebar showing upload events with timestamps

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or Render free tier)
- Google Gemini API key — [aistudio.google.com](https://aistudio.google.com/apikey) (free)

### Backend Setup
```bash
cd backend
npm install
# Edit .env with your values (see below)
npm run dev          # http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
# Edit .env.local with your values (see below)
npm run dev          # http://localhost:3000
```

### Environment Variables

**`backend/.env`**
```env
PORT=5000
NODE_ENV=development

# PostgreSQL — local or Render Internal URL
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT — use a long random string in production
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d

# Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# CORS — your Vercel frontend URL in production
FRONTEND_URL=http://localhost:3000
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws
```

---

## Deployment

### 1 — PostgreSQL on Render
1. Render dashboard → **New → PostgreSQL** → create (free tier)
2. Copy the **Internal Database URL** from the database page

### 2 — Backend on Render
1. Render dashboard → **New → Web Service** → connect GitHub repo
2. Set **Root Directory** to `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables:
   - `DATABASE_URL` = Internal Database URL from step 1
   - `JWT_SECRET` = any long random string
   - `GEMINI_API_KEY` = your key
   - `FRONTEND_URL` = your Vercel URL (add after step 3)
   - `NODE_ENV` = `production`
6. Deploy — migrations run automatically on first boot

### 3 — Frontend on Vercel
1. Push repo to GitHub
2. [vercel.com](https://vercel.com) → Import → select repo
3. Set **Root Directory** to `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://your-app.onrender.com`
   - `NEXT_PUBLIC_WS_URL` = `wss://your-app.onrender.com/ws`
5. Deploy

---

## API Reference

### Auth (public)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account → returns JWT |
| POST | `/api/auth/login` | Login → returns JWT |
| POST | `/api/auth/logout` | Client discards token |
| GET | `/api/auth/me` | Verify token → returns user |

### Upload (protected)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/upload` | Upload CSV/XLSX, parse, store |
| GET | `/api/upload` | List current user's datasets |
| GET | `/api/upload/:id` | Get full dataset with rows |
| DELETE | `/api/upload/:id` | Delete dataset + rows + cache |

### Analytics (protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/analytics/:id/kpis` | Min/max/mean/median per column |
| GET | `/api/analytics/:id/chart/:col` | Histogram or frequency bar chart |
| GET | `/api/analytics/:id/scatter` | Scatter plot data (up to 500 pts) |
| GET | `/api/analytics/:id/correlation` | Pearson matrix (up to 8 cols) |

### AI (protected)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/insights/:id` | Gemini insights (cached in DB) |
| POST | `/api/ai/chat/:id` | Multi-turn dataset Q&A |

### WebSocket
| Connection | `wss://your-backend/ws?token=<jwt>` |
|---|---|
| Event | `upload_status` — `{ status, progress, fileName, fileId }` |

---

## Database Schema

```sql
-- Persistent user accounts
CREATE TABLE users (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,          -- bcrypt hash
  role       TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dataset metadata per user
CREATE TABLE datasets (
  file_id      TEXT PRIMARY KEY,
  user_id      TEXT REFERENCES users(id) ON DELETE CASCADE,
  file_name    TEXT NOT NULL,
  row_count    INT,
  column_count INT,
  summary      JSONB,               -- completeness, type counts
  columns_meta JSONB,               -- per-column stats
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Actual parsed rows
CREATE TABLE dataset_rows (
  file_id TEXT PRIMARY KEY REFERENCES datasets(file_id) ON DELETE CASCADE,
  rows    JSONB NOT NULL DEFAULT '[]'
);

-- Cached Gemini responses
CREATE TABLE ai_insights (
  file_id      TEXT PRIMARY KEY REFERENCES datasets(file_id) ON DELETE CASCADE,
  insights     JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Folder Structure

```
analytics-dashboard/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT protect middleware
│   ├── routes/
│   │   ├── auth.js          # Register, login, /me
│   │   ├── upload.js        # File upload → DB
│   │   ├── analytics.js     # KPIs, charts, correlation
│   │   └── ai.js            # Gemini insights + chat + cache
│   ├── utils/
│   │   ├── db.js            # pg connection pool
│   │   ├── migrate.js       # CREATE TABLE IF NOT EXISTS
│   │   ├── fileParser.js    # CSV/XLSX → typed columns + stats
│   │   └── userStore.js     # DB queries for users
│   ├── uploads/             # Temp storage (deleted after parse)
│   ├── server.js            # Express + WebSocket + CORS
│   ├── railway.toml         # Railway deploy config
│   └── .env
└── frontend/
    ├── app/
    │   ├── layout.tsx        # AuthProvider wrapper
    │   ├── page.tsx          # Auth gate → main app
    │   └── globals.css       # Dark theme CSS variables
    ├── components/
    │   ├── AuthPage.tsx      # Login / register form
    │   ├── Sidebar.tsx       # Nav + user info + logout
    │   ├── Dashboard.tsx     # Tabbed: overview/charts/AI/chat
    │   ├── UploadZone.tsx    # Drag-drop + WS progress
    │   ├── KPICards.tsx      # Summary stat cards
    │   ├── ChartGrid.tsx     # All chart types
    │   ├── CorrelationMatrix.tsx
    │   ├── AIInsights.tsx    # Gemini insight cards
    │   ├── AIChat.tsx        # Conversational chat UI
    │   └── ActivityFeed.tsx  # Real-time event sidebar
    ├── hooks/
    │   └── useWebSocket.ts   # WS conn + exponential backoff
    ├── lib/
    │   ├── api.ts            # All fetch calls + token attach
    │   └── AuthContext.tsx   # User state + localStorage
    └── .env.local
```

---

## Scalability Roadmap

| What breaks first | Fix |
|---|---|
| JSONB rows in PostgreSQL slow at 1M+ rows | Migrate to columnar store (ClickHouse) or generate per-dataset tables |
| Single WS server doesn't share state across instances | Redis pub/sub — publish broadcasts to channel, all instances forward |
| No rate limiting on AI endpoints | `express-rate-limit` + per-user Gemini quota in Redis |
| File briefly on Render disk during parse | Stream directly to S3 with `multer-s3`; never touch local disk |
| Blocking analytics computation on large datasets | BullMQ job queue — upload returns jobId, worker computes async, WS notifies on complete |
| No refresh token — JWT expires after 7d | Add refresh token rotation with a `sessions` table |
