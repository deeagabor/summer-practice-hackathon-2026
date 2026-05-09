# ShowUp2Move Final Presentation Runbook

This is the shortest reliable path to run the hackathon demo locally, expose it through Cloudflare, and explain the server-side/Kubernetes pieces to judges.

## What Is Implemented

- Next.js web app with real Google Maps JavaScript API loading on the home map.
- Secure register/login/logout flow with scrypt password hashing, HTTP-only session cookies, CSRF protection on unsafe API methods, and random session tokens.
- Profile page redesigned as a social sports profile with settings behind the Settings button.
- Admin and organizer entry points from the profile page and bottom navigation paths.
- Gemini-powered AI profile enrichment through `/api/ai/profile`, with a local fallback when the key/network is unavailable.
- PostgreSQL/PostGIS migration SQL, Kubernetes PostgreSQL StatefulSet, readiness checks, and a PowerShell migration helper.
- Cloudflare Tunnel Kubernetes deployment using a remotely managed tunnel token.
- MCP Toolbox for Databases config for optional read-only PostgreSQL inspection.

## Local Windows Demo

Install dependencies:

```powershell
npm install
```

The ignored `.env.local` has been generated from the provided TXT file for Google Maps, Gemini, and Cloudflare IDs. It intentionally does not include a Cloudflare tunnel token because the attached TXT did not contain a connector token.

Start the app:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## Local Windows Container Demo

Use this path if Cloudflare DNS or the macOS server is not reliable enough for the presentation:

```powershell
npm run container:up
```

Then open:

```text
http://localhost:3000
```

This runs the production web server, background worker, PostgreSQL/PostGIS, Redis, and a one-shot database migration job on this Windows device. The detailed handoff is in `LOCAL_WINDOWS_CONTAINER_RUNBOOK.md`.

Use these seed accounts:

```text
mara@example.com       Showup2026!
organizer@example.com  Showup2026!
admin@example.com      Showup2026!
```

Create a new account at:

```text
http://localhost:3000/register
```

Demo sequence:

1. Home page: show the real Google map and event cards.
2. Click a map/event card, then close the event panel with X.
3. Go to Profile, click Settings, edit profile preferences, and save.
4. Go to Matching, click Update AI, then Run.
5. Log in as `organizer@example.com` and open `/organizer`.
6. Log in as `admin@example.com` and open `/admin`.

## Cloudflare Domain And Tunnel

If you do not have a domain for this exact project, use the unused GoDaddy domain.

1. Add the GoDaddy domain to Cloudflare as a website/zone.
2. In GoDaddy, replace the domain nameservers with the two Cloudflare nameservers shown by Cloudflare.
3. Wait for Cloudflare to mark the zone active.
4. In Cloudflare Zero Trust, open Networks > Connectors > Cloudflare Tunnels.
5. Use the existing `ShowUp2Move_tunnel` if it is already created.
6. Add a public hostname:
   - Subdomain: `showup2move` or `app`
   - Domain: your GoDaddy domain after it is active in Cloudflare
   - Path: leave empty
   - Service type for local Windows dev: `HTTP`
   - Service URL for local Windows dev: `localhost:3000`
   - Service type for Kubernetes: `HTTP`
   - Service URL for Kubernetes cloudflared: `showup2move-web.showup2move.svc.cluster.local:3000`
7. Copy the tunnel connector token from the Cloudflare install command. It is the long `eyJ...` value.

For API token selection: you usually do not need a Cloudflare API token for the dashboard flow. If you want automation, create a custom account token with Cloudflare Tunnel write/connectors write permission. If you only need DNS automation, the "Edit zone DNS" template scoped to the one domain is enough.

Official references:

- [Cloudflare Kubernetes tunnel guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/deployment-guides/kubernetes/)
- [Cloudflare tunnel token permissions](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/remote-tunnel-permissions/)

## Kubernetes Demo

Create the namespace:

```powershell
kubectl create namespace showup2move --dry-run=client -o yaml | kubectl apply -f -
```

Create the secret. Replace every placeholder, especially `CLOUDFLARE_TUNNEL_TOKEN`.

```powershell
kubectl create secret generic showup2move-secrets `
  --namespace showup2move `
  --from-literal=DATABASE_URL="postgresql://showup2move:<postgres-password>@postgres:5432/showup2move" `
  --from-literal=POSTGRES_PASSWORD="<postgres-password>" `
  --from-literal=TOOLBOX_POSTGRES_USER="showup2move" `
  --from-literal=REDIS_URL="redis://redis:6379" `
  --from-literal=AUTH_SECRET="<32-byte-random-secret>" `
  --from-literal=NEXT_PUBLIC_MAP_PROVIDER_KEY="<google-maps-key>" `
  --from-literal=NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="<google-maps-key>" `
  --from-literal=AI_PROVIDER_API_KEY="<gemini-key>" `
  --from-literal=GOOGLE_AI_API_KEY="<gemini-key>" `
  --from-literal=GOOGLE_AI_MODEL="gemini-2.0-flash" `
  --from-literal=CLOUDFLARE_ACCOUNT_ID="<cloudflare-account-id>" `
  --from-literal=CLOUDFLARE_TUNNEL_ID="<cloudflare-tunnel-id>" `
  --from-literal=CLOUDFLARE_TUNNEL_TOKEN="<cloudflare-tunnel-token>" `
  --dry-run=client -o yaml | kubectl apply -f -
```

Build or load the app image, then apply Kubernetes:

```powershell
docker build -f infra/docker/web.Dockerfile -t showup2move-web:local .
kubectl apply -k infra/k8s/overlays/local
kubectl rollout status deployment/showup2move-web -n showup2move
kubectl rollout status deployment/showup2move-worker -n showup2move
kubectl rollout status deployment/cloudflared -n showup2move
```

Apply database schema and sports seed data:

```powershell
.\infra\scripts\apply-db-migrations.ps1
```

Check readiness:

```powershell
kubectl get pods -n showup2move
kubectl port-forward svc/showup2move-web 3000:3000 -n showup2move
```

Then open:

```text
http://localhost:3000/api/health/ready
```

## PostgreSQL And MCP Toolbox

There is a `tools.yaml` file for MCP Toolbox for Databases:

```text
infra/mcp/toolbox/tools.yaml
```

It is also embedded into:

```text
infra/k8s/base/toolbox-configmap.yaml
```

The app does not need MCP Toolbox to run. It is useful if judges ask how an assistant can safely inspect the database. It exposes a read-only `readonly_admin` toolset for aggregate counts, recent events, users by email fragment, event messages, and audit logs.

To inspect it inside the cluster:

```powershell
kubectl rollout status deployment/showup2move-toolbox -n showup2move
kubectl port-forward svc/showup2move-toolbox 5000:5000 -n showup2move
```

## Presentation Talking Points

- "The app can run as a local demo without external infrastructure, but the same repo includes Kubernetes manifests for web, worker, PostgreSQL/PostGIS, Redis, Cloudflare Tunnel, and optional MCP database tooling."
- "The map is now a real Google Maps view, not a styled placeholder."
- "AI enrichment is server-side only. The Gemini key stays in environment variables and never ships to the browser."
- "Cloudflare Tunnel lets us expose the Kubernetes service without opening inbound ports on the host."
- "The database schema is ready for PostgreSQL/PostGIS. The current hackathon UI still uses a seeded in-memory store for fast demos, with readiness checks and migrations prepared for the cluster."

## Useful Docs

- [Google Maps JavaScript API loading](https://developers.google.com/maps/documentation/javascript/load-maps-js-api)
- [Gemini API reference](https://ai.google.dev/api)
- [Cloudflare Tunnel Kubernetes guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/deployment-guides/kubernetes/)
