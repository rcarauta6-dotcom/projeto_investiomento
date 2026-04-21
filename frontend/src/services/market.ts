export async function getStockPrice(ticker: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${baseUrl}/api/v1/market/stocks/${encodeURIComponent(ticker)}`, {
    method: 'GET',
    headers: {
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