#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NAMESPACE="${1:-postgresql}"
RELEASE_NAME="${2:-pg-db}"
VALUES_FILE="$ROOT_DIR/helm/postgresql-values.yaml"

# Configuração do repositório do PostgreSQL (Bitnami)
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

# ==========================================
# INSTALAÇÃO DO POSTGRESQL (Mantida igual)
# ==========================================
if ! helm upgrade --install "$RELEASE_NAME" "$HELM_REPO_NAME/postgresql" \
  --namespace "$NAMESPACE" \
  -f "$VALUES_FILE" \
  --wait \
  --timeout 15m \
  --atomic; then
  echo "Erro: a instalação do PostgreSQL expirou ou falhou."
  exit 1
fi

echo "PostgreSQL instalado com release '$RELEASE_NAME' no namespace '$NAMESPACE'."

# ==========================================
# INSTALAÇÃO DO PGADMIN (Imagem Oficial DockerHub)
# ==========================================
echo "Instalando pgAdmin (Oficial) no mesmo namespace..."

# Credenciais de acesso padrão do pgAdmin (você pode alterar aqui se quiser)
PGADMIN_EMAIL="admin@admin.com"
PGADMIN_PASSWORD="admin"

# Criando o Deployment e o Service do pgAdmin diretamente no Kubernetes
kubectl apply -n "$NAMESPACE" -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pgadmin
  labels:
    app: pgadmin
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pgadmin
  template:
    metadata:
      labels:
        app: pgadmin
    spec:
      containers:
      - name: pgadmin
        image: dpage/pgadmin4:latest
        ports:
        - containerPort: 80
        env:
        - name: PGADMIN_DEFAULT_EMAIL
          value: "${PGADMIN_EMAIL}"
        - name: PGADMIN_DEFAULT_PASSWORD
          value: "${PGADMIN_PASSWORD}"
---
apiVersion: v1
kind: Service
metadata:
  name: pgadmin-service
spec:
  selector:
    app: pgadmin
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
EOF

echo "Aguardando o pgAdmin iniciar (isso pode levar alguns segundos)..."
kubectl rollout status deployment/pgadmin -n "$NAMESPACE" --timeout=5m

echo "==========================================================="
echo "✅ Instalação concluída com sucesso!"
echo "==========================================================="
echo "Para acessar o pgAdmin, rode o comando abaixo no seu terminal:"
echo ""
echo "kubectl port-forward svc/pgadmin-service 8084:80 -n $NAMESPACE"
echo ""
echo "Depois abra no navegador: http://localhost:8084"
echo "Login: $PGADMIN_EMAIL"
echo "Senha: $PGADMIN_PASSWORD"
echo "==========================================================="