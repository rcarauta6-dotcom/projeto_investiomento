'use client';

import { useEffect, useState } from 'react';
import { getCachedQuotes, requestQuoteUpdate, Quote } from '@/services/market';

export default function CachedQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickerInput, setTickerInput] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const data = await getCachedQuotes();
      setQuotes(data || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar cotações do cache.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSymbol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tickerInput.trim()) return;

    try {
      setUpdateLoading(true);
      setError(null);
      await requestQuoteUpdate(tickerInput);
      setTickerInput('');
      // Recarrega a lista após atualizar
      await fetchQuotes();
    } catch (err) {
      setError(`Erro ao atualizar ${tickerInput}. Verifique se o ticker é válido.`);
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr: string) => {
    if (!isMounted || !dateStr) return '---';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return '---';
      }
      return date.toLocaleString('pt-BR');
    } catch (e) {
      return '---';
    }
  };

  return (
    <div className="p-8 font-[family-name:var(--font-geist-sans)] bg-white rounded-3xl shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mercado em Tempo Real</h1>
          <p className="text-slate-500 text-sm">Gerencie e atualize ativos no cache do sistema</p>
        </div>
        
        <form onSubmit={handleUpdateSymbol} className="flex w-full md:w-auto gap-2">
          <input
            type="text"
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
            placeholder="Ex: PETR4, VALE3"
            className="flex-1 md:w-48 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
          />
          <button 
            type="submit"
            disabled={updateLoading || !tickerInput}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              updateLoading || !tickerInput
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
            }`}
          >
            {updateLoading ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            Atualizar Ativo
          </button>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <div className="overflow-hidden border border-slate-100 rounded-2xl">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ativo</th>
              <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Preço Atual</th>
              <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Última Atualização</th>
              <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {quotes.length === 0 && !loading ? (
              <tr>
                <td colSpan={4} className="py-10 px-6 text-center text-slate-400 italic">
                  Nenhuma cotação disponível no cache no momento. Use o campo acima para adicionar!
                </td>
              </tr>
            ) : (
              quotes.map((quote) => (
                <tr key={quote.symbol} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-xs">
                        {quote.symbol.substring(0, 2)}
                      </div>
                      <span className="font-bold text-slate-900">{quote.symbol}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-700">
                    R$ {quote.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6 text-slate-500 text-sm">
                    {formatDate(quote.time)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Atualizado
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 italic">Ação Imediata</h3>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
              Ao digitar um ticker (ex: <strong>VALE3</strong>) e clicar em atualizar, o sistema ignora o cache, 
              busca o preço real na API do mercado financeiro e notifica todos os microserviços via <strong>Kafka</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
