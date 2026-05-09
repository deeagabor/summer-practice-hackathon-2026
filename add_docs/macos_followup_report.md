# macOS Follow-up Report

Final continuation notes were added in `macos_final_followup_report.md`. Use that file together with `FINAL_PRESENTATION_RUNBOOK.md` for the current Cloudflare, database, and judge-demo steps.

This Windows 11 environment can build and verify the app locally, but the following items require the macOS server or its Kubernetes context.

## macOS-only or macOS-server-bound Tasks

1. Install and verify the macOS Kubernetes runtime.
2. Build or pull the production image on the macOS host.
3. Create real Kubernetes secrets from `.env.example`.
4. Apply `infra/k8s/overlays/local` or a production overlay.
5. Configure ingress and Cloudflare Tunnel with a real DNS name.
6. Validate public HTTPS access from an external network.
7. Run the self-healing demo by deleting a web pod and watching Kubernetes recreate it.
8. Confirm persistent storage behavior for the PostgreSQL StatefulSet.
9. If database-agent workflows are needed, validate the optional MCP Toolbox service against PostgreSQL.

## Suggested macOS Commands

```bash
docker build -f infra/docker/web.Dockerfile -t showup2move-web:local .
kubectl create namespace showup2move --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret generic showup2move-secrets \
  --namespace showup2move \
  --from-literal=DATABASE_URL="postgresql://showup2move:<password>@postgres:5432/showup2move" \
  --from-literal=POSTGRES_PASSWORD="<password>" \
  --from-literal=REDIS_URL="redis://redis:6379" \
  --from-literal=AUTH_SECRET="<32-byte-secret>" \
  --from-literal=NEXT_PUBLIC_MAP_PROVIDER_KEY="<map-key>" \
  --from-literal=CLOUDFLARE_TUNNEL_TOKEN="<token>"
kubectl apply -k infra/k8s/overlays/local
kubectl rollout status deployment/showup2move-web -n showup2move
kubectl get pods -n showup2move
```

## Optional MCP Toolbox Check

The optional MCP Toolbox configuration lives at:

```text
infra/mcp/toolbox/tools.yaml
```

It is mounted into the Kubernetes `showup2move-toolbox` deployment through `infra/k8s/base/toolbox-configmap.yaml`. It is intentionally limited to read-only diagnostic/admin tools.

After deployment:

```bash
kubectl rollout status deployment/showup2move-toolbox -n showup2move
kubectl port-forward svc/showup2move-toolbox 5000:5000 -n showup2move
```

Then point an MCP-compatible client at the forwarded Toolbox server and load the `readonly_admin` toolset.

## Self-healing Check

```bash
WEB_POD="$(kubectl get pod -n showup2move -l app=showup2move-web -o jsonpath='{.items[0].metadata.name}')"
kubectl delete pod "$WEB_POD" -n showup2move
kubectl rollout status deployment/showup2move-web -n showup2move
kubectl get pods -n showup2move -l app=showup2move-web
```

Expected result: one pod terminates, Kubernetes creates a replacement, readiness eventually returns to healthy, and the public URL keeps serving through the remaining replica.

## Notes

- Do not commit real Kubernetes secrets.
- Replace `showup2move.example.com` in `infra/k8s/base/configmap.yaml` and `infra/k8s/base/ingress.yaml`.
- The current app uses a seeded in-memory store for local demo flow. Wire route services to PostgreSQL before real multi-user production testing.
