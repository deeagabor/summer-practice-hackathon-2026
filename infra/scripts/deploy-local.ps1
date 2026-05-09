param(
  [string]$Image = "showup2move-web:local"
)

docker build -f infra/docker/web.Dockerfile -t $Image .
kubectl apply -k infra/k8s/overlays/local
kubectl rollout status deployment/showup2move-web -n showup2move
