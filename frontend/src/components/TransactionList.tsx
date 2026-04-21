'use client';

import { useEffect, useState } from 'react';
import { fetchPortfolioTransactions } from '@/services/portfolio';

export default function TransactionList() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPortfolioTransactions();
        setTransactions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Carregando transações...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (transactions.length === 0) {
    return <p>Nenhuma transação encontrada.</p>;
  }

  return (
    <div>
      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            <strong>{t.ativo}</strong> – {t.tipo} – {t.quantidade} ações a R${' '}{t.preco_unitario.toFixed(2)}
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#666' }}>
              ({t.data_operacao})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}