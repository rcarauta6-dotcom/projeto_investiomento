'use client';

import { useState } from 'react';
import { createTransaction } from '@/services/portfolio';

export default function TransactionForm() {
  const [ativo, setAtivo] = useState('');
  const [tipo, setTipo] = useState('COMPRA');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await createTransaction({
        ativo: ativo.trim().toUpperCase(),
        tipo,
        quantidade: Number(quantidade),
        precoUnitario: Number(preco),
        dataOperacao: new Date().toISOString().split('T')[0],
      });
      setMessage({ type: 'success', text: 'Transação registrada com sucesso!' });
      setAtivo('');
      setQuantidade('');
      setPreco('');
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro ao processar requisição.' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="ativo" className="text-sm font-semibold text-slate-700">Ativo</label>
        <input
          id="ativo"
          type="text"
          placeholder="Ex: PETR4"
          value={ativo}
          onChange={(e) => setAtivo(e.target.value)}
          required
          className="input-professional"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="tipo" className="text-sm font-semibold text-slate-700">Operação</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="input-professional"
          >
            <option value="COMPRA">Compra</option>
            <option value="VENDA">Venda</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="quantidade" className="text-sm font-semibold text-slate-700">Qtd.</label>
          <input
            id="quantidade"
            type="number"
            placeholder="0"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            required
            className="input-professional"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="preco" className="text-sm font-semibold text-slate-700">Preço Unitário</label>
        <input
          id="preco"
          type="number"
          step="0.01"
          placeholder="R$ 0,00"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          required
          className="input-professional"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-professional mt-2">
        {loading ? 'Processando...' : 'Registrar Transação'}
      </button>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium transition-all ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}
    </form>
  );
}
