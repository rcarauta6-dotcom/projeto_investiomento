'use client';

import StockPriceForm from '@/components/StockPriceForm';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { fetchPortfolioSummary } from '@/services/portfolio';
import { useEffect, useState } from 'react';

export default function PortfolioHome() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPortfolioSummary();
        setSummary(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Página */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Portfólio</h1>
          <p className="text-zinc-500">Acompanhe e gerencie seus investimentos em tempo real.</p>
        </div>
      </header>

      {/* Seção de Resumo (Cards Superiores) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 uppercase">Patrimônio Total</p>
          {loading ? (
            <div className="h-8 w-32 bg-zinc-100 animate-pulse rounded mt-2" />
          ) : (
            <h2 className="text-3xl font-bold text-emerald-600 mt-1">
              R$ {summary?.patrimonio_total?.toLocaleString('pt-BR')}
            </h2>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 uppercase">Rentabilidade (Mês)</p>
          <h2 className={`text-3xl font-bold mt-1 ${summary?.rentabilidade_mes_percentual >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {summary?.rentabilidade_mes_percentual}%
          </h2>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 uppercase">Alocação de Risco</p>
          <div className="flex gap-4 mt-2">
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Variável</span>
              <span className="font-bold">{summary?.distribuicao?.renda_variavel}%</span>
            </div>
            <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Fixa</span>
              <span className="font-bold">{summary?.distribuicao?.renda_fixa}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal (Formulários e Lista) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Coluna da Esquerda: Formulários */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Cotação Rápida</h3>
            <StockPriceForm />
          </section>

          <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Nova Transação</h3>
            <TransactionForm />
          </section>
        </div>

        {/* Coluna da Direita: Listagem */}
        <div className="lg:col-span-8">
          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold">Transações Recentes</h3>
            </div>
            <div className="p-0">
              <TransactionList />
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}