# Nexus-Vibe

**AI-Powered Vibe Coding & Developer Community**

Nexus-Vibe is a full-stack AI developer community platform — a modern replacement for the traditional campus forum. Built with Spring Boot 3.3 + React, featuring AI Agent code review, LLM-based content safety checks, and an IDE-station dark UI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Spring Boot 3.3.5, Java 18 |
| **ORM** | MyBatis-Plus 3.5.9 |
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS |
| **State** | TanStack Query + Zustand |
| **Animation** | Motion (Framer Motion successor) |
| **Font** | Inter + JetBrains Mono |
| **Database** | H2 (dev) / MySQL 8 (prod) |
| **Cache** | Redis (Lettuce) |
| **Search** | Elasticsearch 8.13.4 |
| **Auth** | JWT (jjwt 0.12.6) |
| **Security** | XSS Filter + DFA Sensitive Word Filter + LLM semantic check |
| **Build** | Maven 3.9+ (backend) + Vite (frontend) |

## Architecture

### Backend (Spring Boot)

```
Controller (REST API) → Service → Mapper (MyBatis-Plus) → DB
                              ↓
                        Redis Cache
                              ↓
                     Elasticsearch (full-text)
                              ↓
              AI Agent (async) — Code Review + Safety Check
```

- **REST API**: `/api/v1/*` endpoints for all CRUD + auth
- **AI Agent Pipeline**: `AiReviewEvent` → `LlmClient` (OpenAI-compatible) → auto-comment
- **LLM Safety Check**: DFA pass-through → async LLM classification (4 categories)
- **Caching**: Redis-backed like toggle, gravity-decay hot ranking, sliding window rate limiting

### Frontend (React SPA)

```
frontend/
├── src/
│   ├── components/        # UI components (Navbar, Sidebar, PostCard, Avatar...)
│   │   ├── ui/            # Animated components (SpotlightCard, BorderBeam, ShimmerButton...)
│   │   └── layout/        # MainLayout, AdminLayout
│   ├── pages/             # 12+ page components
│   ├── api/               # Axios client + TanStack Query hooks
│   ├── stores/            # Zustand stores (auth, theme)
│   └── types/             # TypeScript interfaces
```

**Design**: 2-column IDE workstation layout — sidebar console + main workspace. Dark cyberpunk theme (`vibe-*` color palette), macOS terminal card patterns, motion animations throughout.

## Features

### Core
- [x] User registration & login (JWT auth)
- [x] Post CRUD with Markdown editor + live preview
- [x] Channel-based browsing with slug routing
- [x] Full-text search (ES + MySQL fallback)
- [x] Comments with thread-style layout
- [x] Like/unlike with Redis atomic toggle
- [x] Prompt template Fork with source attribution
- [x] Prompt template version history, change notes, and rollback

### AI
- [x] **AI Code Review Agent**: Asynchronous LLM-powered post review with structured output (score, quality, security, suggestions)
- [x] **Structured Outputs**: JSON Schema-enforced review format via OpenAI API
- [x] **Prompt Injection Guardrails**: Delimiter-based isolation, Chain of Thought analysis
- [x] **LLM Safety Check**: 4-class classification (Prompt injection / Harmful / Spam / Safe) with per-class handling
- [x] **Agent run logs dashboard**: severity stats, filters, and review history
- [x] **Prompt Playground**: variable substitution + token estimate

### Design
- [x] Dark cyberpunk theme with `vibe` color palette
- [x] 2-column IDE layout (sidebar + workspace)
- [x] macOS terminal card patterns
- [x] Motion animations (page transitions, stagger lists, hover effects)
- [x] Animated components: SpotlightCard, BorderBeam, DecryptedText, ShimmerButton
- [x] Dark mode toggle with localStorage persistence
- [x] Circular initial avatars with hash colors

### Infrastructure
- [x] DFA sensitive word filtering (two-tier: sensitive + critical)
- [x] Sliding window rate limiting (Redis + Lua)
- [x] Gravity-decay hot ranking (hourly recalculation)
- [x] Write-behind like counter sync (every 5 min)
- [x] Admin audit dashboard

## Quick Start

### Prerequisites

- JDK 18+
- Maven 3.9+
- Node.js 18+
- Redis (optional, can be disabled)

### Run in Development Mode

```bash
# Clone
git clone https://github.com/shing26/nexus-campus.git
cd nexus-campus

# Backend (H2 in-memory DB, auto-creates schema + seed data)
mvn clean package -DskipTests
mvn spring-boot:run
# → http://localhost:8081

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
# → http://localhost:5173 (auto-proxies /api to :8081)
```

### Default Accounts

| Username | Password | Role |
|----------|----------|------|
| `admin` | `123456` | ADMIN |
| `shing` | `123456` | USER |

### Run with MySQL (Production)

```bash
# local MySQL + Redis, env-driven config
$env:SPRING_PROFILES_ACTIVE="prod"
$env:DB_URL="jdbc:mysql://localhost:3306/nexus_campus?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="root"
$env:REDIS_HOST="localhost"
mvn spring-boot:run
```

> The MySQL schema and demo data live in `docker/mysql/init.sql`. The legacy
> `mysql` profile is still available for local MySQL without env overrides.

### Run with Docker Compose (recommended for handoff)

```bash
cp .env.example .env
# fill in DB_PASSWORD / JWT_SECRET / LLM_API_KEY
docker compose up --build
```

Then open `http://localhost:8080`. The stack starts:

| Service | Container | Port |
|---------|-----------|------|
| Nginx + React SPA | `nexus-web` | 8080 |
| Spring Boot API | `nexus-app` | internal 8080 |
| MySQL 8 | `nexus-db` | 3306 |
| Redis 7 | `nexus-redis` | 6379 |
| Elasticsearch (optional) | `nexus-es` | 9200 |

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Spring profile |
| `SERVER_PORT` | `8080` | API port |
| `DB_URL` | local MySQL | JDBC URL |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `root` | MySQL credentials |
| `REDIS_ENABLED` | `true` | Redis features |
| `REDIS_HOST` / `REDIS_PORT` | `redis` / `6379` | Redis connection |
| `LLM_API_KEY` | empty | OpenAI-compatible API key (required for hosted APIs, optional for local Ollama) |
| `LLM_ENDPOINT` | `http://localhost:11434/v1` | Chat completions base URL (local Ollama by default) |
| `LLM_MODEL` | `qwen2.5:7b` | Default model |
| `JWT_SECRET` | dev default | JWT signing secret (change in prod) |
| `UPLOAD_DIR` | `/app/uploads` | Upload storage path |

### Local LLM (Ollama)

The dev profile targets a local Ollama instance by default, so AI Review and
Safety agents work out of the box once Ollama is running:

```bash
ollama pull qwen2.5:7b   # or qwen2.5:3b for a faster, lighter model
ollama serve
```

No API key is needed for local Ollama. To use a hosted OpenAI-compatible API
instead (for example in production), set `LLM_ENDPOINT`, `LLM_MODEL`, and
`LLM_API_KEY` in `.env`. If the endpoint is unreachable, agents log a warning
and skip LLM calls; the rest of the platform still works normally.

### Handoff QA Checklist

Run this before handing the project over:

- [ ] `mvn test` passes (134 tests, H2 in-memory)
- [ ] `cd frontend && npm run build` passes
- [ ] Login as `admin/123456` and `shing/123456`
- [ ] Create a prompt template, edit it, verify a new version appears
- [ ] Fork a template and verify the fork badge links back to the source
- [ ] Restore an older template version and verify content rolls back
- [ ] Post a regular post, comment, like, and search
- [ ] Open `/agent-logs` as admin and verify stats + filters
- [ ] Open `/admin/audit` and approve/reject a pending post
- [ ] `docker compose up --build` and verify the full stack on `http://localhost:8080`

## Project Structure

```
nexus-campus/
├── frontend/                   # React SPA (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/         # Shared UI components
│   │   │   └── ui/             # Animated micro-interaction components
│   │   ├── pages/              # Page components
│   │   ├── api/                # API client + hooks
│   │   ├── stores/             # Zustand stores
│   │   └── types/              # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── src/main/java/com/nexus/campus/
│   ├── agent/                  # AI Agent (LlmClient, Review, Safety)
│   ├── controller/             # REST controllers
│   ├── service/                # Business logic
│   ├── entity/                 # MyBatis-Plus entities
│   ├── mapper/                 # Data access
│   ├── dto/                    # Request/Response DTOs
│   ├── config/                 # Spring configs
│   ├── security/               # JWT auth filter
│   └── util/                   # DFA filter, JWT util
├── pom.xml
├── CONTEXT.md                  # Domain glossary
└── docs/
    ├── adr/                    # Architecture Decision Records
    ├── research/               # Research documents
    └── ...
```

## API Examples

```bash
# Login
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# Get channels
curl http://localhost:8081/api/v1/channels

# Create post (authenticated)
curl -X POST http://localhost:8081/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"My Vibe Coding Setup","content":"Using Cursor + Claude...","categoryId":2}'
```

## License

MIT
