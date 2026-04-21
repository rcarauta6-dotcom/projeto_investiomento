import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvestDash - Seu Patrimônio",
  description: "Gestão de ativos financeiros",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${geistSans.className} bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-full flex flex-col`}>
        {/* Navbar */}
        <nav className="border-b border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-8">
                <h1 className="text-xl font-bold tracking-tighter text-emerald-600">BolsaDash</h1>
                <div className="hidden md:flex gap-4 text-sm font-medium">
                  <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
                  <Link href="/portfolio" className="text-emerald-600">Portfólio</Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700" />
              </div>
            </div>
          </div>
        </nav>

        {/* Conteúdo Principal */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}