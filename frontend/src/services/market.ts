export interface Quote {
  symbol: string;
  price: number;
  time: string;
}

export async function getStockPrice(ticker: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${baseUrl}/gateway/v1/market/stocks/${encodeURIComponent(ticker)}`, {
    method: 'GET',
    headers: {
      'X-Custom-Host': 'meu-app-autorizado',
      // Authorization header expected by the gateway; provide a dummy token in dev if needed.
      ...(process.env.NEXT_PUBLIC_API_AUTH_HEADER
        ? { Authorization: process.env.NEXT_PUBLIC_API_AUTH_HEADER } as Record<string, string>
        : {}),
    },
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API error ${response.status}: ${errBody}`);
  }
  return (await response.json()) as {
    ticker: string;
    preco_atual: number;
    variacao_diaria: string;
  };
}

export async function getCachedQuotes(): Promise<Quote[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  const response = await fetch(`${baseUrl}/api/quotes/cached`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'X-Custom-Host': 'meu-app-autorizado',
      ...(process.env.NEXT_PUBLIC_API_AUTH_HEADER
        ? { Authorization: process.env.NEXT_PUBLIC_API_AUTH_HEADER } as Record<string, string>
        : {}),
    },
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Falha ao buscar cotações em cache: ${response.status} - ${errBody}`);
  }
  return await response.json();
}

export async function requestQuoteUpdate(symbol: string): Promise<Quote> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  const cleanSymbol = symbol.toUpperCase().trim();
  
  // Enviando via POST mas com query param symbol para garantir compatibilidade
  const response = await fetch(`${baseUrl}/api/quote?symbol=${cleanSymbol}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Custom-Host': 'meu-app-autorizado',
      ...(process.env.NEXT_PUBLIC_API_AUTH_HEADER
        ? { Authorization: process.env.NEXT_PUBLIC_API_AUTH_HEADER } as Record<string, string>
        : {}),
    },
    body: JSON.stringify({ symbol: cleanSymbol }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Erro ao solicitar atualização: ${response.status} - ${errBody}`);
  }
  return await response.json();
}
