#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="frontend"

if [ -d "$PROJECT_DIR" ]; then
  echo "Erro: o diretório '$PROJECT_DIR' já existe. Escolha outro nome ou remova o diretório existente."
  exit 
fi

command -v npx >/dev/null 2>&1 || {
  echo "Erro: npx não encontrado. Instale Node.js/npm antes de rodar este script."
  exit 1
}

cat <<'EOF'
Criando projeto frontend com Next.js + Tailwind + TypeScript + ESLint...
EOF

npx create-next-app@latest "$PROJECT_DIR" \
  --ts \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --use-npm \
  --import-alias "@/*" \
  --yes

cat <<'EOF'
Frontend criado em ./$PROJECT_DIR
Para iniciar:
  cd $PROJECT_DIR
  npm run dev
EOF
