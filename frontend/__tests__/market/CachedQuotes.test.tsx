import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import CachedQuotesPage from '../../src/app/market/cached/page';
import * as marketService from '../../src/services/market';

// Mock dos serviços de mercado
jest.mock('../../src/services/market');

const mockQuotes = [
  { symbol: 'PETR4', price: 35.5, time: '2026-04-27T21:00:00Z' },
  { symbol: 'VALE3', price: 70.2, time: '2026-04-27T21:05:00Z' },
];

describe('CachedQuotesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir o título da página', () => {
    (marketService.getCachedQuotes as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<CachedQuotesPage />);
    expect(screen.getByText(/Mercado em Tempo Real/i)).toBeInTheDocument();
  });

  it('deve renderizar as cotações quando buscadas com sucesso', async () => {
    (marketService.getCachedQuotes as jest.Mock).mockResolvedValue(mockQuotes);

    render(<CachedQuotesPage />);

    await waitFor(() => {
      // Procura na tabela para evitar duplicidade com o rodapé
      const table = screen.getByRole('table');
      expect(within(table).getByText('PETR4')).toBeInTheDocument();
      expect(within(table).getByText('VALE3')).toBeInTheDocument();
    });

    expect(screen.getByText(/35,50/)).toBeInTheDocument();
    expect(screen.getByText(/70,20/)).toBeInTheDocument();
  });

  it('deve mostrar mensagem de erro quando a busca falha', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (marketService.getCachedQuotes as jest.Mock).mockRejectedValue(new Error('Falha na API'));

    render(<CachedQuotesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar cotações do cache/i)).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  it('deve permitir atualizar um ativo específico', async () => {
    (marketService.getCachedQuotes as jest.Mock).mockResolvedValue(mockQuotes);
    (marketService.requestQuoteUpdate as jest.Mock).mockResolvedValue({ symbol: 'AAPL', price: 150.0, time: new Date().toISOString() });

    render(<CachedQuotesPage />);

    const input = screen.getByPlaceholderText(/Ex: PETR4, VALE3/i);
    const button = screen.getByText(/Atualizar Ativo/i);

    fireEvent.change(input, { target: { value: 'AAPL' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(marketService.requestQuoteUpdate).toHaveBeenCalledWith('AAPL');
    });
  });
});
