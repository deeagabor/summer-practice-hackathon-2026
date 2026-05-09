# ShowUp2Move Development Bootstrap Guide

This guide explains how to begin development for ShowUp2Move in practical steps.

It assumes:

- the repository contains both client and server code,
- the main development workstation can be a Windows laptop,
- the server/runtime host is a separate macOS machine running Kubernetes,
- the web app is built as a responsive browser application.

The goal is to get from "empty repo" to "first vertical slice" without guessing at the fundamentals.

## 1. First Decisions To Lock In

Before building anything, decide these items and write them into the docs:

1. Framework: use Next.js with TypeScript and App Router.
2. Styling: use Tailwind CSS or the project’s chosen UI system.
3. Database: use PostgreSQL with PostGIS.
4. Cache / realtime / queue support: use Redis.
5. File storage: use S3-compatible object storage.
6. Auth: use cookie-based sessions or a managed auth provider.
7. Map provider: choose one provider and stick to it.
8. Real-time transport: choose Socket.IO or native WebSockets.
9. Public exposure: use Cloudflare Tunnel or the approved ingress path.
10. AI provider: choose one model/API and keep it behind a service wrapper.

Write each of these choices down in `IMPLEMENTATION_BUILD_PLAN.md` and keep the server manual aligned with them.

## 2. Prepare The Windows Laptop

Use the Windows laptop for day-to-day client development, UI work, and local app testing.

### 2.1 Install Core Tools

Install these first:

- Git
- Node.js 22 LTS
- Visual Studio Code
- Docker Desktop if local containers will be used
- Google Chrome or Microsoft Edge

Suggested Windows commands:

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install Microsoft.VisualStudioCode
winget install Google.Chrome
```

If Docker Desktop is needed, install it through `winget` or the official installer and enable WSL2 support if the team uses Linux containers.

### 2.2 Enable Package Manager Control

Use a single package manager for the repo. For a monorepo, `pnpm` is a good default.

Suggested setup:

```powershell
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version
```

Keep Node, pnpm, and package lock versions stable across the team.

### 2.3 Verify The Browser Workflow

Install and use browser devtools for:

- responsive layout testing,
- device emulation,
- network throttling,
- console inspection,
- map rendering checks.

For mobile behavior, verify both:

- narrow phone widths,
- tablet widths,
- wide desktop layouts.

## 3. Set Up The Repo Structure

Create the monorepo structure before feature work.

Recommended layout:

```text
apps/
  web/
packages/
  shared/
  database/
  config/
infra/
  k8s/
  docker/
docs/
```

How to do it:

1. Create the folders.
2. Add a root `package.json`.
3. Add workspace configuration for the chosen package manager.
4. Add a root TypeScript config.
5. Add ESLint and Prettier configs.
6. Add shared validation and type packages.
7. Add a database package for schema and migrations.
8. Add infra manifests under `infra/`.

Keep the repo shallow enough that new contributors can find things quickly.

## 4. Define The Auth And Role Model

You need the auth model before UI work becomes serious.

### 4.1 Roles

Define these roles early:

- `user`
- `organizer`
- `admin`

### 4.2 Auth Steps

1. Decide whether login is email/password, OAuth, or both.
2. Decide how sessions are stored.
3. Define cookie policy and session expiry.
4. Create authorization guards on the server.
5. Add role checks for organizer and admin routes.
6. Add seeded test accounts for local development.

### 4.3 Best Practices

- Never rely on UI-only hiding of buttons.
- Make every protected action fail safely on the server.
- Keep password and session handling in one place.
- Log auth failures without leaking secrets.

## 5. Set Up The Data Model

The database should exist before the event and matching logic is built.

### 5.1 Start With These Tables

- users
- profiles
- roles
- sports
- user_sport_preferences
- availability
- events
- event_participants
- conversations
- messages
- notifications
- posts
- media
- ai_user_profiles
- audit_logs

### 5.2 How To Do It

1. Create the database.
2. Enable PostGIS.
3. Add migrations.
4. Add seed data for sports and group-size rules.
5. Create indexes for the main query paths.
6. Add test fixtures for auth, events, and messaging.

### 5.3 Best Practices

- Prefer explicit schema migrations over ad hoc edits.
- Add foreign keys for real relationships.
- Index location and event-time fields early.
- Keep AI-derived fields separate from public profile fields.

## 6. Choose The Map And Location Strategy

The map is the main screen, so the location model should be decided early.

### 6.1 Decide The Location Granularity

Pick one of these:

- exact coordinates,
- approximate location,
- privacy-preserving coarse location.

Recommendation: support approximate location by default and allow precise location only when the user opts in.

### 6.2 Decide The Map Provider

Choose one provider and implement it once.

Practical steps:

1. Acquire the API key.
2. Store it in `.env.local` and Kubernetes secrets.
3. Build a map wrapper component.
4. Keep map logic isolated from event data logic.
5. Test marker clustering and mobile interaction.

### 6.3 Best Practices

- Query only the visible map area.
- Keep marker payloads small.
- Cache nearby activity results briefly.
- Avoid loading heavy map code before the page shell renders.

## 7. Set Up Environment Variables

Create `.env.example` and `.env.local` early.

Typical variables:

```bash
DATABASE_URL=
REDIS_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_MAP_PROVIDER_KEY=
S3_BUCKET_NAME=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
AI_PROVIDER_API_KEY=
CLOUDFLARE_TUNNEL_TOKEN=
```

How to do it:

1. Put all required variables into `.env.example`.
2. Keep actual secrets only in `.env.local` or secret managers.
3. Add startup validation that fails fast if required variables are missing.
4. Mirror the same variable contract in Kubernetes secrets.

Best practice: document every environment variable once, then reuse that list everywhere.

## 8. Set Up Tooling And Quality Gates

Before building features, set the project guardrails.

### 8.1 Commands To Add

- `lint`
- `format`
- `typecheck`
- `test`
- `test:watch`
- `build`
- `dev`

### 8.2 What To Configure

1. ESLint.
2. Prettier.
3. TypeScript strict mode.
4. Unit testing framework.
5. Integration test setup.
6. E2E test setup for the main flows.

### 8.3 Best Practices

- Run lint and typecheck on every PR.
- Keep formatting automatic.
- Fix warnings before they become debt.
- Add one small test per high-risk feature slice.

## 9. Build The First Vertical Slice

Do not start with broad platform work. Start with one usable path.

Recommended first slice:

1. User registers and logs in.
2. User completes a profile.
3. User selects sports and availability.
4. User lands on the map-first home screen.
5. Nearby activities appear.
6. User opens one activity and joins it.

Why this slice first:

- it proves auth, database, UI, and layout,
- it reveals integration problems early,
- it creates a foundation for events and matching.

## 10. Prepare The UI On Windows

The Windows laptop should be used to validate the responsive client side frequently.

### 10.1 What To Check

- map layout on narrow screens,
- bottom navigation spacing,
- activity cassette sizing,
- friend cassette placement,
- event detail sheet behavior,
- chat screens on mobile,
- organizer and admin dashboard layouts on desktop.

### 10.2 Practical Workflow

1. Start the dev server locally.
2. Open the app in Chrome or Edge.
3. Use responsive mode for common viewport sizes.
4. Check console warnings and network failures.
5. Keep screenshots of layout regressions if needed.

### 10.3 Best Practices

- Do not design desktop-only layouts first.
- Keep the primary map usable with one hand on mobile.
- Use stable dimensions for nav and cassettes.
- Avoid text overflow in small viewports.

## 11. Set Up The Server Side Workflow

The server side should be developed with a clear separation from the Windows laptop workflow.

### 11.1 Development Approach

1. Develop server logic locally if the stack supports it.
2. Run PostgreSQL and Redis locally for integration testing.
3. Mirror the same code paths that will run on the macOS server.
4. Validate container builds before deployment.
5. Deploy to the macOS Kubernetes host only after local validation passes.

### 11.2 Best Practices

- Keep request handlers thin.
- Put business logic in services.
- Use background jobs for AI and notifications.
- Add health endpoints from the start.
- Treat server logs and metrics as first-class features.

## 12. Prepare The macOS Server

The macOS host runs the deployable Kubernetes environment.

### 12.1 What To Install

- Docker or compatible container runtime.
- Kubernetes distribution.
- `kubectl`.
- tunnel client such as Cloudflare Tunnel.
- object storage client if needed.

### 12.2 What To Configure

1. Create a namespace for the app.
2. Add secrets for the database, Redis, storage, and tunnel.
3. Add deployment manifests for web and worker.
4. Add service and ingress manifests.
5. Add liveness, readiness, and startup probes.
6. Add persistent storage if the database runs locally.

### 12.3 Best Practices

- Keep secrets out of repo files.
- Use rolling updates.
- Use resource limits.
- Verify restart behavior deliberately.
- Keep the public URL documented.

## 13. Set Up Public Access

Users need to reach the app from a browser URL.

How to do it:

1. Deploy the ingress or tunnel.
2. Route a DNS name to the service.
3. Enable HTTPS.
4. Test from outside the local network.
5. Confirm the mobile browser experience works over the public URL.

Best practice: test the public URL early, not at the end of the project.

## 14. Decide AI Scope Early

AI can get out of hand unless the team defines boundaries.

### 14.1 Recommended MVP AI Scope

- extract interests from profile text,
- generate compatibility scores,
- recommend teammates,
- analyze attended posts for internal profile enrichment.

### 14.2 Post-MVP AI Scope

- image-based interest detection,
- advanced moderation,
- richer semantic search,
- wearable-based enrichment.

### 14.3 Best Practices

- queue AI work asynchronously,
- keep internal AI profile data private,
- store reason codes for recommendations,
- make AI optional for the user where appropriate.

## 15. Add Documentation And Decision Records

As the project evolves, keep the docs current.

Update these files together:

- `IMPLEMENTATION_BUILD_PLAN.md`
- `SERVER_SIDE_SETUP_MANUAL.md`
- this guide
- ADR notes under `docs/adr/`

Best practice: when a major stack decision changes, update the docs before the code drifts.

## 16. Recommended Order Of Work

If the goal is to start development efficiently, use this order:

1. Lock the stack.
2. Set up the Windows laptop tools.
3. Create the monorepo structure.
4. Define auth and roles.
5. Create the database schema.
6. Add environment variables and tooling.
7. Build the first vertical slice.
8. Add the map-first UI.
9. Add events and chat.
10. Set up the macOS server and Kubernetes path.
11. Add AI, organizer, and admin features.

## 17. Quick Rule Summary

- Build the client for responsiveness first.
- Build the server around clear domain boundaries.
- Keep the Windows laptop focused on UI and local dev.
- Keep the macOS host focused on containerized deployment.
- Validate each slice with tests.
- Document every major decision once.
