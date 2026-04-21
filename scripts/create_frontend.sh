#!/usr/bin/env bash
# scripts/create_frontend.sh
# Script to bootstrap a basic React + Next.js project with Tailwind CSS.
# Usage: ./scripts/create_frontend.sh

set -euo pipefail

PROJECT_NAME="frontend"
if [ -d "$PROJECT_NAME" ]; then
  echo "Error: Directory '$PROJECT_NAME' already exists. Delete or choose another name." >&2
  exit 1
fi

echo "Creating Next.js project '$PROJECT_NAME'..."
npx create-next-app@latest $PROJECT_NAME \
  --typescript \
  --tailwind \
  --eslint \
  --app --src-dir

cd "$PROJECT_NAME"

# Optional: Install additional packages
npm install zustand

# Create a basic Boilerplate component
mkdir -p components
cat > components/Boilerplate.tsx <<'COMPONENT'
import React from 'react';

export default function Boilerplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
COMPONENT

echo "Frontend project created successfully in ./$PROJECT_NAME"
echo "To start the dev server: cd $PROJECT_NAME && npm run dev"