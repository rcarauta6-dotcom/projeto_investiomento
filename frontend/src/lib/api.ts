'use client';

export async function apiGet<T>(path: string): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers: {
      'X-Custom-Host': 'meu-app-autorizado',
      // The gateway expects the Authorization header; we assume a valid token is set via env or mock.
      // In testing environments the token can be omitted or set to a dummy value.
      ...(process.env.NEXT_PUBLIC_API_AUTH_HEADER
        ? { Authorization: process.env.NEXT_PUBLIC_API_AUTH_HEADER } as Record<string, string>
        : {}),
    },
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API error ${response.status}: ${errBody}`);
  }
  return (await response.json()) as T;
}
