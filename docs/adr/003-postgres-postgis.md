# ADR-003: PostgreSQL With PostGIS

Status: Accepted

## Decision

Use PostgreSQL with PostGIS as the primary durable data store.

## Context

The platform needs geospatial activity search, roles, event participants, messages, moderation, audit logs, and reporting. A relational model with geospatial indexes is the simplest stable base for these needs.

## Consequences

- The SQL schema lives in `packages/database/migrations`.
- AI compatibility vectors are stored as a portable `real[]` field for now.
- A pgvector migration can be added later when the production database has the extension installed.
