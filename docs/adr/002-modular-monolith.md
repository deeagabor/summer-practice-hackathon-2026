# ADR-002: Modular Monolith First

Status: Accepted

## Decision

Keep the first version as one Next.js deployable with clear domain modules under `apps/web/src/server`.

## Context

ShowUp2Move has many domains: auth, profiles, sports, events, matching, messaging, uploads, organizer tools, and admin operations. Splitting these into services too early would slow the hackathon build and complicate deployment.

## Consequences

- Route handlers stay thin and call domain services.
- Shared validation and matching logic live in `packages/shared`.
- The worker is represented in Kubernetes now and can become a real queue consumer as AI, reminders, and recurring matching mature.
