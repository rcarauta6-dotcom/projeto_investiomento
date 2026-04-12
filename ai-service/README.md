# AI Service

Serviço Python Flask responsável por APIs de IA, RAG e recomendação.

## Como rodar

```bash
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python src/app.py
```

## Endpoints iniciais

- GET /health -> status do serviço
- GET /api/ai/ping -> teste de conectividade
- POST /api/ai/recommend -> retorna recomendações simuladas

Exemplo de request:

```bash
curl -X POST http://localhost:8083/api/ai/recommend \
  -H 'Content-Type: application/json' \
  -d '{"query":"ações"}'
```
