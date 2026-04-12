#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_DIR="ingestion-service"
PROJECT_ROOT="$ROOT_DIR/$PROJECT_DIR"

if [ -d "$PROJECT_ROOT" ]; then
  echo "Erro: o diretório '$PROJECT_ROOT' já existe. Remova-o ou escolha outro nome."
  exit 1
fi

mkdir -p "$PROJECT_ROOT"

cat > "$PROJECT_ROOT/go.mod" <<'EOF'
module example.com/ingestion-service

go 1.22
EOF

cat > "$PROJECT_ROOT/main.go" <<'EOF'
package main

import (
    "fmt"
    "log"
    "net/http"
)

func main() {
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "ingestion-service ok")
    })

    http.HandleFunc("/api/ingestion/ping", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "pong")
    })

    addr := ":8082"
    log.Printf("ingestion-service rodando em %s", addr)
    if err := http.ListenAndServe(addr, nil); err != nil {
        log.Fatalf("falha ao iniciar server: %v", err)
    }
}
EOF

cat > "$PROJECT_ROOT/.gitignore" <<'EOF'
/bin/
/pkg/
/vendor/
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
EOF

cat > "$PROJECT_ROOT/README.md" <<'EOF'
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
EOF

cat <<'EOF'
Ingestion service criado em $PROJECT_ROOT
Próximo passo:
  cd $PROJECT_ROOT
  go run main.go
EOF
