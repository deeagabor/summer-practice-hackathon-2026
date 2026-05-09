# macOS Final Follow-up Report

This Windows pass completed the code and documentation changes that can be done locally. The remaining tasks are bound to the macOS server because that machine owns the Kubernetes runtime, container image availability, and external tunnel validation.

## Must Continue On macOS

1. Confirm the Cloudflare-managed GoDaddy domain is active in Cloudflare DNS.
2. Copy the real Cloudflare tunnel connector token from the Zero Trust tunnel install command.
3. Recreate the `showup2move-secrets` Kubernetes secret with the real tunnel token, Google Maps key, Gemini key, database password, and auth secret.
4. Build/load the app image into the macOS Kubernetes runtime.
5. Apply `infra/k8s/overlays/local`.
6. Run `infra/scripts/apply-db-migrations.ps1` from PowerShell or translate the two `kubectl exec -i ... psql` commands to zsh.
7. Validate the public Cloudflare hostname from outside the local network.
8. Run the self-healing proof by deleting one web pod and watching the deployment recreate it.

## Suggested macOS/zsh Commands

```bash
docker build -f infra/docker/web.Dockerfile -t showup2move-web:local .
kubectl create namespace showup2move --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -k infra/k8s/overlays/local
kubectl rollout status deployment/showup2move-web -n showup2move
kubectl rollout status deployment/showup2move-worker -n showup2move
kubectl rollout status deployment/cloudflared -n showup2move
kubectl get pods -n showup2move
```

For database migration from zsh:

```bash
POD="$(kubectl -n showup2move get pod -l app=postgres -o jsonpath='{.items[0].metadata.name}')"
kubectl -n showup2move exec -i "$POD" -- psql -U showup2move -d showup2move -v ON_ERROR_STOP=1 < packages/database/migrations/001_initial_schema.sql
kubectl -n showup2move exec -i "$POD" -- psql -U showup2move -d showup2move -v ON_ERROR_STOP=1 < packages/database/seed/001_sports.sql
```

## Cloudflare Public Hostname

If `cloudflared` runs inside Kubernetes, the published application route should point to:

```text
http://showup2move-web.showup2move.svc.cluster.local:3000
```

If `cloudflared` runs directly on the macOS host while `npm run dev` is running, use:

```text
http://localhost:3000
```

Use HTTP for the origin service unless the local origin itself serves TLS. Cloudflare will still provide HTTPS to users at the public hostname.

## Handoff Documents

- `walkthrough_server_side.md`: what was completed earlier on the macOS/server-side pass.
- `macos_followup_report.md`: original macOS Kubernetes continuation checklist.
- `macos_final_followup_report.md`: this updated final checklist.
- `FINAL_PRESENTATION_RUNBOOK.md`: judge-facing run and demo tutorial.

## Notes

- Do not commit `.env.local` or any real Kubernetes secret manifest.
- The tunnel token is not the same as a general Cloudflare API token.
- `infra/mcp/toolbox/tools.yaml` exists and is optional read-only database tooling for MCP Toolbox. It is not required for the app to serve traffic.
