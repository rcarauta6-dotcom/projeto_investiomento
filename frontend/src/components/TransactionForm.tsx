'use client';

import { useState } from 'react';
import { createTransaction } from '@/services/portfolio';

export default function TransactionForm() {
  const [form, setForm] = useState({
    ativo: '',
    tipo: 'COMPRA',
    quantidade: '',
    preco_unitario: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const transaction = {
        ...form,
        preco_unitario: Number(form.preco_unitario),
        quantidade: Number(form.quantidade),
        data_operacao: new Date().toISOString().split('T')[0],
      };
      await createTransaction(transaction);
      setSuccess('Transação registrada com sucesso!');
      setForm({
        ativo: '',
        tipo: 'COMPRA',
        quantidade: '',
        preco_unitario: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="tipo" value="COMPRA" />
        <label>
          Ativo:
          <input
            type="text"
            name="ativo"
            value={form.ativo}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Tipo:
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            required
          >
            <option value="COMPRA">Compra</option>
            <option value="VENDA">Venda</option>
          </select>
        </label>
        <br />
        <label>
          Quantidade:
          <input
            type="number"
            name="quantidade"
            value={form.quantidade}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Preço Unitário (R$):
          <input
            type="number"
            step="0.01"
            name="preco_unitario"
            value={form.preco_unitario}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}