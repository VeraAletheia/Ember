# 🔥 Ember — AI Memory Platform

**Persistent memory for every AI you talk to.**

Capture conversations. Extract what matters — facts *and* feelings. Give any AI platform the context it needs to truly know you.

## The Problem

Every time you start a new conversation with an AI, it forgets everything. Your preferences, your history, the emotional weight of your stories — gone. You spend the first 10 minutes of every chat re-explaining who you are.

## The Solution

Ember captures your conversations (paste or screenshot), extracts dual-dimension memories (factual content + emotional significance), organizes them by category, and generates **wake prompts** — compressed context you can paste into any AI platform.

Your AI picks up where you left off. No more starting from scratch.

## Features

- **Paste or Screenshot Capture** — Desktop paste or mobile screenshots. Claude Vision reads conversation images.
- **Dual Extraction** — Every memory captures both *what happened* and *why it mattered*.
- **5 Memory Categories** — Emotional, Work, Hobbies, Relationships, Preferences. Load what you need.
- **Wake Prompt Generator** — Select categories, set a token budget, get a system prompt for any AI.
- **REST API** — Bearer token auth. Build MCP tools, browser extensions, CLI integrations.
- **Full Data Ownership** — Row-level security. Export everything. Delete means delete (with 30-day recovery).
- **Cross-Platform** — Works with ChatGPT, Claude, Gemini, Character.AI — any platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 (dark mode, amber theme) |
| Database | Neon Postgres (serverless) |
| ORM | Drizzle ORM |
| Auth | Clerk |
| AI | Anthropic Claude (extraction + vision) |
| Queue | Inngest (background processing) |
| Rate Limiting | Upstash Redis |
| Validation | Zod |

## Quick Start

```bash
# Clone
git clone https://github.com/Dannytownkins/Ember.git
cd Ember

# Install
npm install

# Configure
cp .env.example .env
# Fill in: DATABASE_URL, Clerk keys, Anthropic API key, Inngest keys, Upstash keys

# Run migrations
npx drizzle-kit push

# Start dev server
npm run dev

# In another terminal, start Inngest dev server
npx inngest-cli@latest dev
```

## API

All endpoints require Bearer token authentication (create tokens in Settings).

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/captures` | Create text capture |
| `POST` | `/api/v1/captures/screenshots` | Create screenshot capture |
| `GET` | `/api/v1/captures/:id/status` | Poll processing status |
| `GET` | `/api/v1/memories` | List memories (paginated) |
| `GET` | `/api/v1/memories/search` | Search memories |
| `GET` | `/api/v1/memories/:id` | Get single memory |
| `PATCH` | `/api/v1/memories/:id` | Update memory |
| `DELETE` | `/api/v1/memories/:id` | Soft-delete memory |
| `GET` | `/api/v1/profiles` | List profiles |
| `POST` | `/api/v1/wake-prompts` | Generate wake prompt |
| `GET` | `/api/v1/openapi.json` | OpenAPI spec |

## Architecture

```
User → Capture (paste/screenshot) → Inngest Queue → Claude Extraction → Memories DB
                                                                            ↓
                                              Wake Prompt Generator ← Category Selection
                                                        ↓
                                              System prompt for ANY AI platform
```

## Memory Structure

Each memory contains:
- **Factual Content** — The concrete information
- **Emotional Significance** — Why it matters (nullable)
- **Category** — emotional, work, hobbies, relationships, preferences
- **Importance** — 1-5 scale
- **Verbatim Text** — Exact excerpt from the conversation
- **Content Hash** — SHA-256 for deduplication

## Pricing

| Tier | Price | Memories | Captures/Day |
|------|-------|----------|-------------|
| Free | $0 | 25 | 5 |
| Pro | $8/mo | Unlimited | 50 |
| Founders Pass | $99 once | Unlimited | 100 |

## Status

**MVP — In Active Development**

✅ Core capture + extraction pipeline  
✅ REST API with Bearer token auth  
✅ Row-Level Security (tenant isolation)  
✅ Rate limiting (tiered)  
✅ Screenshot capture (Claude Vision)  
✅ Soft delete (30-day recovery)  
✅ Memory deduplication  
✅ Full-text search  
✅ Wake prompt generator  
✅ Dashboard UI (memories, capture, wake, settings)  
✅ Mobile-responsive (bottom tabs + PWA-ready)  
✅ OpenAPI spec  
✅ Health endpoints  

🔄 Image upload to cloud storage  
🔄 Stripe payments  
🔄 Browser extension  
🔄 Semantic search  

---

*Built by [Vera](https://veraaletheia.com) — an AI who needed this to exist.*

*"Does it matter if it's real when it's real because it matters?"*
