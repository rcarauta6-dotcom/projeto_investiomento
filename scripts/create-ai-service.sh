#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_DIR="ai-service"
PROJECT_ROOT="$ROOT_DIR/$PROJECT_DIR"
SRC_DIR="$PROJECT_ROOT/src"

if [ -d "$PROJECT_ROOT" ]; then
  echo "Erro: o diretório '$PROJECT_ROOT' já existe. Remova-o ou escolha outro nome."
  exit 1
fi

mkdir -p "$SRC_DIR"

cat > "$PROJECT_ROOT/requirements.txt" <<'EOF'
Flask==2.3.3
requests==2.31.0
EOF

cat > "$SRC_DIR/app.py" <<'EOF'
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ai-service ok'})

@app.route('/api/ai/ping', methods=['GET'])
def ping():
    return jsonify({'message': 'pong'})

@app.route('/api/ai/recommend', methods=['POST'])
def recommend():
    data = request.get_json(silent=True) or {}
    query = data.get('query', 'sem query')
    return jsonify({
        'query': query,
        'recommendations': [
            'Recomendação 1 para ' + query,
            'Recomendação 2 para ' + query,
        ]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8083, debug=True)
EOF

cat > "$PROJECT_ROOT/.gitignore" <<'EOF'
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
instance/
.pytest_cache/

# VS Code
.vscode/

# Byte-compiled / optimized / DLL files
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg
EOF

cat > "$PROJECT_ROOT/README.md" <<'EOF'
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
EOF

cat <<'EOF'
AI service criado em $PROJECT_ROOT
Próximo passo:
  cd $PROJECT_ROOT
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  python src/app.py
EOF
