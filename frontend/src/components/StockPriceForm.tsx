'use client';

import { useState } from 'react';
import { getStockPrice } from '@/services/market';

export default function StockPriceForm() {
  const [ticker, setTicker] = useState('');
  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;
    setLoading(true);
    setError('');
    try {
      const data = await getStockPrice(ticker);
      setPriceData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Digite o ticker..."
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {priceData && (
        <div>
          <p>
            {priceData.ticker}: R${priceData.preco_atual.toLocaleString('pt-BR')}
          </p>
          <p>{priceData.variacao_diaria}</p>
        </div>
      )}
    </div>
  );
}