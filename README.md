# Review QR Pro

Monorepo for a **Google review helper**: venues get a QR code and poster; guests scan, rate, optionally use **AI-written review suggestions** (4–5★) or private feedback (1–3★). Owners and admins see analytics, feedback, and QR tools.

## Repository layout

```
apps/
  backend/    # Express + MongoDB API
  frontend/   # React (Vite) customer + owner + admin UI
```

Push from the **repository root** so both apps stay in one repo.

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **MongoDB** — local or [Atlas](https://www.mongodb.com/cloud/atlas)
- **LLM (optional)** — [Groq](https://console.groq.com) free API key (recommended) or OpenAI; if neither is set, **static fallback** suggestions are used

## Quick start

### 1. Backend (`apps/backend`)

```bash
cd apps/backend
cp .env.example .env
# Edit .env — all variables listed in .env.example are required for a clean boot, except LLM keys (optional).
npm install
npm run dev
```

The API listens on the **`PORT`** you set (e.g. `5000`).

### 2. Frontend (`apps/frontend`)

```bash
cd apps/frontend
cp .env.example .env
# Required: VITE_API_URL (e.g. http://localhost:5000/api) and VITE_PUBLIC_APP_URL (e.g. http://localhost:5173)
npm install
npm run dev
```

### 3. First access

- Sign in with **`SUPER_ADMIN_EMAIL`** / **`SUPER_ADMIN_PASSWORD`** from the backend `.env` (used only when the first superadmin is created).
- Superadmin bootstraps admins; admins manage owners and businesses; owners manage venues.
- **Public review link:** `<VITE_PUBLIC_APP_URL>/r/<qrSlug>`.

## AI providers (optional)

| Priority | Env vars | Notes |
|----------|-----------|--------|
| 1 | `GROQ_API_KEY`, optional `GROQ_MODEL` | **Free tier** at [Groq Console](https://console.groq.com). OpenAI-compatible HTTP API. Default model in code: `llama-3.3-70b-versatile` if `GROQ_MODEL` is empty. |
| 2 | `OPENAI_API_KEY`, optional `OPENAI_MODEL` | Used only if Groq key is **not** set. Paid OpenAI billing. |

If **no** LLM key is configured, the app still runs: review suggestions use **built-in fallback text** (and logs say so on startup).

### Suggestions: one LLM call per request

Review suggestions are **not** stored in MongoDB — each time a guest loads **4★ / 5★** suggestions, the API calls Groq/OpenAI again so **refresh = new pack** (when the LLM succeeds). That increases API usage vs caching; watch Groq/OpenAI quotas.

### Troubleshooting: “I see generic suggestions, not AI”

1. **Variable names** — Groq: **`GROQ_API_KEY`** (`gsk_…`). OpenAI: **`OPENAI_API_KEY`**. Restart the backend after editing `.env`.
2. **Parse errors** — In `NODE_ENV=development`, check the server console for **`[llm]`** lines (model errors, unparseable JSON snippets).

## Environment variables

Backend **requires** (no in-code defaults — the process exits if any are missing):

`PORT`, `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `COOKIE_EXPIRY`, `FRONTEND_URL`, `PUBLIC_APP_URL`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`

Frontend **requires**:

`VITE_API_URL`, `VITE_PUBLIC_APP_URL`

See each app’s **`.env.example`**. Never commit **`.env`** (see repo `.gitignore`).

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `apps/backend` | `npm run dev` | API with file watch |
| `apps/backend` | `npm start` | API without watch |
| `apps/backend` | `npm run lint` | ESLint |
| `apps/frontend` | `npm run dev` | Vite dev server |
| `apps/frontend` | `npm run build` | Production build → `dist/` |
| `apps/frontend` | `npm run preview` | Preview production build |
| `apps/frontend` | `npm run lint` | ESLint |

## Production notes

- Set **`FRONTEND_URL`** / **`PUBLIC_APP_URL`** to your real frontend origin (CORS + cookies).
- Optional **`ANALYTICS_TIMEZONE`** (IANA) for fixed-timezone daily scan charts.
- Align **`VITE_*`** with deployed URLs.

## Security before GitHub

- **`.env`** must not be committed.
- **`.env.example`** should contain **placeholders only**.

## License

Private / unlicensed unless you add a `LICENSE` file.
