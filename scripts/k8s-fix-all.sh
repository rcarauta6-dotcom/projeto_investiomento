#!/bin/bash
set -e

# Cores para o output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Iniciando SUPER CORREÇÃO de conectividade K8s...${NC}"

# 1. Garantir que os Namespaces existam
for ns in redis meu-kafka-ns core-ns ingestion-ns ai-service-ns gateway-ns frontend-ns; do
    kubectl create namespace $ns --dry-run=client -o yaml | kubectl apply -f -
done

# 2. Configuração de Segredos
echo -e "${GREEN}🔐 Aplicando segredos dos arquivos de manifesto...${NC}"
kubectl apply -f k8s-api-secrets.yaml

# Sincronizar senha real do Redis no ingestion-ns se necessário
REAL_REDIS_PASS=$(kubectl get secret redis-db -n redis -o jsonpath='{.data.redis-password}' | base64 -d 2>/dev/null || echo "mypassword")
kubectl create secret generic api-secrets -n ingestion-ns \
  --from-literal=brapi-token="5rC5iuCFwspVoKf8LqGR1w" \
  --from-literal=redis-password="$REAL_REDIS_PASS" \
  --dry-run=client -o yaml | kubectl apply -f -

# 3. Patch no Serviço Redis (Correção do TargetPort 'redis' para 6379)
echo -e "${GREEN}🛠️  Corrigindo portas do serviço Redis...${NC}"
kubectl patch svc redis-db-master -n redis --type='json' -p='[{"op": "replace", "path": "/spec/ports/0/targetPort", "value": 6379}]' 2>/dev/null || true

# 4. Aplicar os manifestos atualizados
echo -e "${GREEN}📦 Aplicando novos manifestos de Deployment...${NC}"
kubectl apply -f ingestion-service/k8s/deployment.yaml
kubectl apply -f ai-service/k8s/deployment.yaml
kubectl apply -f gateway/k8s/deployment.yaml
kubectl apply -f core-service/k8s/deployment.yaml
kubectl apply -f frontend/k8s/deployment.yaml

# 5. Expor Kafka UI
echo -e "${GREEN}🌐 Expondo Kafka UI na porta 30080...${NC}"
cat <<KAFKA_EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: kafka-ui-external
  namespace: meu-kafka-ns
spec:
  type: NodePort
  ports:
  - port: 8080
    targetPort: 8080
    nodePort: 30080
  selector:
    app: kafka-dev-kafka-ui
KAFKA_EOF

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}✅ CONFIGURAÇÕES APLICADAS!${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "\n${RED}⚠️  AÇÃO REQUERIDA:${NC}"
echo -e "1. Edite o segredo da IA com sua chave real se ainda não o fez:"
echo -e "   kubectl create secret generic api-secrets -n ai-service-ns --from-literal=groq-api-key=\"SUA_CHAVE_AQUI\" --dry-run=client -o yaml | kubectl apply -f -"
echo -e "\n2. Verifique se o Redis agora tem Endpoints:"
echo -e "   kubectl get ep redis-db-master -n redis"
echo -e "\n3. Se o erro de 'dial tcp' persistir, reinicie o Ingestion:"
echo -e "   kubectl rollout restart deployment ingestion-service -n ingestion-ns"
echo -e "\n📊 KAFKA UI: http://$(minikube ip 2>/dev/null || echo 'localhost'):30080"
echo -e "${GREEN}====================================================${NC}"
