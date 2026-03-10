# ScamDetect — Multilingual Scam & Phishing Detector

> AI-powered cybersecurity tool to detect phishing, scams, and malicious URLs across 6 languages.

## Tech Stack

| Layer        | Technology                                                          |
| ------------ | ------------------------------------------------------------------- |
| Frontend     | Next.js 14 (App Router), TypeScript, Tailwind CSS v4, Framer Motion |
| Backend      | Node.js, Express.js, TypeScript                                     |
| Database     | Supabase (PostgreSQL)                                               |
| AI           | Ollama (Llama3 local LLM)                                           |
| OCR          | Tesseract.js                                                        |
| Threat Intel | VirusTotal API, PhishTank                                           |
| Translation  | Lingo.dev                                                           |
| Hosting      | Vercel (frontend) + Render (backend) + Supabase                     |

---

## Project Structure

```
ScamDetect/
├── frontend/          # Next.js 14 App Router
│   └── src/
│       ├── app/       # Pages (App Router)
│       ├── components/
│       ├── lib/       # API client, utilities
│       └── types/     # TypeScript types
├── backend/           # Express.js API
│   └── src/
│       ├── controllers/
│       ├── detection/ # Detection modules
│       ├── middleware/
│       ├── routes/
│       ├── services/  # VirusTotal, Ollama, OCR, etc.
│       └── utils/
└── shared/            # Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Ollama installed locally (`ollama pull llama3`)
- Supabase project
- VirusTotal API key (free tier)
- Lingo.dev API key (for translation)

### 1. Setup Backend

```bash
cd backend
cp .env.example .env
# Fill in your API keys in .env
npm install
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your keys
npm install
npm run dev
```

### 3. Setup Database

Run the SQL in `backend/supabase-schema.sql` in your Supabase SQL Editor.

---

## Detection Pipeline

```
User Input (message / URL / screenshot)
    ↓
[OCR] Extract text from image (Tesseract.js)
    ↓
[Keywords] Phishing keyword scan
    ↓
[URLs] Regex URL extraction
    ↓
[Domains] Levenshtein similarity check against trusted brands
    ↓
[VirusTotal] API check for malicious URLs
    ↓
[PhishTank] Dataset lookup
    ↓
[Ollama] Llama3 classification (SAFE/SUSPICIOUS/PHISHING)
    ↓
[Scoring] 0-100 risk score →  SAFE / SUSPICIOUS / HIGH RISK
    ↓
[Translation] Lingo.dev multilingual result
    ↓
[Supabase] Store result
    ↓
Return JSON to frontend
```

## Risk Scoring

| Signal               | Score            |
| -------------------- | ---------------- |
| Keyword match        | +20 each (max 2) |
| Suspicious domain    | +25 each (max 2) |
| VirusTotal malicious | +40              |
| PhishTank match      | +50              |
| AI: PHISHING         | +30              |
| AI: SUSPICIOUS       | +10              |

**0–30 = SAFE · 31–60 = SUSPICIOUS · 61–100 = HIGH RISK**

---

## API Endpoints

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| `POST` | `/api/analyze-message` | Analyze text message     |
| `POST` | `/api/check-url`       | Check URL safety         |
| `POST` | `/api/scan-screenshot` | OCR + analyze image      |
| `POST` | `/api/report-scam`     | Submit community report  |
| `GET`  | `/api/scam-database`   | List recent scam reports |
| `GET`  | `/health`              | Server health check      |

---

## Deployment

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import in Vercel
3. Set environment variables from `.env.local.example`

### Backend → Render

1. Push `backend/` to GitHub
2. Create a new Web Service on Render
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Set environment variables from `.env.example`

---

## Languages Supported

English · Yoruba · Hausa · Igbo · French · Spanish
