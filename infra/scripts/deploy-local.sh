#!/usr/bin/env bash
set -euo pipefail

IMAGE="${1:-showup2move-web:local}"

echo "🔨 Building Docker image: ${IMAGE}"
docker build -f infra/docker/web.Dockerfile -t "${IMAGE}" .

echo "📦 Applying Kubernetes manifests (local overlay)"
kubectl apply -k infra/k8s/overlays/local

echo "⏳ Waiting for web deployment rollout..."
kubectl rollout status deployment/showup2move-web -n showup2move --timeout=120s

echo "⏳ Waiting for worker deployment rollout..."
kubectl rollout status deployment/showup2move-worker -n showup2move --timeout=120s

echo ""
echo "✅ Deployment complete. Pod status:"
kubectl get pods -n showup2move -o wide
