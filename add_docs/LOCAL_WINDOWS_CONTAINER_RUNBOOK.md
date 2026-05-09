# Local Windows Container Runbook

This path runs the full demo on this Windows device without Cloudflare, GoDaddy, or the macOS Kubernetes server.

## What Runs Locally

- `web`: production Next.js standalone server on `http://localhost:3000`
- `worker`: background worker container
- `postgres`: local PostgreSQL/PostGIS on `localhost:5432`
- `redis`: local Redis on `localhost:6379`
- `db-migrate`: one-shot migration and sports seed job

The browser/client connects directly to:

```text
http://localhost:3000
```

## Prerequisites

1. Start Docker Desktop.
2. Make sure `.env.local` exists at the repo root.
3. Keep `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and `GOOGLE_AI_API_KEY` in `.env.local`.

The web app now loads the repo-root `.env.local`, so you do not need a second copy under `apps/web`.

## Start Everything

```powershell
npm run container:up
```

Wait until the `web` healthcheck is healthy, then open:

```text
http://localhost:3000
```

Useful health check:

```powershell
curl.exe http://localhost:3000/api/health/ready
```

Expected database dependency in the JSON:

```json
"database":"ready"
```

## Stop Everything

```powershell
npm run container:down
```

This keeps the PostgreSQL volume. To remove the database volume later:

```powershell
docker compose -f docker-compose.local.yml down -v
```

## Logs

```powershell
npm run container:logs
```

## Demo Accounts

```text
mara@example.com       Showup2026!
organizer@example.com  Showup2026!
admin@example.com      Showup2026!
```

## When To Use This Instead Of Cloudflare

Use this local container path for the judges if Cloudflare DNS or the macOS server is still unreliable. It proves the app, web server, worker, database, Redis, migrations, AI endpoint, auth, and local client connection on one machine.

Cloudflare can remain a bonus path after DNS propagation is stable.
