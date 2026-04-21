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
      setError('Ativo não encontrado.');
      setPriceData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Ex: VALE3"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          required
          className="input-professional !py-2"
        />
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </form>
      
      {error && <div className="text-xs font-semibold text-red-500 bg-red-50 p-2 rounded border border-red-100">{error}</div>}
      
      {priceData && (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 transition-all">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-700">{priceData.ticker}</span>
            <span className="text-lg font-black text-emerald-600">
              R$ {priceData.preco_atual.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              priceData.variacao_diaria.includes('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {priceData.variacao_diaria}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Variação Diária</span>
          </div>
        </div>
      )}
    </div>
  );
}
