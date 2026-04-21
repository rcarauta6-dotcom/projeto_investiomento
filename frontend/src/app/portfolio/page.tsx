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
    <div className="space-y-10">
      {/* Título e Subtítulo da Página */}
      <section>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Meu Portfólio</h2>
        <p className="text-slate-500 mt-1">Gerencie seus ativos e acompanhe sua rentabilidade consolidada.</p>
      </section>

      {/* Grid de KPIs - Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          label="Patrimônio Total" 
          value={loading ? null : `R$ ${summary?.patrimonio_total?.toLocaleString('pt-BR')}`} 
          colorClass="text-emerald-600"
        />
        <KPICard 
          label="Rentabilidade (Mês)" 
          value={loading ? null : `${summary?.rentabilidade_mes_percentual}%`} 
          colorClass={summary?.rentabilidade_mes_percentual >= 0 ? 'text-emerald-600' : 'text-red-600'}
        />
        <div className="card-professional p-6 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alocação de Risco</span>
          <div className="flex items-end gap-6 mt-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Variável</p>
              <p className="text-xl font-bold text-slate-800">{summary?.distribuicao?.renda_variavel || 0}%</p>
            </div>
            <div className="h-10 w-px bg-slate-100"></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Fixa</p>
              <p className="text-xl font-bold text-slate-800">{summary?.distribuicao?.renda_fixa || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal: Formulários e Histórico */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Coluna Lateral: Ações Rápidas */}
        <div className="xl:col-span-4 space-y-8">
          <div className="card-professional">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-bold text-slate-700">Consultar Ativo</h3>
            </div>
            <div className="p-6">
              <StockPriceForm />
            </div>
          </div>

          <div className="card-professional">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-bold text-slate-700">Nova Transação</h3>
            </div>
            <div className="p-6">
              <TransactionForm />
            </div>
          </div>
        </div>

        {/* Coluna Central: Listagem de Transações */}
        <div className="xl:col-span-8">
          <div className="card-professional">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">Histórico de Transações</h3>
              <button className="text-xs font-semibold text-emerald-600 hover:underline">Ver tudo</button>
            </div>
            <TransactionList />
          </div>
        </div>

      </div>
    </div>
  );
}

function KPICard({ label, value, colorClass }: { label: string; value: string | null; colorClass: string }) {
  return (
    <div className="card-professional p-6">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      {value === null ? (
        <div className="h-9 w-3/4 bg-slate-100 animate-pulse rounded-lg mt-3"></div>
      ) : (
        <p className={`text-3xl font-black mt-2 tracking-tight ${colorClass}`}>{value}</p>
      )}
    </div>
  );
}
