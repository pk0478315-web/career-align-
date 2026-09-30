# Student Opportunity AI — Backend Service

Backend service for **Student Opportunity AI**, built with Node.js, Express, and Supabase PostgreSQL.

---

## 🛠 Tech Stack
- **Runtime:** Node.js (`v18+` / `v20+`)
- **Server Framework:** Express.js (`v4.21`)
- **Database:** Supabase PostgreSQL with local resilient fallback store
- **Security & Auth:** JWT tokens (`jsonwebtoken`), `bcryptjs`, CORS
- **AI Engine:** Google Gemini API integration with deterministic grounded heuristics
- **Ingestion & Data:** Cheerio (URL metadata extraction), CSV & JSON export/import

---

## 🚀 Quick Start

### 1. Setup Environment
Copy the example environment file:
```bash
cp .env.example server/.env
```
*(The server runs automatically in zero-config mode even without external keys!)*

### 2. Install Dependencies
```bash
cd server
npm install
```
*(On Windows PowerShell, use `npm.cmd install` if execution policies apply).*

### 3. Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5000`.

### 4. Run Automated Test Suite
```bash
npm run test:api
```
Executes 37 end-to-end API tests across all endpoints with zero dependencies.

---

## 📋 Available Endpoints Summary

| Domain | Method | Route | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Service status, database & AI mode check |
| **Auth** | `POST` | `/api/auth/register` | Register new student account |
| **Auth** | `POST` | `/api/auth/login` | Login and obtain JWT token |
| **Auth** | `GET` | `/api/auth/me` | Current user session & profile |
| **Profile** | `GET` | `/api/profile` | Get student profile & skills |
| **Profile** | `PUT` | `/api/profile` | Update profile, education & goals |
| **Discovery** | `GET` | `/api/opportunities` | Search & filter opportunities with match reasons |
| **Discovery** | `GET` | `/api/opportunities/:id` | Detailed opportunity view |
| **Discovery** | `POST` | `/api/opportunities` | Manual opportunity creation |
| **Discovery** | `POST` | `/api/opportunities/capture-url` | Webpage metadata draft extraction |
| **Tracker** | `GET` | `/api/my-opportunities` | Tracked pipeline items and status counts |
| **Tracker** | `POST` | `/api/my-opportunities` | Save/track opportunity |
| **Tracker** | `PATCH` | `/api/my-opportunities/:id` | Update status, checklist, or notes |
| **Tracker** | `DELETE` | `/api/my-opportunities/:id` | Untrack opportunity |
| **AI Copilot**| `POST` | `/api/ai/summarize` | Plain language grounded summary |
| **AI Copilot**| `POST` | `/api/ai/eligibility-check`| Profile eligibility gap analysis |
| **AI Copilot**| `POST` | `/api/ai/checklist` | Document & application checklist |
| **AI Copilot**| `POST` | `/api/ai/chat` | Contextual Q&A |
| **Portability**| `GET` | `/api/export?format=csv` | Export tracked opportunities to CSV/JSON |
| **Portability**| `POST` | `/api/import/preview` | Preview & validate batch records |
| **Portability**| `POST` | `/api/import/confirm` | Confirm and commit import |

---

## 🗄 Database Setup (Supabase)
To run on a live Supabase project:
1. Paste the SQL script from [DATABASE_SCHEMA.md](file:///d:/programming/hack/DATABASE_SCHEMA.md) into the Supabase SQL Editor and execute.
2. In `server/.env`, set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`).
3. Restart the server. It will automatically route queries to Supabase.
