'use client';

import { useState } from 'react';
import { askAI, uploadPDF } from '@/services/ai';

export default function AIPage() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const data = await askAI(query);
      setResponse(data.response);
    } catch (err) {
      setError('Erro ao consultar a IA. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploadLoading(true);
      setError(null);
      const data = await uploadPDF(file);
      setUploadMessage(`${data.message} (${data.chunks_indexed} chunks indexados)`);
      setFile(null);
    } catch (err) {
      setError('Erro ao enviar o PDF.');
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Seção de Chat */}
      <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-200">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 22v-4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M22 12h-4"/><path d="m19.07 4.93-2.83 2.83"/><path d="M12 12v0"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IA Insights</h1>
          </div>
          <p className="text-slate-500 text-sm">Consulte nosso assistente financeiro inteligente alimentado por RAG</p>
        </div>

        <form onSubmit={handleAsk} className="space-y-4">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Qual o impacto da variação da Selic no Tesouro Direto? Devo manter minhas ações de varejo?"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium min-h-[120px] bg-slate-50/50 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                loading || !query.trim()
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Consultando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Perguntar à IA
                </>
              )}
            </button>
          </div>
        </form>

        {response && (
          <div className="mt-10 p-7 bg-slate-900 rounded-3xl border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
                <path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 22v-4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M22 12h-4"/><path d="m19.07 4.93-2.83 2.83"/><path d="M12 12v0"/>
              </svg>
            </div>
            <div className="flex items-start gap-5 relative z-10">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-3">Resposta da Inteligência</h3>
                <p className="text-slate-100 text-base leading-relaxed whitespace-pre-wrap font-medium">{response}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Seção de Upload */}
      <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Treinamento e Contexto</h2>
          <p className="text-slate-500 text-sm">Faça upload de documentos (PDF) para expandir o conhecimento da IA</p>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col md:flex-row items-stretch gap-4">
          <label className="flex-1 relative group">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`w-full h-full px-5 py-4 rounded-2xl border-2 border-dashed transition-all text-sm font-semibold flex items-center gap-4 ${
              file 
                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700' 
                : 'border-slate-200 bg-slate-50/50 text-slate-400 group-hover:border-slate-300 group-hover:bg-slate-50'
            }`}>
              <div className={`p-2 rounded-lg ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <span className="truncate">{file ? file.name : 'Clique ou arraste um PDF aqui...'}</span>
            </div>
          </label>
          <button
            type="submit"
            disabled={uploadLoading || !file}
            className={`px-10 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 min-w-[180px] ${
              uploadLoading || !file
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl active:scale-95'
            }`}
          >
            {uploadLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Indexar Documento'}
          </button>
        </form>

        {uploadMessage && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in zoom-in-95 duration-300">
            <div className="p-1 bg-emerald-500 text-white rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {uploadMessage}
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in zoom-in-95 duration-300">
            <div className="p-1 bg-red-500 text-white rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
