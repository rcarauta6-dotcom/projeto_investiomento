const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface ChatResponse {
  response: string;
}

export interface UploadResponse {
  message: string;
  chunks_indexed: number;
}

export async function askAI(query: string): Promise<ChatResponse> {
  // Chamada interceptada pelo ingestion-service (Go)
  const response = await fetch(`${BASE_URL}/api/ingestion/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Custom-Host': 'meu-app-autorizado',
      ...(process.env.NEXT_PUBLIC_API_AUTH_HEADER
        ? { Authorization: process.env.NEXT_PUBLIC_API_AUTH_HEADER } as Record<string, string>
        : {}),
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`AI Interceptor error ${response.status}: ${errBody}`);
  }
  return await response.json();
}

export async function uploadPDF(file: File): Promise<UploadResponse> {
  // O upload continua indo direto para o AI service via Gateway
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/api/v1/ai/upload_pdf`, {
    method: 'POST',
    headers: {
      'X-Custom-Host': 'meu-app-autorizado',
      ...(process.env.NEXT_PUBLIC_API_AUTH_HEADER
        ? { Authorization: process.env.NEXT_PUBLIC_API_AUTH_HEADER } as Record<string, string>
        : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Upload error ${response.status}: ${errBody}`);
  }
  return await response.json();
}
