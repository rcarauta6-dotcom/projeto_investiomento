#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${1:-postgresql}"
RELEASE_NAME="${2:-pg-db}"
PGADMIN_RELEASE_NAME="${3:-pgadmin}"

command -v helm >/dev/null 2>&1 || {
  echo "Erro: helm não encontrado. Instale o Helm antes de rodar este script."
  exit 1
}

helm uninstall "$PGADMIN_RELEASE_NAME" --namespace "$NAMESPACE" || true
helm uninstall "$RELEASE_NAME" --namespace "$NAMESPACE" || true

kubectl delete namespace "$NAMESPACE" --ignore-not-found

echo "PostgreSQL desinstalado de '$NAMESPACE' e namespace removido."