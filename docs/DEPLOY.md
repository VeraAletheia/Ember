# Ember Deployment Guide

## Pre-Deployment Checklist

### 1. Neon Database
- [ ] Create a Neon project at [neon.tech](https://neon.tech)
- [ ] Copy the connection string (both direct and pooled)
- [ ] Run the initial migration: `npx drizzle-kit push`
- [ ] Run the soft-delete migration: `drizzle/0002_soft_delete_and_dedup.sql`

### 2. Clerk Auth
- [ ] Create a Clerk app at [clerk.com](https://clerk.com)
- [ ] Get the publishable key and secret key
- [ ] Set up a webhook endpoint:
  - URL: `https://your-domain.com/api/webhooks/clerk`
  - Events: `user.created`, `user.deleted`
  - Copy the webhook secret
- [ ] Configure appearance to match Ember's dark theme

### 3. Anthropic API
- [ ] Get an API key from [console.anthropic.com](https://console.anthropic.com)
- [ ] Ensure access to `claude-sonnet-4-5-20250929`

### 4. Inngest
- [ ] Create an Inngest account at [inngest.com](https://inngest.com)
- [ ] Create an app and get the event key + signing key
- [ ] Functions will auto-register when the app starts

### 5. Upstash Redis
- [ ] Create a Redis instance at [upstash.com](https://upstash.com)
- [ ] Copy the REST URL and token

### 6. Vercel
- [ ] Import the GitHub repo on [vercel.com](https://vercel.com)
- [ ] Set all environment variables (see below)
- [ ] Deploy

## Environment Variables

```bash
# Database (Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/ember?sslmode=require
DATABASE_URL_POOLED=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/ember?sslmode=require&pgbouncer=true

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AI (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# Queue (Inngest)
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# App
NEXT_PUBLIC_APP_URL=https://ember.app
```

## Post-Deployment Verification

### Quick Smoke Test
```bash
# Health check
curl https://your-domain.com/api/health

# Readiness
curl https://your-domain.com/api/ready

# OpenAPI spec
curl https://your-domain.com/api/v1/openapi.json
```

### Full Integration Test
1. Sign up via Clerk
2. Paste a sample conversation (100+ chars)
3. Wait for extraction to complete
4. Verify memories appear with categories
5. Generate a wake prompt
6. Create an API token in settings
7. Test API access:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-domain.com/api/v1/profiles
```

## Domain Setup

When ready for a custom domain:
1. Add domain in Vercel → Settings → Domains
2. Update DNS records as instructed
3. Update `NEXT_PUBLIC_APP_URL` env var
4. Update Clerk webhook URL
5. Update Inngest app URL

## Monitoring

- **Health endpoint**: `GET /api/health` — checks database + Claude API
- **Inngest dashboard**: View function runs, errors, retries at inngest.com
- **Vercel logs**: Runtime logs available in the Vercel dashboard

## Database Migrations

```bash
# Generate a migration from schema changes
npx drizzle-kit generate

# Push schema directly (dev)
npx drizzle-kit push

# Apply migrations (production)
npx drizzle-kit migrate
```

---

*Ready to deploy when you are.* 🔥
