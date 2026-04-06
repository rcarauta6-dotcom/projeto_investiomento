# 🏛️ Arquitetura do Sistema de Recomendação de Investimentos (IA + RAG)

Este documento descreve a arquitetura baseada em microsserviços do sistema de investimentos, utilizando a stack tecnológica definida para alta performance, RAG, integração com LLM e orquestração moderna.

## 🛠️ Stack Tecnológica Definitiva

*   **Frontend:** React (Next.js) + TailwindCSS
*   **Containerização & Orquestração:** Docker (Criação das imagens) + Kubernetes (Gerenciamento de Pods, Escalabilidade e Self-healing)
*   **API Gateway:** Spring Cloud Gateway (Roteamento e validação de JWT)
*   **Core Microservice:** Java + Spring Boot 3 (GraalVM Native Image)
*   **Data Ingestion Service:** Go (Golang)
*   **AI & RAG Service:** Python + LangChain integrado à LLM **Grok**
*   **Mensageria:** Apache Kafka
*   **Cache (Cotações Temporárias):** Redis
*   **Bancos de Dados:** PostgreSQL (Dados relacionais) + `pgvector` / Qdrant (Bancos Vetoriais)

---

## 📊 Diagrama Arquitetural

*Copie o bloco de código abaixo e cole em [mermaid.live](https://mermaid.live) ou visualize em um editor de Markdown compatível (VS Code, GitHub, Notion).*

```mermaid
flowchart TD
    %% Entidades Externas
    User([Usuário e Investidor])
    Web(Frontend Web\nReact/Next.js + TailwindCSS)
    LLM([LLM Externa Grok])
    ExtAPI([APIs Financeiras\nB3, Yahoo, CVM])
    IdP([Auth0 ou Keycloak])

    %% Infraestrutura Orquestrada
    subgraph K8s [Orquestrador: Kubernetes Cluster]
        
        Ingress[NGINX Ingress\nRecebe tráfego externo]
        
        subgraph DockerPods [Containers Docker e K8s Pods]
            Gateway[Spring Cloud Gateway\nRoteamento e Validação JWT]
            SvcCore[Core e Portfolio Service\nJava e Spring Boot 3 GraalVM]
            SvcIngestion[Data Ingestion Service\nGo Lang]
            SvcAI[AI e RAG Service\nPython com FastAPI]
        end
        
        subgraph Data [Bancos de Dados, Cache e Mensageria]
            DB_Rel[(PostgreSQL\nUsuários e Portfólios)]
            DB_Vec[(Qdrant ou pgvector\nEmbeddings RAG)]
            Cache[(Redis\nCache Cotações em Tempo Real)]
            Kafka{Apache Kafka\nEventos Assíncronos}
        end
    end

    %% Fluxo de Usuário e Segurança
    User <-->|HTTPS| Web
    Web -.->|Autenticação| IdP
    Web <-->|REST e WSS WebSocket| Ingress
    Ingress <--> Gateway

    %% Roteamento do Gateway (REST Padrão)
    Gateway <-->|REST: Rotas de Negócio| SvcCore
    Gateway <-->|REST: Rotas de Cotação| SvcIngestion
    Gateway <-->|REST: Chat e Recomendações| SvcAI

    %% Roteamento WebSocket (Canal Persistente)
    Gateway <==>|WSS: Alertas Proativos da IA| SvcAI

    %% Fluxo do Core (Spring Boot)
    SvcCore <--> DB_Rel

    %% Fluxo de Ingestão de Dados (Go)
    SvcIngestion <-->|Busca rápida| ExtAPI
    SvcIngestion -->|Salva direto no Cache| Cache
    SvcIngestion -- "Publica PDFs, Notícias e Eventos" --> Kafka

    %% Fluxo de IA e RAG (Python)
    Kafka -- "IA escuta eventos do mercado" --> SvcAI
    SvcAI <-->|Grava e Busca Contexto| DB_Vec
    SvcAI <-->|Prompt e Contexto RAG| LLM
    
    %% Comunicação Interna (A IA precisa de dados para responder e gerar alertas)
    SvcAI -.->|Analisa portfólio do usuário| SvcCore
    SvcAI -.->|Pega cotação atual| Cache

    %% Estilização do Diagrama
    classDef frontend fill:#3498db,stroke:#2980b9,color:#fff;
    classDef java fill:#e74c3c,stroke:#c0392b,color:#fff;
    classDef golang fill:#00ADD8,stroke:#008dae,color:#fff;
    classDef python fill:#f39c12,stroke:#d35400,color:#fff;
    classDef db fill:#2ecc71,stroke:#27ae60,color:#fff;
    classDef kafka fill:#34495e,stroke:#2c3e50,color:#fff;
    classDef k8s fill:#f8f9fa,stroke:#3498db,stroke-width:2px,stroke-dasharray: 5 5;
    
    class Web frontend;
    class SvcCore java;
    class SvcIngestion golang;
    class SvcAI python;
    class DB_Rel,DB_Vec,Cache db;
    class Kafka kafka;
    class DockerPods k8s;