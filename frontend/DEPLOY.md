# Deploy do Frontend - CI/CD

Este documento descreve como fazer deploy do frontend usando diferentes métodos.

## Estrutura de Arquivos

```
frontend/
├── Dockerfile              # Imagem Docker multi-stage
├── docker-compose.yml      # Para desenvolvimento local com Docker
├── next.config.ts          # Configurado com output: 'standalone'
├── k8s/
│   ├── deployment.yaml     # Deployment + Service + Namespace
│   └── ingress.yaml        # Ingress + NodePort Service
├── .github/
│   └── workflows/
│       └── ci-cd.yml       # GitHub Actions workflow
└── deploy-local.sh         # Script de deploy local
```

## Método 1: Deploy Local com Script (Recomendado)

```bash
# Navegue até o diretório frontend
cd frontend

# Execute o script de deploy
./deploy-local.sh
```

O script irá automaticamente:
1. Verificar se Docker e kubectl estão configurados
2. Construir a imagem Docker
3. Carregar a imagem no cluster Kind (se estiver usando)
4. Criar o namespace `frontend-ns`
5. Aplicar os manifests no Kubernetes
6. Aguardar o deployment ficar pronto

O script irá:
1. Verificar se Docker e kubectl estão configurados
2. Construir a imagem Docker
3. Carregar a imagem no cluster Kind (se estiver usando)
4. Aplicar os manifests no Kubernetes
5. Aguardar o deployment ficar pronto
6. Expor o serviço

## Método 2: Deploy Manual

```bash
# 1. Construir a imagem
docker build -t frontend:latest .

# 2. Carregar no cluster Kind (se estiver usando)
kind load docker-image frontend:latest --name invest-cluster

# 3. Criar namespace
kubectl create namespace frontend-ns

# 4. Aplicar manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/ingress.yaml

# 5. Fazer port-forward para acessar
kubectl port-forward -n frontend-ns svc/frontend 3000:80
```

## Método 3: Docker Compose (Apenas Desenvolvimento)

```bash
# Construir e rodar com Docker Compose
docker-compose up --build

# Parar
docker-compose down
```

## Método 4: GitHub Actions (CI/CD Automático)

O workflow `.github/workflows/ci-cd.yml` é acionado automaticamente ao fazer push na branch `main` ou `master`.

### O que o workflow faz:

1. **Test**: Roda lint, testes e build
2. **Build and Push**: Constrói a imagem Docker e salva como artifact
3. **Deploy Local**: Faz deploy no Kubernetes local

### Configuração Necessária:

Para deploy automático, você precisa configurar:
- Um cluster Kubernetes local rodando (Kind, K3d, Minikube)
- `kubectl` configurado para conectar ao cluster
- (Opcional) `KUBECONFIG` como secret no GitHub

## Acessando a Aplicação

Após o deploy, acesse:

```
http://localhost:30081   # Via NodePort (recomendado)
http://localhost:3000    # Via port-forward
```

Ou via port-forward:

```bash
kubectl port-forward -n frontend-ns svc/frontend 3000:80
```

## Verificando o Status

```bash
# Ver pods
kubectl get pods -n frontend-ns -l app=frontend

# Ver logs
kubectl logs -f deployment/frontend -n frontend-ns

# Ver serviço
kubectl get svc -n frontend-ns

# Ver deployment
kubectl get deployment -n frontend-ns

# Ver ingress
kubectl get ingress -n frontend-ns
```

## Removendo o Deploy

```bash
kubectl delete -f k8s/deployment.yaml -f k8s/ingress.yaml
# Ou remover o namespace inteiro:
kubectl delete namespace frontend-ns
```

## Namespace

O frontend é deployado no namespace `frontend-ns` para isolamento.

## Variáveis de Ambiente

A aplicação usa as seguintes variáveis:

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| `NODE_ENV` | Ambiente da aplicação | `production` |
| `NEXT_PUBLIC_API_BASE_URL` | URL base da API | `http://gateway:8080` |

## Troubleshooting

### Erro: "Docker não está rodando"
- Inicie o Docker Desktop ou serviço Docker

### Erro: "kubectl não consegue conectar"
- Verifique se seu cluster local está rodando
- Execute `kubectl cluster-info` para testar

### Erro no build: "Cannot find module"
- Execute `npm install` no diretório frontend
- Verifique se `package-lock.json` está atualizado

### Pod não inicia (CrashLoopBackOff)
- Verifique os logs: `kubectl logs deployment/frontend`
- Verifique se a API está acessível no endereço configurado