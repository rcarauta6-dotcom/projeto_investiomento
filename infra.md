# 🌐 Infraestrutura, Observabilidade e CI/CD (Fase 2)

Este documento detalha a infraestrutura de suporte, o pipeline de entrega contínua e a stack de monitoramento necessária para manter o sistema de investimentos estável e escalável em produção.

## 🛠️ Stack de Infraestrutura e Operações

*   **Orquestrador:** Kubernetes (K8s) gerenciado (EKS, GKE ou DigitalOcean K8s).
*   **CI/CD:** GitHub Actions + ArgoCD (GitOps).
*   **Logs:** Grafana Loki + Promtail (Mais leve e integrado ao K8s que o ELK).
*   **Métricas:** Prometheus + Grafana (Dashboards de CPU, Memória e Performance).
*   **Tracing (Rastreamento):** OpenTelemetry + Jaeger (Para ver o caminho de uma requisição entre os microsserviços).
*   **Segurança:** Kubernetes Secrets ou HashiCorp Vault.

---

## 📊 Diagrama de Infraestrutura e Observabilidade

```mermaid
flowchart TD
    %% Fluxo de Desenvolvimento (CI/CD)
    Dev[Desenvolvedor] -->|Git Push| GH[GitHub Actions]
    GH -->|Build Docker Image| Registry[Docker Hub / GHCR]
    GH -->|Update Manifests| ArgoCD[ArgoCD / GitOps]
    ArgoCD -->|Sincroniza Estado| K8s
    Registry -.->|Pull Image| K8s

    %% Cluster Kubernetes
    subgraph K8s [Kubernetes Cluster]
        
        subgraph AppNS [Namespace: Application]
            Pods[Microsserviços\nJava, Go, Python]
            Sidecar[OTel Collector\nSidecar]
        end

        subgraph MonitorNS [Namespace: Monitoring & Ops]
            Prom[Prometheus\nColeta Métricas]
            Loki[Grafana Loki\nArmazena Logs]
            Tempo[Jaeger / Tempo\nTraces de Requisição]
            Grafana{Grafana\nVisualização}
        end
        
        Ingress[NGINX Ingress]
        Secrets[K8s Secrets\nSenhas e Chaves API]
    end

    %% Fluxo de Dados de Observabilidade
    Pods -->|Métricas| Prom
    Pods -->|Logs via Promtail| Loki
    Pods -->|Traces| Sidecar
    Sidecar -->|Exporta| Tempo
    
    %% Visualização
    Prom --> Grafana
    Loki --> Grafana
    Tempo --> Grafana
    Admin([SRE / Admin]) -->|Acessa Dashboards| Grafana

    %% Estilização
    classDef cicd fill:#f1c40f,stroke:#f39c12,color:#000;
    classDef k8s fill:#3498db,stroke:#2980b9,color:#fff;
    classDef obs fill:#9b59b6,stroke:#8e44ad,color:#fff;
    
    class GH,Registry,ArgoCD cicd;
    class Pods,Ingress,Secrets k8s;
    class Prom,Loki,Tempo,Grafana,Sidecar obs;