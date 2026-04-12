#!/bin/bash

set -e

echo "🚀 Iniciando Setup ZERO TO HERO da Infraestrutura..."

# ==========================================
# FASE 0: INSTALAÇÕES BASE DO SISTEMA
# ==========================================
install_base_tools() {
    echo "🛠️ Instalando dependências básicas..."
    sudo apt-get update
    sudo apt-get install -y curl wget git apt-transport-https ca-certificates software-properties-common
    
    echo "🐳 Instalando Docker..."
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        echo "⚠️  IMPORTANTE: O Docker foi instalado. Talvez você precise sair do terminal e entrar de novo para usar o Docker sem 'sudo'."
    else
        echo "✅ Docker já está instalado!"
    fi

    echo "☸️ Instalando Kubectl (Cliente Kubernetes)..."
    if ! command -v kubectl &> /dev/null; then
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
        sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
        rm kubectl
    else
        echo "✅ Kubectl já instalado!"
    fi

    echo "📦 Instalando Helm (Gerenciador de Pacotes K8s)..."
    if ! command -v helm &> /dev/null; then
        curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
    else
        echo "✅ Helm já instalado!"
    fi

    echo "🐶 Instalando Kind (Kubernetes in Docker)..."
    if ! command -v kind &> /dev/null; then
        [ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.22.0/kind-linux-amd64
        chmod +x ./kind
        sudo mv ./kind /usr/local/bin/kind
    else
        echo "✅ Kind já instalado!"
    fi
}

create_cluster() {
    echo "⚙️ Criando o Cluster Kubernetes com Kind..."
    # Verifica se o cluster já existe
    if kind get clusters | grep -q "invest-cluster"; then
        echo "✅ Cluster 'invest-cluster' já existe!"
    else
        # Configuração para o Kind aceitar o Ingress Controller depois
        cat <<EOF > kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
        kind create cluster --name invest-cluster --config kind-config.yaml
        rm kind-config.yaml
        echo "✅ Cluster criado com sucesso!"
    fi
}

# ==========================================
# FASE 1: NAMESPACES
# ==========================================
setup_namespaces() {
    echo "🗂️ Criando Namespaces (application, monitoring, argocd)..."
    kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: application
---
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
---
apiVersion: v1
kind: Namespace
metadata:
  name: argocd
EOF
    echo "✅ Namespaces criados!"
}

# ==========================================
# FASE 2: NGINX INGRESS CONTROLLER
# ==========================================
setup_ingress() {
    echo "🌐 Instalando NGINX Ingress Controller (Versão para Kind)..."
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
    echo "⏳ Aguardando o Ingress ficar pronto (isso pode demorar uns 2 minutos)..."
    kubectl wait --namespace ingress-nginx \
      --for=condition=ready pod \
      --selector=app.kubernetes.io/component=controller \
      --timeout=180s
    echo "✅ NGINX Ingress instalado e rodando!"
}

setup_monitoring() {
    echo "📈 Instalando Prometheus e Grafana via kube-prometheus-stack..."
    if ! helm repo list | grep -q '^prometheus-community'; then
        helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    fi
    helm repo update

    if helm status prometheus -n monitoring &> /dev/null; then
        echo "✅ kube-prometheus-stack já está instalado!"
    else
        helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
            -n monitoring \
            --wait --timeout 300s
        echo "✅ Prometheus e Grafana instalados com sucesso!"
    fi
}

# ==========================================
# MENU DE EXECUÇÃO
# ==========================================
if [ "$1" == "all" ]; then
    install_base_tools
    create_cluster
    setup_namespaces
    setup_ingress
    setup_monitoring
    echo "🎉 Infraestrutura base criada com sucesso!"
else
    echo "O que deseja fazer?"
    echo "0) Preparar Servidor (Instalar Docker, Kubectl, Helm, Kind)"
    echo "1) Criar Cluster K8s"
    echo "2) Configurar K8s (Namespaces e Ingress)"
    echo "3) Instalar Monitoring (Prometheus + Grafana)"
    echo "4) Rodar TUDO"
    read -p "Opção: " opcao

    case $opcao in
        0) install_base_tools ;;
        1) create_cluster ;;
        2) setup_namespaces; setup_ingress ;;
        3) setup_monitoring ;;
        4) install_base_tools; create_cluster; setup_namespaces; setup_ingress; setup_monitoring ;;
        *) echo "Opção inválida" ;;
    esac
fi