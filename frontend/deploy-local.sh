#!/bin/bash

# Script de deploy local do frontend no Kubernetes
# Uso: ./deploy-local.sh

set -e

NAMESPACE="frontend-ns"
IMAGE_NAME="frontend"
IMAGE_TAG="latest"

echo "🚀 Iniciando deploy local do frontend..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker primeiro."
    exit 1
fi

# Verificar se kubectl está configurado
if ! kubectl cluster-info > /dev/null 2>&1; then
    echo "❌ kubectl não consegue conectar ao cluster Kubernetes."
    echo "Certifique-se de que seu cluster local (Kind, K3d, Minikube) está rodando."
    exit 1
fi

# Navegar para o diretório do frontend
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
kubectl apply -f k8s/ingress.yaml

echo "⏳ 5. Aguardando deployment ficar pronto..."
kubectl rollout status deployment/frontend -n ${NAMESPACE} --timeout=300s

echo "📋 6. Status do deployment:"
kubectl get pods -n ${NAMESPACE} -l app=frontend

echo "🔌 7. Expondo serviço (se necessário)..."
# Verificar se o serviço já existe
if ! kubectl get service frontend -n ${NAMESPACE} > /dev/null 2>&1; then
    echo "Serviço não encontrado, criando..."
    kubectl expose deployment frontend --port=80 --target-port=3000 --name=frontend -n ${NAMESPACE}
fi

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "📊 Para acessar o frontend:"
echo "   - Via NodePort (recomendado): http://localhost:30081"
echo "   - Via port-forward: kubectl port-forward svc/frontend -n ${NAMESPACE} 3000:80"
echo "   - Acesse: http://localhost:3000"
echo ""
echo "🔍 Comandos úteis:"
echo "   - Ver logs: kubectl logs -f deployment/frontend -n ${NAMESPACE}"
echo "   - Ver pods: kubectl get pods -n ${NAMESPACE}"
echo "   - Ver ingress: kubectl get ingress -n ${NAMESPACE}"
echo "   - Remover: kubectl delete -f k8s/deployment.yaml -f k8s/ingress.yaml"
