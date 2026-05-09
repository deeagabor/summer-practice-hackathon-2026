# ShowUp2Move Server Side Setup Manual

This manual explains how to set up the server side of ShowUp2Move, how the backend pieces fit together, and which practices should be followed while building and running the system.

The intent is to give both humans and AI agents a clear path from empty repo to working server, with enough structure to keep the codebase stable as features grow.

## 1. Purpose

The server side is responsible for:

- authentication and authorization,
- profile and account management,
- event creation and participation,
- matching and recommendation logic,
- messaging and invitations,
- notifications and reminders,
- photo upload and post handling,
- AI enrichment jobs,
- admin and organizer actions,
- health checks and deployment readiness,
- data persistence and backup safety.

The server should be designed as a modular monolith first, with clear boundaries so pieces can be separated later if needed.

## 2. Recommended Baseline Stack

Use the following baseline unless the team explicitly chooses a different option:

- Node.js 22 LTS or newer.
- Next.js with App Router.
- TypeScript in strict mode.
- PostgreSQL with PostGIS.
- Redis.
- Object storage compatible with S3.
- Kubernetes for deployment.
- Docker for local and production images.
- Cloudflare Tunnel or a similar public exposure method.

If the project later adopts a dedicated backend framework, keep the same domain boundaries and route contracts.

## 3. Server Responsibilities by Domain

### Auth

- Register users.
- Log users in and out.
- Issue and validate sessions.
- Support roles: user, organizer, admin.
- Protect every mutation server-side.

### Profile

- Store bios, avatars, sport preferences, skill levels, privacy settings, and location preferences.
- Support profile editing and photo upload metadata.

### Events

- Create manual events.
- Create auto-generated match events.
- Manage event status transitions.
- Track attendance, confirmations, and cancellations.

### Matching

- Use availability, sport preferences, distance, and skill fit.
- Generate group suggestions and captain assignment.
- Store reason codes for explainability.

### Messaging

- Support direct chat, group chat, event chat, and invitation messages.
- Deliver real-time updates where possible.

### AI

- Extract sports and interests from profile text and posts.
- Generate internal compatibility profiles.
- Keep AI-derived data separate from public profile data.

### Admin and Organizer

- Handle moderation, approvals, audits, and operational controls.
- Keep organizer tools distinct from admin tools.

## 4. First-Time Setup Checklist

Complete these before feature work starts:

1. Install Node.js, Docker, Git, and a code editor.
2. Create the repo structure for app, shared code, database, and infra.
3. Set up the PostgreSQL database and Redis instance.
4. Define environment variables for local development.
5. Establish the auth/session approach.
6. Define the database schema and migration tool.
7. Create health endpoint routes.
8. Add linting, formatting, and type checking.
9. Add a basic test runner and smoke tests.
10. Prepare a Kubernetes namespace and base manifests.
11. Decide on the map provider and upload provider.
12. Confirm how the public URL will be exposed.

## 5. Local Development Setup

### 5.1 Install Dependencies

Install the main tooling first:

- Node.js 22 LTS
- Git
- Docker Desktop or equivalent
- Kubernetes client tools if you will run a local cluster
- A PostgreSQL client
- Redis client tools if desired

### 5.2 Create Environment Files

Create two environment files:

- `.env.example`
- `.env.local`

Keep secrets out of source control.

Suggested variables:

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

Add more variables only when a feature truly needs them.

### 5.3 Install Server Packages

Install packages according to the chosen implementation, then lock versions early.

Typical server-side packages may include:

- database ORM or query builder,
- validation library,
- auth/session library,
- Redis client,
- file upload helper,
- real-time transport,
- job queue,
- logging library,
- test framework.

Keep the package list small enough that the runtime remains easy to understand.

### 5.4 Database Bootstrap

Set up the database with these steps:

1. Create the database.
2. Enable PostGIS.
3. Run the first migration.
4. Seed sports and default role data.
5. Verify health queries work.

Recommended database objects:

- users,
- profiles,
- roles,
- sports,
- user_sport_preferences,
- availability,
- events,
- event_participants,
- conversations,
- messages,
- notifications,
- posts,
- media,
- ai_user_profiles,
- audit_logs.

Add indexes for:

- event status and start time,
- coordinates,
- sport id,
- role,
- participant status,
- unread message state,
- audit log time.

## 6. Server Code Organization

Keep server code separated by domain rather than by technical layer alone.

Suggested structure:

```text
src/
  app/
  server/
    auth/
    profiles/
    sports/
    availability/
    events/
    matching/
    messaging/
    notifications/
    uploads/
    ai/
    admin/
    organizer/
    health/
  lib/
  types/
  validation/
```

Guidelines:

- Put business rules in domain modules.
- Keep route handlers thin.
- Validate inputs at the edge.
- Reuse shared types between frontend and backend.
- Keep database access in a small number of repository modules.

## 7. API Setup Rules

Use route groups for the main domains:

- `/api/auth`
- `/api/profile`
- `/api/sports`
- `/api/availability`
- `/api/events`
- `/api/messages`
- `/api/invitations`
- `/api/matching`
- `/api/recommendations`
- `/api/uploads`
- `/api/organizer`
- `/api/admin`
- `/api/health`

Every route should:

- validate request payloads,
- enforce authorization,
- return stable response shapes,
- log failures with enough context to debug,
- avoid exposing internal AI data.

## 8. Real-Time and Background Work

### Real-Time

Use a real-time transport for:

- chat messages,
- event invitations,
- unread counts,
- presence,
- live event updates.

If there are multiple pods, back the transport with Redis so messages remain consistent across instances.

### Background Jobs

Put these in a background worker:

- AI enrichment,
- compatibility scoring,
- recommendation refresh,
- notifications,
- scheduled reminders,
- post moderation tasks,
- recurring event generation,
- cleanup jobs.

Do not run long jobs in the request path.

## 9. Server-Side Rendering Setup

Render these on the server:

- app shell,
- map page shell,
- profile pages,
- event detail pages,
- organizer pages,
- admin pages,
- any public event pages.

Keep these as client components:

- interactive map,
- chat composer,
- live location tracking,
- uploads,
- interactive polls.

Performance rules:

- keep initial HTML useful,
- defer heavy client JS,
- cache stable data,
- use short-lived caching for nearby activities,
- avoid loading too many map markers at once.

## 10. Health and Readiness

Add three health concepts:

- liveness: process is running,
- readiness: service can handle traffic,
- startup: app has finished booting.

Recommended endpoints:

- `/api/health/live`
- `/api/health/ready`
- `/api/health/startup`

Readiness should check the critical dependencies used for live traffic, usually PostgreSQL and Redis.

## 11. Kubernetes Setup

Deploy these workloads:

- web app,
- worker,
- PostgreSQL,
- Redis,
- ingress controller,
- tunnel service.

Best practices:

- set resource requests and limits,
- use rolling updates,
- use readiness and liveness probes,
- keep secrets in Kubernetes Secrets,
- use persistent volumes for stateful services,
- separate web and worker replicas,
- do not run everything in a single container.

For local macOS deployment, make sure the Kubernetes distribution is running and that the cluster has enough memory for the database and web server.

## 12. Public URL Setup

Use a tunnel or ingress exposure method so the site is reachable from a browser URL.

Checklist:

- point the tunnel to the ingress or web service,
- map a DNS name,
- verify HTTPS,
- test from outside your local network,
- confirm mobile browsers can reach it.

## 13. Security Best Practices

- Use secure sessions.
- Protect every server mutation with authorization.
- Hash passwords with a modern algorithm if using password login.
- Validate and sanitize all input.
- Restrict file uploads by type, size, and content.
- Use signed URLs for object storage uploads.
- Rate limit login, signup, chat, and invite endpoints.
- Keep admin actions audited.
- Separate public profile data from internal AI data.
- Never trust client-supplied permissions or role flags.

## 14. Stability Best Practices

- Keep the web process stateless.
- Store durable data in the database and object storage.
- Use retries for transient network work.
- Make jobs idempotent where possible.
- Add timeouts to downstream calls.
- Track failing jobs and queue depth.
- Use circuit-breaker style behavior for optional integrations.
- Keep the health endpoints cheap and deterministic.

## 15. Performance Best Practices

- Index geospatial and event query paths.
- Return only the map data needed for the visible viewport.
- Paginate messages and posts.
- Use image thumbnails in lists and cassettes.
- Precompute compatibility signals in the background.
- Avoid recalculating expensive recommendations on every request.
- Cache stable reference data like sports and group-size rules.

## 16. Testing Best Practices

The server should have:

- unit tests for matching and authorization logic,
- integration tests for auth, events, chat, and uploads,
- smoke tests for health endpoints,
- deployment tests for Kubernetes readiness,
- a small set of end-to-end tests for the critical user flow.

Minimum coverage targets:

- registration and login,
- profile creation,
- event creation,
- join and invite flow,
- chat message delivery,
- organizer authorization,
- admin moderation,
- health endpoint behavior.

## 17. Daily Development Workflow

Suggested day-to-day flow:

1. Pull the latest branch.
2. Run lint, typecheck, and tests.
3. Start PostgreSQL and Redis locally.
4. Run migrations.
5. Start the web app and worker.
6. Verify the health endpoints.
7. Implement one vertical slice at a time.
8. Add tests before moving to the next slice.

This keeps the server changes easy to reason about and reduces merge pain.

## 18. First Milestones

If you are starting from scratch, build in this order:

1. Auth and sessions.
2. User profile and roles.
3. Sport preferences and availability.
4. Event creation and participation.
5. Messaging and event invitations.
6. Matching and captain assignment.
7. Organizer and admin dashboards.
8. AI enrichment jobs.
9. Kubernetes deployment and public URL.

## 19. Things Not To Do Early

- Do not split into microservices too early.
- Do not add AI before the base profile and event flow works.
- Do not rely on client-side authorization.
- Do not skip migrations and seed data.
- Do not store secrets in the repo.
- Do not build the full deployment before the app can run locally.
- Do not overcomplicate the first version of the matching algorithm.

## 20. Handoff Notes

Keep this manual current as the stack settles. Whenever a major backend choice changes, update:

- the main implementation plan,
- the environment variable list,
- the Kubernetes manifests,
- the health endpoints,
- the test plan.

That keeps the whole project aligned and prevents drift between architecture and implementation.
