# Ingestion Service

Serviço Go responsável por ingestão de dados externos e cache de cotações.

## Como rodar

```bash
cd ingestion-service
go run main.go
```

## Endpoints iniciais

- GET /health -> status do serviço
- GET /api/ingestion/ping -> teste de conectividade

Ajuste a lógica de ingestão em main.go e adicione novos pacotes conforme precisar.
