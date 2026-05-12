'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { analyzePortfolio } from '@/services/market-rates';

export default function PortfolioSummary() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAiAnalyzing] = useState(false);

  const fetchSummary = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/v1/portfolio/summary`, {
        headers: {
          'X-Custom-Host': 'meu-app-autorizado',
          ...(process.env.NEXT_PUBLIC_API_AUTH_HEADER
            ? { Authorization: process.env.NEXT_PUBLIC_API_AUTH_HEADER } as Record<string, string>
            : {}),
        }
      });
      if (!response.ok) {
        throw new Error(`Erro ao buscar resumo: ${response.status}`);
      }
      const data = await response.json();
      setSummary(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAiAnalyze = async () => {
    try {
      setAiAnalyzing(true);
      const data = await analyzePortfolio();
      setAiAnalysis(data.response);
    } catch (err) {
      console.error(err);
      setAiAnalysis("Desculpe, não consegui realizar a análise agora. Tente novamente em instantes.");
    } finally {
      setAiAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-700">
      <h2 className="text-lg font-bold mb-2">Ops! Algo deu errado</h2>
      <p>{error}</p>
      <button 
        onClick={fetchSummary}
        className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-xl transition-colors font-bold text-sm"
      >
        Tentar Novamente
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Resumo do Patrimônio</h1>
          <p className="text-slate-500 mt-1">Visão geral consolidada dos seus investimentos</p>
        </div>
        <button 
          onClick={handleAiAnalyze}
          disabled={analyzing}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          {analyzing ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 22v-4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M22 12h-4"/><path d="m19.07 4.93-2.83 2.83"/><path d="M12 12v0"/>
            </svg>
          )}
          {analyzing ? 'Analisando...' : 'Revisar com IA'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Patrimônio Total */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Patrimônio Total</p>
          <div className="flex items-baseline gap-2">
            <span className="text-slate-400 text-xl font-medium">R$</span>
            <span className="text-4xl font-black text-slate-900">
              {summary?.patrimonio_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
            <span>+2.4% este mês</span>
          </div>
        </div>

        {/* Card Rentabilidade */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Rentabilidade Mensal</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-emerald-600">
              {summary?.rentabilidade_mes_percentual}%
            </span>
            <span className="text-slate-400 font-medium">do CDI</span>
          </div>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Card Distribuição */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Distribuição de Ativos</p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-slate-700">Renda Variável</span>
                <span className="text-slate-500">{summary?.distribuicao?.renda_variavel}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${summary?.distribuicao?.renda_variavel}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-slate-700">Renda Fixa</span>
                <span className="text-slate-500">{summary?.distribuicao?.renda_fixa}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${summary?.distribuicao?.renda_fixa}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(aiAnalysis || analyzing) && (
        <div className="bg-emerald-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-600/20 animate-in slide-in-from-bottom-4 duration-700">
          <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
            <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 22v-4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M22 12h-4"/><path d="m19.07 4.93-2.83 2.83"/><path d="M12 12v0"/>
            </svg>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-4 italic">Análise Tática da IA</h2>
            {analyzing ? (
              <div className="flex items-center gap-3 py-4">
                <div className="animate-bounce delay-100 w-2 h-2 bg-white rounded-full"></div>
                <div className="animate-bounce delay-200 w-2 h-2 bg-white rounded-full"></div>
                <div className="animate-bounce delay-300 w-2 h-2 bg-white rounded-full"></div>
                <span className="font-bold ml-2">Processando dados e notícias recentes...</span>
              </div>
            ) : (
              <div className="text-emerald-50 text-lg leading-relaxed font-medium whitespace-pre-wrap prose prose-invert max-w-none">
                {aiAnalysis}
              </div>
            )}
            {!analyzing && (
              <Link 
                href="/ai"
                className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-2xl font-extrabold text-sm hover:bg-emerald-50 transition-all active:scale-95 shadow-lg"
              >
                Tirar Dúvidas Específicas
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
