# ShowUp2Move

ShowUp2Move is a responsive Next.js web app for spontaneous sports matching, event coordination, messaging, and organizer/admin operations.

The current implementation follows the staged plan in `IMPLEMENTATION_BUILD_PLAN.md` and delivers a runnable foundation plus a first vertical slice:

- map-first responsive home screen with Google Maps, activity markers, event cassettes, and bottom navigation,
- register/login/logout with secure cookie session scaffolding,
- profile editor with sports preferences, skill level, play intensity, location privacy, AI opt-in, and ShowUpToday availability,
- manual event creation and join flow,
- event and group messaging surface,
- Gemini-backed AI profile enrichment plus matching with explainable compatibility scores and captain assignment,
- organizer and admin dashboard surfaces,
- shared validation/types/matching package,
- SQL migration package for PostgreSQL/PostGIS,
- Docker and Kubernetes manifests with health probes and resource limits.
- Optional MCP Toolbox for Databases config for read-only PostgreSQL inspection in Kubernetes.

## Tech Stack

- Next.js App Router with TypeScript
- React Server Components by default, client components for interactive map/forms/chat
- Tailwind CSS
- Zod validation in `@showup2move/shared`
- PostgreSQL/PostGIS migration SQL in `@showup2move/database`
- Seeded in-memory data store for the hackathon runnable slice
- Kubernetes manifests for web, worker, PostgreSQL, Redis, ingress, HPA, network policies, and Cloudflare Tunnel

## Repository Layout

```text
apps/web              Next.js app, route handlers, server modules, UI
packages/shared       Domain types, schemas, sports constants, matching logic
packages/database     SQL migrations and seed data
packages/config       Shared TypeScript config
infra/docker          Production Dockerfile
infra/k8s             Kubernetes base manifests and local overlay
infra/mcp/toolbox     MCP Toolbox tools.yaml for controlled database tools
docs/adr              Architecture decision records
```

## Local Setup

```powershell
npm install
copy .env.example .env.local
npm run dev
```

The app runs at `http://localhost:3000`.

For Google Maps and Gemini, set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and `GOOGLE_AI_API_KEY` in the repo-root `.env.local`. The web app loads that root env file even though Next.js runs from `apps/web`. The Gemini key is only used from server route handlers.

Seed demo accounts use the password `Showup2026!`:

```text
mara@example.com
organizer@example.com
admin@example.com
```

## Quality Commands

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

`npm run verify` runs the full local quality gate.

## API Highlights

```text
/api/auth/register
/api/auth/login
/api/auth/logout
/api/profile
/api/sports
/api/availability
/api/events
/api/events/:id/participants
/api/messages
/api/ai/profile
/api/matching/run
/api/recommendations
/api/uploads/presign
/api/admin/overview
/api/organizer/events
/api/health/live
/api/health/ready
/api/health/startup
```

## Deployment

Run the full local container stack on Windows:

```powershell
npm run container:up
```

This starts web, worker, PostgreSQL/PostGIS, Redis, and database migrations locally. Detailed steps are in `LOCAL_WINDOWS_CONTAINER_RUNBOOK.md`.

Build the production image:

```powershell
docker build -f infra/docker/web.Dockerfile -t showup2move-web:local .
```

Apply the local Kubernetes overlay from a configured cluster:

```powershell
kubectl apply -k infra/k8s/overlays/local
kubectl rollout status deployment/showup2move-web -n showup2move
```

macOS-hosted Kubernetes deployment and self-healing validation are documented in `macos_followup_report.md`. The final judge walkthrough is in `FINAL_PRESENTATION_RUNBOOK.md`, and the updated macOS continuation checklist is in `macos_final_followup_report.md`.

## MCP Toolbox for Databases

The app does not require MCP Toolbox at runtime. It is included as an optional cluster service for development/admin continuation work where an AI assistant needs controlled read-only access to PostgreSQL.

The source config is:

```text
infra/mcp/toolbox/tools.yaml
```

The Kubernetes base mounts the same config through `showup2move-toolbox-config` and runs an internal `showup2move-toolbox` service. Keep this service internal unless you add proper authentication and network controls.

## Current Security Note

`npm audit --omit=dev` currently reports a moderate advisory for the `postcss` version nested under Next.js. The non-force audit fix cannot resolve it, and the force fix would downgrade Next to an unsafe major version. Track the upstream Next.js patched release before public production deployment.
