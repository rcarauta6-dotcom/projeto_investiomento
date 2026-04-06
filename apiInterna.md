# 📖 Documentação das APIs (API Contracts)

Este documento define os contratos de comunicação entre o Frontend (React) e os Microsserviços do Backend. 

**Gateway Base URL:** `https://api.seusistema.com.br`
**Autenticação:** Todas as rotas `/api/v1/` exigem o envio do header: 
`Authorization: Bearer <JWT_TOKEN>`

---

## 🟢 1. Core & Portfolio Service (Java / Spring Boot)
*Responsável pela persistência e gestão da carteira do usuário.*

### Obter Posição Atual da Carteira
*   **Método:** `GET`
*   **Rota:** `/api/v1/portfolio`
*   **Descrição:** Retorna todos os ativos que o usuário possui consolidados.
*   **Response (200 OK):**
    ```json
    [
      { "ticker": "PETR4", "quantidade": 100, "preco_medio": 32.50 },
      { "ticker": "Tesouro Selic 2026", "quantidade": 1, "preco_medio": 14500.00 }
    ]
    ```

### Resumo do Patrimônio
*   **Método:** `GET`
*   **Rota:** `/api/v1/portfolio/summary`
*   **Descrição:** Retorna o patrimônio total e a distribuição de risco.
*   **Response (200 OK):**
    ```json
    {
      "patrimonio_total": 17750.00,
      "rentabilidade_mes_percentual": 1.2,
      "distribuicao": { "renda_variavel": 18.3, "renda_fixa": 81.7 }
    }
    ```

### Registrar Nova Transação (Compra/Venda)
*   **Método:** `POST`
*   **Rota:** `/api/v1/portfolio/transactions`
*   **Request Body:**
    ```json
    {
      "ativo": "WEGE3",
      "tipo": "COMPRA",
      "quantidade": 50,
      "preco_unitario": 38.90,
      "data_operacao": "2023-10-25"
    }
    ```

### Editar e Excluir Transação
*   **Método:** `PUT` / `DELETE`
*   **Rota:** `/api/v1/portfolio/transactions/{transaction_id}`

---

## 🔵 2. Market Data Service (Go Lang)
*Responsável por buscar cotações, dados macroeconômicos e balanços (Alta performance via Redis).*

### Consultar Cotação em Tempo Real
*   **Método:** `GET`
*   **Rota:** `/api/v1/market/stocks/{ticker}`
*   **Descrição:** Lê do Redis a cotação atual.
*   **Response (200 OK):**
    ```json
    { "ticker": "PETR4", "preco_atual": 35.80, "variacao_diaria": "+1.5%" }
    ```

### Consultar Histórico (Para Gráficos)
*   **Método:** `GET`
*   **Rota:** `/api/v1/market/stocks/{ticker}/history?period=1Y`

### Consultar Fundamentos e Balanços
*   **Método:** `GET`
*   **Rota:** `/api/v1/market/companies/{ticker}/fundamentals`
*   **Response (200 OK):**
    ```json
    { "P_L": 6.5, "ROE": "25.4%", "dividend_yield": "18.2%" }
    ```

### Consultar Taxas Macro (Renda Fixa)
*   **Método:** `GET`
*   **Rota:** `/api/v1/market/fixed-income/rates`
*   **Response (200 OK):**
    ```json
    { "selic": 11.25, "cdi": 11.15, "ipca_12m": 4.5 }
    ```

### Comparador Matemático de Ativos
*   **Método:** `GET`
*   **Rota:** `/api/v1/market/compare?assets=PETR4,VALE3,CDI`
*   **Descrição:** Retorna a performance histórica comparativa dos ativos enviados via Query Params.

---

## 🟣 3. AI & RAG Service (Python / FastAPI)
*Motor de Inteligência Artificial para análises textuais, chat e alertas preditivos.*

### Chat Interativo com a IA (RAG)
*   **Método:** `POST`
*   **Rota:** `/api/v1/ai/chat`
*   **Descrição:** Envia uma pergunta. O backend pesquisa o contexto no banco vetorial e consulta a LLM (Grok).
*   **Request Body:**
    ```json
    { "prompt": "Com a alta do IPCA, devo manter minhas ações de varejo?" }
    ```
*   **Response (200 OK):**
    ```json
    { 
      "resposta_llm": "Considerando o IPCA em 4.5% e os relatórios recentes do setor de varejo presentes no nosso banco de dados...",
      "fontes_utilizadas": ["Relatório Focus Central 24/10", "Balanço MGLU3 3T23"]
    }
    ```

### Analisar Carteira Completa (Botão "Review Portfolio")
*   **Método:** `POST`
*   **Rota:** `/api/v1/ai/recommend/portfolio`
*   **Descrição:** A IA acessa o serviço Java internamente, lê o portfólio e devolve recomendações táticas.

---

## 🟠 4. Comunicação Proativa e Assíncrona (WebSockets)
*Conexão persistente para receber notificações push baseadas em eventos do mercado detectados pela IA.*

*   **Protocolo:** `WebSocket (WS/WSS)`
*   **Rota:** `/ws/v1/ai/insights`
*   **Comportamento:** O Frontend abre a conexão no momento do login e fica escutando. O Backend Python empurra mensagens proativamente.
*   **Exemplo de Payload recebido pelo Frontend (Event Driven):**
    ```json
    {
      "tipo_alerta": "RISCO_MERCADO",
      "urgencia": "MEDIA",
      "titulo": "Mudança na Taxa Selic detectada",
      "mensagem": "💡 Insight da IA: A Selic acaba de subir para 11.25%. Como você possui 30% da carteira em Fundos Imobiliários de Tijolo, eles podem sofrer no curto prazo. Deseja ver opções de Renda Fixa atreladas ao CDI?",
      "acao_sugerida": "/dashboard/renda-fixa"
    }
    ```