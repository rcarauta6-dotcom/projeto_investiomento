# Ingestion Service

Serviço de ingestão de dados de mercado financeiro em Go.

## Configuração de Variáveis de Ambiente

Este serviço utiliza variáveis de ambiente para configuração. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# Redis Configuration
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=your_redis_password_here

# Kafka Configuration
KAFKA_BROKERS=localhost:9092

# BrAPI Token (Brazilian Stock Market API)
# Get your token at https://brapi.dev/
BRAPI_TOKEN=your_brapi_token_here

# Service URLs
AI_SERVICE_URL=http://localhost:8084
CORE_SERVICE_URL=http://localhost:8081

# Server Port (optional)
SERVER_PORT=:8082
```

### Arquivos de Configuração

- `.env` - Arquivo com as variáveis de ambiente (NÃO commitar)
- `.env.example` - Exemplo de arquivo de configuração (pode ser commitado)
- `.gitignore` - Configurado para ignorar o arquivo `.env`

## Como usar

1. Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Edite `.env` com suas credenciais:
```bash
vim .env
```

3. Execute o serviço:
```bash
go run main.go
```

## Endpoints

- `GET /health` - Health check
- `GET /api/ingestion/ping` - Ping
- `GET /api/v1/market/fixed-income/rates` - Taxas SELIC, CDI, IPCA
- `GET /api/v1/market/news` - Notícias de mercado
- `GET /api/v1/market/history?symbol=^BVSP&range=5d&interval=1h` - Histórico de cotações
- `POST /api/v1/market/portfolio/analyze` - Análise de portfólio com IA
- `POST /api/ingestion/ai/chat` - Chat com IA
- `POST /api/quote` - Atualizar cotação
- `GET /api/quotes/cached` - Listar cotações em cache

## Segurança

⚠️ **Nunca commitar o arquivo `.env`** - Ele contém credenciais sensíveis como:
- Senha do Redis
- Token da BrAPI
- URLs de serviços internos

O arquivo `.env` já está listado no `.gitignore` para prevenir commits acidentais.