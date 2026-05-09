# ShowUp2Move: Server-Side & Kubernetes Progress Report

This document summarizes the steps taken to set up the server-side environment on macOS, configure the Kubernetes cluster, and deploy the ShowUp2Move application.

## 1. Environment Preparation
- **Kubernetes Infrastructure**: Installed and configured `minikube` using the Docker driver to provide a local Kubernetes environment.
- **Dependency Management**: Verified and utilized existing Docker and Node.js (v22) tools for building and managing the application.

## 2. Cluster Configuration
- **Namespace**: Created the dedicated `showup2move` namespace to isolate application resources.
- **Secrets Management**: Populated the `showup2move-secrets` Kubernetes Secret with real configuration values extracted from `.env.local`, including:
    - PostgreSQL & Redis URLs and credentials.
    - Auth secrets and API keys (Google Maps, Gemini).
    - Cloudflare Tunnel credentials (ID and Token).

## 3. Containerization & Deployment
- **Docker Image Optimization**: 
    - Updated `infra/docker/web.Dockerfile` to include a compilation step for the background worker (`worker.ts` -> `worker.js`).
    - Added an empty `public` directory to satisfy Next.js build requirements.
- **Image Lifecycle**: Built the production-ready Docker image locally and loaded it into the `minikube` image registry.
- **Orchestration**: Applied the modular monorepo Kubernetes manifests (Web, Worker, Postgres, Redis, Toolbox, Cloudflared) using Kustomize overlays.

## 4. Database Setup & Persistence
- **Stateful Infrastructure**: Deployed PostgreSQL with PostGIS as a `StatefulSet` with a persistent volume for data durability.
- **Schema & Seeding**: 
    - Executed SQL migrations to establish the full relational schema (users, events, matching, etc.).
    - Seeded the database with mandatory sports taxonomy and group-size rules.
- **Access Control**: Synced the in-cluster PostgreSQL user password with the Kubernetes Secret to ensure connectivity for all services.

## 5. Reliability & Verification
- **Self-Healing Verified**: Demonstrated Kubernetes' ability to automatically detect and replace failed or deleted pods, ensuring continuous availability.
- **Service Connectivity**: 
    - Validated `cloudflared` connectivity for external access.
    - Confirmed the `toolbox` service is ready for secure database inspection.
    - Verified `showup2move-web` and `showup2move-worker` are healthy and processing tasks.

## 6. Next Steps
- **Public Domain Validation**: Verify the Cloudflare public hostname once the DNS propagation is complete.
- **Windows Local Container Fallback**: Added `docker-compose.local.yml` and `LOCAL_WINDOWS_CONTAINER_RUNBOOK.md` so the demo can run entirely on this Windows device if Cloudflare or the macOS server is unavailable.
- **Frontend Stabilization**: The home map now loads the repo-root `.env.local`, uses the normal app shell spacing/navigation, and has a usable local map preview if Google Maps is not available.
- **AI Matching Demo**: Run a full matching cycle from `/matching`; Gemini uses the server-side `GOOGLE_AI_API_KEY` when available and falls back locally if not.

**Current recommendation:** use the Windows local container path for the final demo unless the macOS Kubernetes and Cloudflare hostname are confirmed healthy immediately before presenting.
