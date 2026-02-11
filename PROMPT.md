# Ember MVP — Ralph Loop Build Prompt

## Your Mission

Build the Ember MVP following the implementation plan at `docs/plans/2026-02-10-feat-ember-mvp-implementation-plan.md`. This is a 9-day plan for a cross-platform AI memory platform.

## Source Documents (Read These First)

1. **Implementation PRD** (your primary source of truth): `docs/plans/2026-02-10-feat-ember-mvp-implementation-plan.md`
   - Day-by-day task breakdown, schema, directory structure, code patterns, acceptance criteria
2. **Original plan** (background context): `docs/plans/2026-02-10-feat-ember-mvp-persistent-ai-memory-plan.md`
3. **UI/UX spec** (design tokens, components, animations): `docs/plans/ui-ux-recommendations.md`
4. **Todo findings** (known issues to be aware of): `todos/`
5. **Prioritization plan** (decisions made): `todos/000-pending-p1-PRIORITIZATION-PLAN.md`

## Build Order (Follow Exactly)

### Phase 1: Project Setup + Inngest Queue (Days 1-2)
1. Initialize Next.js 16 project with TypeScript, Tailwind CSS v4, dark mode
2. Install all dependencies (see PRD "Tech Stack" section)
3. Create `.env.example` with all required variables
4. Write Drizzle schema for all 5 tables (`src/lib/db/schema.ts`)
5. Set up Clerk auth (middleware, webhook handler with idempotency)
6. Set up Inngest client + serve route
7. Write `process-capture` Inngest function with step functions
8. Write dual extraction prompt + Zod schemas
9. Create paste capture Server Action
10. Create capture status polling endpoint

### Phase 2: API Layer (Days 3-5)
11. Build API token system (create, hash, store, validate)
12. Build Bearer token auth middleware
13. Build API endpoints: POST /captures, GET /memories, POST /wake-prompts, GET /profiles
14. Write wake prompt template and generation logic
15. Build standardized API error responses
16. Add rate limit headers to all API responses

### Phase 3: Row-Level Security (Days 6-7)
17. Write RLS migration (enable on all tables, create policies)
18. Build tenant context middleware (`withTenant`)
19. Wrap all Server Actions and API routes with tenant context
20. Test: User A cannot access User B's data

### Phase 4: Rate Limiting + UI (Days 8-9)
21. Set up Upstash Redis rate limiters by tier
22. Apply rate limiting to Server Actions and API routes
23. Build capture page (paste textarea, processing indicator, results)
24. Build memories page (category filters, memory cards, inline edit, delete with double confirmation, infinite scroll)
25. Build wake prompt page (category picker with token counts, generate, preview, copy)
26. Build settings page (account, token budget, API tokens, delete account)
27. Build dashboard layout (sidebar desktop, bottom tabs mobile)
28. Apply design tokens from UI/UX spec (amber theme, dark mode, Fraunces/Source Sans fonts)

## Key Architecture Decisions (Do Not Change)

- **Inngest** for background processing (NOT `after()`)
- **Upstash Redis** for rate limiting
- **Neon Postgres** with Drizzle ORM
- **Clerk** for auth
- **Node.js runtime** (NOT Edge)
- Memory categories: `emotional`, `work`, `hobbies`, `relationships`, `preferences`
- `captureEmail` is NULLABLE (email capture deferred to Phase 2)
- Capture statuses: `queued`, `processing`, `completed`, `failed`
- Token budget default: 8,000 tokens (user-configurable)
- No soft delete yet — use double confirmation dialogs on all deletes
- No email capture, no screenshot capture — paste only for MVP
- No onboarding flow — empty states serve as guidance

## Quality Standards

- TypeScript strict mode, no `any`
- Zod validation on ALL inputs (Server Actions, API routes, Claude responses)
- `ActionState<T>` discriminated union for Server Action returns
- All API responses use standardized format (see PRD)
- RLS must be enforced — no direct DB queries without tenant context
- Rate limiting on all mutation endpoints
- Mobile-responsive (bottom tabs at < 768px)
- Dark mode first, amber accent theme

## What NOT to Build

- Email capture (Phase 2)
- Screenshot capture (Phase 2)
- Stripe/payments (Phase 3)
- Browser extension (Phase 4)
- Onboarding flow (Phase 4)
- Soft delete (Phase 1.5)
- Search (Phase 2)
- Custom categories (future)
- Embedding vectors (future)

## Progress Tracking

After completing work, check `git status` and `git log` to see what you've already built. Read existing files before modifying them. Build incrementally — each iteration should make forward progress.

When ALL acceptance criteria in the PRD are met (Section "Acceptance Criteria — Full MVP"), output:

<promise>EMBER MVP COMPLETE</promise>

## Commit Convention

Commit after completing each logical unit of work. Use conventional commits:
- `feat: ...` for new features
- `fix: ...` for bug fixes
- `chore: ...` for setup/config

Do not batch everything into one commit. Commit early, commit often.
