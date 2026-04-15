#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NAMESPACE="${1:-redis}"
RELEASE_NAME="${2:-redis-db}"
VALUES_FILE="$ROOT_DIR/helm/redis-values.yaml"
HELM_REPO_NAME="bitnami"
HELM_REPO_URL="https://charts.bitnami.com/bitnami"

command -v helm >/dev/null 2>&1 || {
  echo "Erro: helm não encontrado. Instale o Helm antes de rodar este script."
  exit 1
}

command -v kubectl >/dev/null 2>&1 || {
  echo "Erro: kubectl não encontrado. Instale o kubectl antes de rodar este script."
  exit 1
}

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

helm repo add "$HELM_REPO_NAME" "$HELM_REPO_URL" --force-update
helm repo update

if ! helm upgrade --install "$RELEASE_NAME" "$HELM_REPO_NAME/redis" \
  --namespace "$NAMESPACE" \
  -f "$VALUES_FILE" \
  --wait \
  --timeout 10m \
  --atomic; then
  echo "Erro: a instalação do Redis expirou ou falhou."
  echo "Status do Helm:"
  helm status "$RELEASE_NAME" --namespace "$NAMESPACE" || true
  echo
  echo "Pods no namespace $NAMESPACE:"
  kubectl get pods -n "$NAMESPACE" || true
  echo
  echo "Eventos recentes no namespace $NAMESPACE:"
  kubectl get events -n "$NAMESPACE" --sort-by=.metadata.creationTimestamp | tail -20 || true
  echo
  echo "Use 'kubectl describe pod -n $NAMESPACE <pod-name>' para detalhes adicionais."
  exit 1
fi

echo "Redis instalado com release '$RELEASE_NAME' no namespace '$NAMESPACE'."
echo "Use 'kubectl get pods -n $NAMESPACE' para verificar o status."
