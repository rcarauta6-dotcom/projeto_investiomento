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

  if (loading) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="p-10 text-center text-red-500 font-medium">Erro ao carregar transações.</div>;

  if (transactions.length === 0) {
    return (
      <div className="p-20 text-center">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 012 2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
        </div>
        <p className="text-slate-500 font-medium">Nenhuma transação registrada.</p>
        <p className="text-slate-400 text-xs mt-1">Suas operações aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Ativo</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Operação</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Qtd.</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Preço Unit.</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
              <td className="px-6 py-4 font-bold text-slate-700">{t.ativo}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold ${
                  t.tipo === 'COMPRA' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {t.tipo}
                </span>
              </td>
              <td className="px-6 py-4 text-right font-medium text-slate-600">{t.quantidade}</td>
              <td className="px-6 py-4 text-right font-bold text-slate-800">
                R$ {t.precoUnitario?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 text-right text-xs font-medium text-slate-400">
                {t.dataOperacao ? new Date(t.dataOperacao).toLocaleDateString('pt-BR') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
