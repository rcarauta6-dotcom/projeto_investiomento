# 📡 Dicionário de APIs e Fontes de Dados Externos

Este documento mapeia todas as URLs e endpoints externos que o **Data Ingestion Service (Go)** irá consumir para alimentar o Cache (Redis) e o pipeline de IA (Kafka/RAG).

---

## 1. 📈 Renda Variável (Ações B3, FIIs e IBOVESPA)

Fontes para buscar o preço atual das ações, fechamento diário e listar ativos do mercado financeiro.

### A. Brapi (Melhor opção para B3)
*   **O que traz:** Cotações em tempo real, dividendos, histórico e moedas.
*   **URL Base:** `https://brapi.dev/api`
*   **Endpoints Principais:**
    *   `GET /api/quote/PETR4,VALE3,ITUB4` *(Busca múltiplas ações de uma vez)*
    *   `GET /api/quote/^BVSP` *(Busca a pontuação atual do índice IBOVESPA)*
    *   `GET /api/v2/ticker` *(Lista todos os tickers disponíveis na bolsa brasileira)*
*   **Como usar no Go:** Faça requisições HTTP GET padrão. Formate a URL com múltiplos tickers separados por vírgula para economizar chamadas de rede. O retorno é um JSON direto. Salve os preços no Redis.

### B. Yahoo Finance (Via Endpoint Não-Documentado)
*   **O que traz:** Dados absurdamente completos de mercados globais e BR (terminados em `.SA`).
*   **URL Base:** `https://query1.finance.yahoo.com/v8/finance/chart/`
*   **Endpoints Principais:**
    *   `GET /v8/finance/chart/PETR4.SA?range=1d&interval=1m` *(Gráfico intradiário de 1 minuto)*
    *   `GET /v8/finance/chart/^BVSP` *(Índice Bovespa)*
*   **Como usar no Go:** Não chame a URL na mão. Utilize a biblioteca Go oficial da comunidade: `github.com/piquette/finance-go`. Ela já trata os limites de taxa e formata os dados em structs do Go automaticamente.

### C. HG Brasil Finance
*   **O que traz:** Um resumão instantâneo do mercado (Dólar, Euro, Ibovespa, Bitcoin).
*   **Endpoint Principal:** 
    *   `GET https://api.hgbrasil.com/finance`
*   **Como usar no Go:** Excelente para buscar um JSON leve a cada hora e mostrar os indicadores principais no topo do seu Frontend (Dashboard).

---

## 2. 🏦 Renda Fixa e Macroeconomia

Dados governamentais fundamentais para a LLM comparar com os investimentos privados.

### A. Banco Central do Brasil (SGS)
*   **O que traz:** Histórico e taxas atuais oficiais do Brasil.
*   **URL Base:** `https://api.bcb.gov.br/dados/serie/`
*   **Endpoints Principais:**
    *   `GET /bcdata.sgs.11/dados?formato=json` *(Taxa Selic diária)*
    *   `GET /bcdata.sgs.12/dados?formato=json` *(Taxa CDI diária)*
    *   `GET /bcdata.sgs.433/dados?formato=json` *(IPCA Mensal)*
*   **Como usar no Go:** Requisitar 1 vez por dia. Pegue o último elemento do array JSON retornado (que representa a data mais recente) e salve a variável global de juros para o sistema usar em cálculos.

### B. Tesouro Direto B3
*   **O que traz:** Lista completa dos títulos públicos à venda e suas taxas de rendimento.
*   **Endpoint Principal:**
    *   `GET https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/b3/site/tesouro/api/list/v1/market-data`
*   **Como usar no Go:** Endpoint público. Baixe o JSON 1x ao dia. Filtre as chaves `TrsrBd` (Tesouro Bond) para pegar o nome do título e a `AnulInvstmtRate` (Taxa Anual de Investimento) para usar como comparativo de risco.

---

## 3. 📄 Fundamentos das Empresas (Web Scraping)

Indicadores cruciais (P/L, ROE, Dívida) para a IA determinar se a empresa é saudável.

### A. Fundamentus
*   **O que traz:** Todos os indicadores fundamentalistas de uma empresa.
*   **URL Base:** `https://www.fundamentus.com.br/`
*   **Endpoint Principal:**
    *   `GET /detalhes.php?papel=WEGE3`
*   **Como usar no Go:** O site não retorna JSON, retorna HTML bruto. Use uma biblioteca de Web Scraping em Go (como o `github.com/PuerkitoBio/goquery` ou `gocolly/colly`). O Go fará a leitura das tabelas HTML, extrairá os valores como texto, transformará em Structs e enviará para o banco de dados.

### B. Portal de Dados Abertos CVM
*   **O que traz:** Balanços financeiros puros (Demonstrações Financeiras).
*   **URL Base:** `https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/`
*   **Como usar no Go:** O portal disponibiliza arquivos `.zip` contendo `.csv`. O Go deve fazer o download do `.zip`, descompactar em memória (usando o pacote nativo `archive/zip`), ler o CSV, filtrar pelo CNPJ da empresa desejada e formatar para a Inteligência Artificial analisar.

---

## 4. 📰 Notícias (Alimentação do RAG - Contexto Textual)

A inteligência artificial precisa ler as notícias atuais para saber o "humor" do mercado.

### Feeds RSS Públicos
*   **O que trazem:** Manchetes, links e corpo das notícias publicadas nos últimos minutos.
*   **URLs Principais (Arquivos XML):**
    *   `GET https://www.infomoney.com.br/feed/` *(Geral Infomoney)*
    *   `GET https://br.investing.com/rss/news_25.rss` *(Geral Investing BR)*
*   **Como usar no Go:** Use o pacote nativo do Go `encoding/xml`. Crie um *Cronjob* (Ticker) em Go que roda a cada 30 minutos, baixa o XML, extrai as novas tags `<title>` e `<description>` e dispara a notícia como uma mensagem para o **Apache Kafka**. O serviço em Python lerá do Kafka, criará o embedding e salvará no banco de dados do RAG.