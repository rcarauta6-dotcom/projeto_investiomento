'use client';

import React, { useEffect, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface PricePoint {
  date: string;
  price: number;
}

interface MarketChartProps {
  symbol: string;
}

export default function MarketChart({ symbol }: MarketChartProps) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/api/v1/market/history?symbol=${symbol}&range=5d&interval=1h`, {
          headers: {
            'X-Custom-Host': 'meu-app-autorizado',
          }
        });
        if (!response.ok) throw new Error();
        const result = await response.json();
        setData(result.prices);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [symbol]);

  if (loading) return (
    <div className="h-64 w-full bg-slate-50 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-bold">
      Carregando gráfico...
    </div>
  );

  if (error) return (
    <div className="h-64 w-full bg-red-50 rounded-3xl flex items-center justify-center text-red-500 font-bold p-10 text-center">
      Erro ao carregar dados históricos para {symbol}
    </div>
  );

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            hide 
          />
          <YAxis 
            hide 
            domain={['auto', 'auto']} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: 'none', 
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#10b981' }}
            labelFormatter={(label) => `Data: ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
