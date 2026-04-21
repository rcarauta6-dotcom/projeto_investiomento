'use client';

import { useEffect, useState } from 'react';

export default function PortfolioSummary() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSummary = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      try {
        const response = await fetch(`${baseUrl}/api/v1/portfolio/summary`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSummary(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Resumo do Patrimônio</h1>
      <p>
        Total: R${summary?.patrimonio_total?.toLocaleString('pt-BR')}
      </p>
      <p>
        Rentabilidade Mensal: {summary?.rentabilidade_mes_percentual}%
      </p>
      <p>
        Distribuição de Risco:
        {summary?.distribuicao?.renda_variavel}% Renda Variável,
        {summary?.distribuicao?.renda_fixa}% Renda Fixa
      </p>
    </div>
  );
}