#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${1:-redis}"
RELEASE_NAME="${2:-redis-db}"

command -v helm >/dev/null 2>&1 || {
  echo "Erro: helm não encontrado. Instale o Helm antes de rodar este script."
  exit 1
}

helm uninstall "$RELEASE_NAME" --namespace "$NAMESPACE" || true
kubectl delete namespace "$NAMESPACE" --ignore-not-found

echo "Redis desinstalado de '$NAMESPACE' e namespace removido."
