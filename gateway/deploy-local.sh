#!/bin/bash

# Script de deploy local do gateway no Kubernetes
# Uso: ./deploy-local.sh

set -e

NAMESPACE="gateway-ns"
IMAGE_NAME="gateway"
IMAGE_TAG="latest"

echo "🚀 Iniciando deploy local do gateway..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker primeiro."
    exit 1
fi

# Verificar se kubectl está configurado
if ! kubectl cluster-info > /dev/null 2>&1; then
    echo "❌ kubectl não consegue conectar ao cluster Kubernetes."
    exit 1
fi

# Navegar para o diretório do gateway
cd "$(dirname "$0")"

echo "📦 1. Construindo imagem Docker..."
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

if [ $? -ne 0 ]; then
    echo "❌ Falha ao construir imagem Docker"
    exit 1
fi

echo "✅ Imagem construída com sucesso: ${IMAGE_NAME}:${IMAGE_TAG}"

# Verificar se está usando Kind
if kind get clusters 2>/dev/null | grep -q .; then
    echo "🔗 2. Carregando imagem no cluster Kind..."
    CLUSTER_NAME=$(kind get clusters | head -1)
    kind load docker-image ${IMAGE_NAME}:${IMAGE_TAG} --name ${CLUSTER_NAME}
    echo "✅ Imagem carregada no cluster Kind: ${CLUSTER_NAME}"
fi

echo "📝 3. Criando namespace (se necessário)..."
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

echo "🚀 4. Aplicando manifests no Kubernetes..."
kubectl apply -f k8s/deployment.yaml

echo "⏳ 5. Aguardando deployment ficar pronto..."
kubectl rollout status deployment/gateway -n ${NAMESPACE} --timeout=300s

echo "📋 6. Status do deployment:"
kubectl get pods -n ${NAMESPACE} -l app=gateway

echo ""
echo "✅ Deploy concluído com sucesso!"
echo "O gateway está interno e acessível pelo nome 'gateway' na porta 8080."
echo ""
echo "🔍 Comandos úteis:"
echo "   - Ver logs: kubectl logs -f deployment/gateway -n ${NAMESPACE}"
echo "   - Ver pods: kubectl get pods -n ${NAMESPACE}"
echo "   - Remover: kubectl delete -f k8s/deployment.yaml"
