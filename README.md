# DataPulse — AI-Powered Analytics Dashboard

A full-stack analytics platform that lets you upload CSV/Excel datasets, visualize key metrics, and interact with AI-powered insights.

## Live Demo
- Frontend: [Deployed on Vercel]
- Backend: [Deployed on Railway]

---

## Architecture

```
┌──────────────────────────────────────────────┐
│                  FRONTEND (Next.js)           │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Upload   │  │Dashboard │  │  AI Chat   │  │
│  │ Zone     │  │+ Charts  │  │+ Insights  │  │
│  └──────────┘  └──────────┘  └────────────┘  │
│         │             │             │         │
│         └─────────────┴─────────────┘         │
│                       │                       │
│              HTTP REST + WebSocket            │
└───────────────────────┼───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│               BACKEND (Node/Express)           │
│  ┌────────┐  ┌──────────┐  ┌──────────────┐   │
│  │/upload │  │/analytics│  │  /ai routes  │   │
│  │multer  │  │ KPIs,    │  │  OpenAI SDK  │   │
│  │csv/xlsx│  │ charts,  │  │  insights,   │   │
│  │parser  │  │ scatter  │  │  chat        │   │
│  └────────┘  └──────────┘  └──────────────┘   │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │       WebSocket Server (ws library)     │  │
│  │   Real-time upload progress & status    │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  In-memory datastore (Map) — swap for         │
│  PostgreSQL/MongoDB in production             │
└───────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer      | Technology                                 |
|------------|-------------------------------------------|
| Frontend   | Next.js 14 (App Router), TypeScript        |
| Styling    | Tailwind CSS + CSS Variables               |
| Charts     | Recharts                                   |
| Backend    | Node.js + Express                          |
| Real-time  | WebSocket (ws library)                     |
| File parse | multer, csv-parser, xlsx                   |
| AI         | OpenAI GPT-4o Mini (insights + chat)       |
| Upload     | react-dropzone                             |

---

## Features

- **CSV/XLSX Upload** — Drag-and-drop file upload with real-time progress via WebSocket
- **Auto Column Detection** — Numeric, categorical, date column type inference
- **Dashboard KPIs** — Min, max, mean, median for all numeric columns
- **Charts** — Histogram, bar, scatter, pie charts via Recharts
- **Correlation Matrix** — Pearson correlation heatmap for numeric columns
- **AI Insights** — GPT-4o Mini generates executive summary, key insights, KPI recommendations
- **AI Chat** — Ask natural language questions about your dataset
- **Real-Time Feed** — WebSocket-powered activity sidebar for live upload status

---

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API key

### Backend Setup
```bash
cd backend
npm install
cp .env .env.local   # Edit with your keys
npm run dev          # Starts on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
# Edit .env.local if backend runs on different port
npm run dev          # Starts on port 3000
```

### Environment Variables

**backend/.env**
```
PORT=5000
OPENAI_API_KEY=sk-...
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws
```

---

## Deployment

### Backend → Railway
1. Create account at railway.app
2. New project → Deploy from GitHub repo → select `backend/` folder
3. Add environment variables in Railway dashboard
4. Railway auto-assigns a public URL

### Frontend → Vercel
1. Push to GitHub
2. Import project on vercel.com
3. Set root directory to `frontend/`
4. Add env vars:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL
   - `NEXT_PUBLIC_WS_URL` = `wss://your-railway-url/ws`
5. Deploy

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/upload | Upload CSV/XLSX file |
| GET | /api/upload | List all datasets |
| GET | /api/upload/:id | Get dataset by ID |
| DELETE | /api/upload/:id | Delete dataset |
| GET | /api/analytics/:id/kpis | KPI summary |
| GET | /api/analytics/:id/chart/:col | Column chart data |
| GET | /api/analytics/:id/scatter | Scatter plot data |
| GET | /api/analytics/:id/correlation | Correlation matrix |
| POST | /api/ai/insights/:id | Generate AI insights |
| POST | /api/ai/chat/:id | Chat with dataset |
| WS | /ws | Real-time upload status |

---

## Scalability Considerations

- **Storage**: Replace `Map` datastore with PostgreSQL (pg) or MongoDB for persistence
- **File storage**: Replace local `uploads/` with AWS S3 or Cloudflare R2
- **Rate limiting**: Add `express-rate-limit` on AI endpoints to control OpenAI costs
- **Queue**: Use Bull/BullMQ for large file processing jobs
- **Caching**: Redis for frequently-queried analytics results
- **Auth**: JWT + bcrypt for user accounts and role-based access

---

## Folder Structure

```
analytics-dashboard/
├── backend/
│   ├── routes/
│   │   ├── upload.js       # File upload + datastore
│   │   ├── analytics.js    # KPIs, charts, correlation
│   │   └── ai.js           # OpenAI insights + chat
│   ├── utils/
│   │   └── fileParser.js   # CSV/XLSX parsing + stats
│   ├── uploads/            # Temp upload storage
│   ├── server.js           # Express + WS server
│   └── .env
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    ├── components/
    │   ├── Dashboard.tsx
    │   ├── UploadZone.tsx
    │   ├── KPICards.tsx
    │   ├── ChartGrid.tsx
    │   ├── AIInsights.tsx
    │   ├── AIChat.tsx
    │   ├── CorrelationMatrix.tsx
    │   ├── Sidebar.tsx
    │   └── ActivityFeed.tsx
    ├── hooks/
    │   └── useWebSocket.ts
    ├── lib/
    │   └── api.ts
    └── .env.local
```
