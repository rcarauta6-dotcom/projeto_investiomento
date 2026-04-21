export async function fetchPortfolioSummary() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${baseUrl}/api/v1/portfolio/summary`, {
    method: 'GET',
    headers: {
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
    patrimonio_total: number;
    rentabilidade_mes_percentual: number;
    distribuicao: { renda_variavel: number; renda_fixa: number };
  };
}

export async function fetchPortfolioTransactions() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${baseUrl}/api/v1/portfolio/transactions`, {
    method: 'GET',
    headers: {
      ...(process.env.NEXT_PUBLIC_API_AUTH_HEADER
        ? { Authorization: process.env.NEXT_PUBLIC_API_AUTH_HEADER } as Record<string, string>
        : {}),
    },
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API error ${response.status}: ${errBody}`);
  }
  return (await response.json()) as Array<{
    id: string;
    ativo: string;
    tipo: string;
    quantidade: number;
    preco_unitario: number;
    data_operacao: string;
  }>;
}

export async function createTransaction(transaction: {
  ativo: string;
  tipo: string;
  quantidade: number;
  preco_unitario: number;
  data_operacao?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${baseUrl}/api/v1/portfolio/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.NEXT_PUBLIC_API_AUTH_HEADER
        ? { Authorization: process.env.NEXT_PUBLIC_API_AUTH_HEADER } as Record<string, string>
        : {}),
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API error ${response.status}: ${errBody}`);
  }
  return (await response.json()) as {
    id: string;
    ativo: string;
    tipo: string;
    quantidade: number;
    preco_unitario: number;
    data_operacao: string;
  };
}