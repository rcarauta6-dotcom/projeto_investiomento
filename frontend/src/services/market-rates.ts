const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface MarketRates {
  selic: number;
  cdi: number;
  ipca_12m: number;
  updated_at: string;
}

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  published_at: string;
  source: string;
}

export async function getMarketRates(): Promise<MarketRates> {
  const response = await fetch(`${BASE_URL}/api/v1/market/fixed-income/rates`, {
    headers: {
      'X-Custom-Host': 'meu-app-autorizado',
      ...(process.env.NEXT_PUBLIC_API_AUTH_HEADER
        ? { Authorization: process.env.NEXT_PUBLIC_API_AUTH_HEADER } as Record<string, string>
        : {}),
    },
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Market rates error ${response.status}: ${errBody}`);
  }
  return await response.json();
}

export async function getMarketNews(): Promise<NewsItem[]> {
  const response = await fetch(`${BASE_URL}/api/v1/market/news`, {
    headers: {
      'X-Custom-Host': 'meu-app-autorizado',
      ...(process.env.NEXT_PUBLIC_API_AUTH_HEADER
        ? { Authorization: process.env.NEXT_PUBLIC_API_AUTH_HEADER } as Record<string, string>
        : {}),
    },
  });

  if (!response.ok) {
    return [];
  }
  return await response.json();
}

export async function analyzePortfolio(): Promise<{ response: string }> {
  const response = await fetch(`${BASE_URL}/api/v1/market/portfolio/analyze`, {
    method: 'POST',
    headers: {
      'X-Custom-Host': 'meu-app-autorizado',
      ...(process.env.NEXT_PUBLIC_API_AUTH_HEADER
        ? { Authorization: process.env.NEXT_PUBLIC_API_AUTH_HEADER } as Record<string, string>
        : {}),
    },
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Analysis error ${response.status}: ${errBody}`);
  }
  return await response.json();
}
