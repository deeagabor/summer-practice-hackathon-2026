# ADR-001: Next.js Responsive Web App

Status: Accepted

## Decision

Build ShowUp2Move as a responsive Next.js App Router application with TypeScript.

## Context

The hackathon needs one codebase that can run on phones, tablets, and desktop browsers while still supporting server-rendered page shells and API route handlers.

## Consequences

- React Server Components are the default for route shells and data-heavy pages.
- Client components are limited to interactive surfaces such as the map, forms, messaging, and matching actions.
- The web app can be containerized once and run behind Kubernetes ingress.
