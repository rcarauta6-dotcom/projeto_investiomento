import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BolsaDash | Gestão de Investimentos",
  description: "Acompanhe seu patrimônio em tempo real",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full bg-slate-50" suppressHydrationWarning>
      <body className={`${geistSans.className} h-full antialiased text-slate-900`} suppressHydrationWarning>
        <div className="flex min-h-screen bg-slate-50">
          
          {/* Sidebar Fixa - Visual Profissional */}
          <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed h-full z-50">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">BolsaDash</h1>
              </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              <SidebarLink href="/" label="Dashboard" icon={<IconDashboard />} />
              <SidebarLink href="/portfolio/portfolio-summary" label="Portfólio" icon={<IconPortfolio />} />
              <SidebarLink href="/market/cached" label="Mercado" icon={<IconMarket />} />
              <SidebarLink href="/ai" label="IA Insights" icon={<IconAI />} />
            </nav>

            <div className="p-4 border-t border-slate-800">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Conta</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">RS</div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">Renato Silva</p>
                    <p className="text-xs text-slate-500 truncate">Premium Plan</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Conteúdo Principal com Scroll */}
          <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
            
            {/* Header / Topbar */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center lg:hidden gap-3">
                   <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                  <span className="font-bold">BolsaDash</span>
                </div>
                
                <div className="hidden lg:block text-slate-400">
                  <span className="text-sm">Sessão iniciada como <strong className="text-slate-600">Renato Silva</strong></span>
                </div>

                <div className="flex items-center gap-4">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <IconBell />
                  </button>
                  <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                  <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">Sair</button>
                </div>
              </div>
            </header>

            {/* Wrapper de Conteúdo - Aqui resolve o "colado na tela" */}
            <main className="flex-1 p-6 md:p-10">
              <div className="max-w-7xl mx-auto space-y-10">
                {children}
              </div>
            </main>

            <footer className="border-t border-slate-200 bg-white py-6">
              <div className="max-w-7xl mx-auto px-10 text-slate-400 text-xs flex justify-between items-center">
                <span>&copy; 2026 BolsaDash</span>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-slate-600">Privacidade</a>
                  <a href="#" className="hover:text-slate-600">Termos</a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}

function SidebarLink({ href, label, icon, active = false }: { href: string; label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-semibold' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

// SVGs como componentes inline para manter o arquivo único e limpo
const IconDashboard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
const IconPortfolio = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconMarket = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
const IconAI = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 22v-4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M22 12h-4"/><path d="m19.07 4.93-2.83 2.83"/><path d="M12 12v0"/></svg>
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
