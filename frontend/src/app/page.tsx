'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMarketRates, MarketRates, getMarketNews, type NewsItem } from '@/services/market-rates';
import MarketChart from '@/components/MarketChart';

export default function Home() {
  const [rates, setRates] = useState<MarketRates | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ratesData, newsData] = await Promise.all([
          getMarketRates(),
          getMarketNews()
        ]);
        setRates(ratesData);
        setNews(newsData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <section>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Bem-vindo de volta, <span className="text-emerald-600">Renato</span>
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Aqui está o que está acontecendo no mercado hoje.</p>
      </section>

      {/* Market Indicators Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <RateCard 
          label="SELIC" 
          value={rates?.selic ? `${rates.selic}%` : '---'} 
          sub="Meta Copom" 
          loading={loading}
          color="bg-blue-500"
        />
        <RateCard 
          label="CDI" 
          value={rates?.cdi ? `${rates.cdi}%` : '---'} 
          sub="Diário" 
          loading={loading}
          color="bg-emerald-500"
        />
        <RateCard 
          label="IPCA" 
          value={rates?.ipca_12m ? `${rates.ipca_12m}%` : '---'} 
          sub="Últimos 12m" 
          loading={loading}
          color="bg-amber-500"
        />
        <RateCard 
          label="IBOVESPA" 
          value="128.450" 
          sub="+1.2% hoje" 
          loading={false}
          color="bg-slate-900"
        />
      </section>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: AI & Charts */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Main Chart Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Performance do Índice</h3>
                <p className="text-slate-400 text-sm font-medium">IBOVESPA (Últimos 5 dias)</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">Live</span>
              </div>
            </div>
            <div className="relative z-10">
              <MarketChart symbol="^BVSP" />
            </div>
          </div>

          {/* AI Insight Box */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
                <path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 22v-4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M22 12h-4"/><path d="m19.07 4.93-2.83 2.83"/><path d="M12 12v0"/>
              </svg>
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Insight da IA
              </div>
              <h2 className="text-3xl font-bold mb-4 leading-tight">
                "O mercado de FIIs está em um ponto de inflexão estratégico."
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl">
                Nossa análise RAG detectou uma correlação atípica entre o fechamento do IPCA e os fundos de papel. 
                Deseja uma análise detalhada da sua carteira?
              </p>
              <Link 
                href="/ai" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
              >
                Conversar com Assistente
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ShortcutCard 
              title="Minha Carteira"
              desc="Visualize sua alocação e lucro total."
              href="/portfolio/portfolio-summary"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
            />
            <ShortcutCard 
              title="Monitor de Mercado"
              desc="Cotações em tempo real e histórico."
              href="/market/cached"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>}
            />
          </div>
        </div>

        {/* Right Column: News & Status */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-h-[400px]">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Notícias em Tempo Real</h3>
            <div className="space-y-6">
              {news.length > 0 ? (
                news.slice(0, 8).map((item, i) => (
                  <NewsItem 
                    key={i}
                    time={new Date(item.published_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    title={item.title}
                    link={item.link}
                  />
                ))
              ) : (
                <p className="text-slate-400 text-sm italic">Nenhuma notícia encontrada.</p>
              )}
            </div>
            {news.length > 8 && (
               <button className="w-full mt-8 py-3 text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest border-t border-slate-50 pt-6">
                Ver Todas
              </button>
            )}
          </div>

          <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
            <h3 className="text-lg font-bold text-emerald-900 mb-2">Status do Sistema</h3>
            <div className="flex items-center gap-3 text-emerald-700 text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              <span>Todos os microserviços online</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function RateCard({ label, value, sub, loading, color }: { label: string, value: string, sub: string, loading: boolean, color: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <div className={`w-8 h-8 ${color} rounded-xl opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg"></div>
      ) : (
        <p className="text-2xl font-black text-slate-900">{value}</p>
      )}
      <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-tighter">{sub}</p>
    </div>
  );
}

function ShortcutCard({ title, desc, href, icon }: { title: string, desc: string, href: string, icon: React.ReactNode }) {
  return (
    <Link href={href} className="flex gap-5 p-6 bg-white border border-slate-200 rounded-3xl hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
      <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white rounded-2xl transition-all">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{title}</h4>
        <p className="text-slate-500 text-sm mt-1">{desc}</p>
      </div>
    </Link>
  );
}

function NewsItem({ time, title, link }: { time: string, title: string, link: string }) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="block group cursor-pointer">
      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{time}</span>
      <h4 className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 mt-1 leading-snug transition-colors">
        {title}
      </h4>
    </a>
  );
}
