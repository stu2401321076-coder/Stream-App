<div align="center">

# 🎬 StreamFlix

**A Netflix-style movie streaming platform**
Built as the course project for *Distributed Applications*

[![Node](https://img.shields.io/badge/Node-22%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Preact](https://img.shields.io/badge/Preact-10-673AB8?logo=preact&logoColor=white)](https://preactjs.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-6BA539?logo=openapiinitiative&logoColor=white)](backend/docs/openapi.yaml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 👤 Student

| | |
|---|---|
| **Name**            | _Your name here_ |
| **Faculty Number**  | `2401321076` |
| **Course**          | Distributed Applications — Software Engineering |

---

## 📖 About

StreamFlix is a full-stack streaming application where users can browse a movie catalog, watch videos with a custom HTML5 player, and leave reviews. Admins can upload new movies (poster + MP4) through the web UI.

The project is structured as a **REST API backend** and a **single-page application frontend**, communicating over JSON and JWT.

---

## ✨ Features

### Core
- 🔐 JWT authentication (24h tokens) + short-lived (1h) tokens for video streaming
- 👥 Role-based access control (`user` / `admin`)
- 🎞️ Full CRUD for movies, reviews, and users
- 🔍 Multi-criteria filtering on every list endpoint
- 📑 Server-side pagination + sorting everywhere
- 🛑 RFC 9457 Problem Details for all error responses
- ⚡ Async/await throughout — no blocking calls

### Player
- ▶️ Custom HTML5 video player with keyboard shortcuts (`Space`, `f`, `m`, `←`/`→`, `↑`/`↓`)
- 📡 HTTP byte-range streaming (`206 Partial Content`) — seek & resume work
- ⏩ Playback speed control (0.5×–2×)
- 🖼️ Auto-generated gradient posters when none uploaded

### Frontend
- 🎨 Netflix-inspired dark UI with custom design system
- 📱 Fully responsive — mobile drawer navigation
- 🪄 Skeleton loaders, toast notifications, confirm dialogs
- 🔎 Debounced global search in the navbar
- ♿ Accessible — keyboard nav, focus rings, ARIA labels
- ⚡ Route-level code splitting (initial JS ~20 KB gzipped)

---

## 🛠️ Tech stack

| Layer       | Stack                                                                |
|-------------|----------------------------------------------------------------------|
| **Backend** | Node.js · Express 4 · Mongoose · MongoDB Atlas · JWT · Zod · Multer |
| **Frontend**| Preact 10 · Wouter (router) · Tailwind CSS · Vite · Lucide icons    |
| **Docs**    | OpenAPI 3.1 (YAML) · Redoc HTML                                     |

---

## 📁 Project structure

```
Stream-App/
├── backend/                  # Express REST API
│   ├── docs/                 # API documentation
│   │   ├── openapi.yaml      # OpenAPI 3.1 spec (source of truth)
│   │   ├── API.md            # Human-readable API guide
│   │   └── api.html          # Rendered Redoc HTML
│   ├── middleware/           # auth, validation, error handler, uploads
│   ├── models/               # Mongoose schemas (User, Movie, Review)
│   ├── routes/               # Express routers
│   ├── uploads/              # Stored posters + videos (gitignored)
│   ├── seed.js               # Creates a default admin user
│   └── server.js             # Entrypoint
├── frontend/                 # Preact SPA
│   ├── src/
│   │   ├── components/       # UI primitives + movie + layout
│   │   ├── context/          # Auth + Toast providers
│   │   ├── hooks/            # useApi, useDebouncedValue, useScrolled
│   │   ├── lib/              # cn, format, posterArt
│   │   ├── pages/            # Route components
│   │   └── App.jsx           # Router + lazy routes
│   └── vite.config.js
└── README.md                 # ← you are here
```

---

## 🚀 Getting started

### Prerequisites
- **Node.js 22+** (`node --version`)
- A **MongoDB** connection string (Atlas or a local `mongod`)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Stream-App
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env       # then edit .env (see below)
node seed.js               # creates admin@streamflix.com / admin123
npm run dev                # starts on http://localhost:3000
```

**`backend/.env` template:**

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/streamflix
JWT_SECRET=replace_me_with_a_long_random_string
```

### 3. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

### 4. Open the app

→ <http://localhost:5173>

Sign in with the seeded admin (`admin@streamflix.com` / `admin123`) or register a new user.

---

## 📡 API documentation

The full API surface is documented in three forms:

| Format        | Path                                | Best for                              |
|---------------|-------------------------------------|---------------------------------------|
| OpenAPI 3.1   | [`backend/docs/openapi.yaml`](backend/docs/openapi.yaml) | machines, Swagger Editor, codegen |
| Markdown      | [`backend/docs/API.md`](backend/docs/API.md) | quick browsing in GitHub          |
| Rendered HTML | `backend/docs/api.html`             | offline reading                       |

Regenerate the HTML after editing the spec:

```bash
cd backend
npx @redocly/cli build-docs docs/openapi.yaml -o docs/api.html
```

---

## ✅ Course requirements coverage

| Requirement                                              | Implementation                                    |
|----------------------------------------------------------|---------------------------------------------------|
| Backend with web services                                | Express REST API (17 endpoints)                  |
| Frontend client                                          | Preact SPA                                       |
| Full CRUD on every model                                 | User, Movie, Review                              |
| ≥ 3 related tables                                       | User ↔ Review ↔ Movie                            |
| ≥ 6 columns per table, mixed data types                  | See `backend/models/`                            |
| Required fields + text length constraints                | Enforced in Mongoose + Zod + UI                  |
| Backend auth                                             | JWT bearer + short-lived stream JWT              |
| Frontend auth                                            | `RequireAuth` / `RequireRole` route guards       |
| Validation in DB + API + UI                              | Mongoose + Zod + native HTML validation          |
| Filtering by ≥ 2 criteria per list                       | All three list endpoints                         |
| Pagination + sorting                                     | All three list endpoints                         |
| RFC 7807 / 9457 Problem Details                          | `backend/middleware/errorHandler.js`             |
| Async I/O                                                | async/await throughout                           |
| **Bonus** — file uploads                                 | Posters + videos via Multer                      |
| **Bonus** — SPA                                          | Preact + Wouter + lazy routes                    |

---

## 📜 License

[MIT](LICENSE)
