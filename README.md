# ⚖️ LexBot – AI Legal Information System

AI-powered legal information assistant for Indian citizens. Answers common
legal questions (FIR filing, cyber fraud, consumer rights, RTI, labour
rights, bail) from a local knowledge base, and falls back to Gemini →
Claude for everything else.

## 📁 Project Structure

```
lexbot/
│
├── .github/workflows/ci.yml            ← CI: lint, test
│
├── 🌐 frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js                       ← Chat engine, session/token handling
│
└── ⚙️  backend/
    │
    ├── server.js                       ← Express app entry point
    ├── package.json
    ├── jest.config.js
    ├── .eslintrc.json / .prettierrc.json
    │
    ├── 📂 config/
    │   ├── env.js                      ← Boot-time env validation (Zod)
    │   ├── db.js                       ← MongoDB connection
    │   └── constants.js                ← AI provider config, system prompt
    │
    ├── 📂 routes/v1/                   ← Versioned API (/api/v1/...)
    │   ├── session.js                  ← POST /session — issue JWT
    │   ├── chat.js                     ← POST /chat
    │   └── history.js                  ← GET/DELETE /history/:sessionId
    │
    ├── 📂 controllers/                 ← Thin HTTP layer only
    ├── 📂 services/                    ← Business logic (unit-tested)
    │   ├── chatService.js              ← Local DB → cache → Gemini → Claude → fallback
    │   ├── historyService.js
    │   ├── legalKnowledgeBase.js
    │   └── providers/                  ← Gemini / Claude API clients (retry-enabled)
    │
    ├── 📂 middleware/
    │   ├── auth.js                     ← JWT session-ownership check
    │   ├── validate.js                 ← Zod request validation
    │   ├── rateLimiter.js
    │   ├── errorHandler.js
    │   └── requestLogger.js
    │
    ├── 📂 models/                      ← Chat, Session, AuditLog
    ├── 📂 utils/                       ← logger, cache, circuitBreaker, jwt, metrics
    ├── 📂 validators/                  ← Zod schemas
    ├── 📂 docs/openapi.js              ← Swagger spec (served at /api-docs)
    └── 📂 tests/                       ← Jest unit + route tests
```

## 🚀 Tech Stack

| Layer          | Technology                                  |
|----------------|----------------------------------------------|
| Frontend       | HTML5, CSS3, JavaScript, AOS, GSAP           |
| Backend        | Node.js + Express.js                         |
| Database       | MongoDB + Mongoose                           |
| Cache          | Redis (falls back to in-memory LRU if unset) |
| AI             | Gemini (primary) → Claude (fallback)         |
| Auth           | JWT (session-bound)                          |
| Validation     | Zod                                          |
| Logging        | Winston (structured JSON in prod)            |
| Resilience     | opossum (circuit breaker) + axios-retry      |
| Testing        | Jest + Supertest                             |
| Docs           | OpenAPI 3.0 / Swagger UI                     |
| Monitoring     | Prometheus-compatible `/metrics`             |
| CI/CD          | GitHub Actions (lint, test)                   |

## ⚡ API Endpoints (v1)

| Method | Endpoint                        | Auth        | Description                       |
|--------|----------------------------------|-------------|------------------------------------|
| POST   | /api/v1/auth/register            | –           | Create a user account             |
| POST   | /api/v1/auth/login               | –           | Log in, get a user token          |
| GET    | /api/v1/auth/me                  | User JWT    | Get logged-in user's profile      |
| POST   | /api/v1/session                  | –           | Issue a sessionId + session JWT (links to account if a User JWT is sent) |
| POST   | /api/v1/chat                     | Session JWT | Send message, get reply           |
| GET    | /api/v1/history/:sessionId       | Session JWT | Get chat history                  |
| GET    | /api/v1/history/:sessionId/summary | Session JWT | Get session metadata only       |
| DELETE | /api/v1/history/:sessionId       | Session JWT | Delete chat history               |
| GET    | /api/v1/history/me/sessions      | User JWT    | List all sessions for the logged-in account |
| GET    | /api/health                      | –           | Server health check               |
| GET    | /api-docs                        | –           | Swagger UI                        |
| GET    | /metrics                         | –           | Prometheus metrics                |

**Two separate token types** (see `utils/jwt.js`) — each carries a `type`
claim so one can never be replayed as the other:
- **User JWT**: issued at login/register, proves who you are, used for
  `/auth/me` and `/history/me/sessions`.
- **Session JWT**: issued by `/session`, proves ownership of one chat
  session, used for `/chat` and `/history/:sessionId`. Logging in is
  optional — anonymous guests still get a normal session; if a User JWT is
  sent when minting a session, that session is linked to the account so
  history persists across devices instead of just one browser's localStorage.


## 📦 Setup — plain Node

```bash
cd backend
npm install
cp .env.example .env   # fill in your keys (see below)
npm run dev             # nodemon
```

## 🧪 Testing & Linting

```bash
cd backend
npm test             # Jest — 34 unit/route tests, no real DB required
npm run test:coverage
npm run lint
```

## 🔐 backend/.env Variables

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster/lexbot
MONGODB_REQUIRED=false
GEMINI_API_KEY=xxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379   # optional
LOG_LEVEL=info
```

## 🏗️ Architecture notes

- **Fallback chain**: local knowledge base → cached answer → Gemini → Claude
  → generic static reply. Each AI provider call is wrapped in a circuit
  breaker (opossum) so repeated failures fail fast instead of making every
  user wait a full timeout.
- **Prompt injection**: system prompt and user message are always sent as
  separate API fields (`systemInstruction`/`system`), never string-concatenated.
- **Session security**: history endpoints require a JWT bound to that exact
  `sessionId` — a leaked/guessed sessionId alone is no longer enough to read
  or delete someone else's chat history.
- **Observability**: structured JSON logs in production, `/metrics` for
  Prometheus/Grafana, `/api-docs` for interactive API exploration.
- **English-only, on purpose**: an earlier EN/HI toggle was removed. Legal
  terminology loses precision in machine-translated UI text, so the product
  focuses on getting English explanations exactly right rather than shipping
  a partial second language. Session/`language` fields are kept in the
  schema (fixed to `'en'`) so a real, properly-reviewed translation can be
  added later without a data migration.
- **"Download My Legal Notes"**: the frontend pulls the user's full chat
  record from `GET /api/v1/history/:sessionId` (not just what's currently
  rendered on screen) and renders it client-side into a PDF via jsPDF — so
  the export is accurate even after a page reload, and gives users a real,
  keepable record of the legal guidance they received.
- **Login is a two-panel split screen**: a brand/illustration panel on the
  left, the login/signup form on the right (collapses to form-only below
  760px). Logging in is optional — guests can chat immediately — but an
  account lets a session follow the user across devices instead of staying
  in one browser's localStorage.
