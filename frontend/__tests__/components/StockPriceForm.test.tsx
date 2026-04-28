import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StockPriceForm from '../../src/components/StockPriceForm';
import * as marketService from '../../src/services/market';

jest.mock('../../src/services/market');

const mockResponse = {
  ticker: 'PETR4',
  preco_atual: 35.8,
  variacao_diaria: '+1.5%',
};

describe('StockPriceForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input and button', () => {
    render(<StockPriceForm />);
    expect(screen.getByPlaceholderText('Ex: VALE3')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });

  it('calls getStockPrice on submit and shows result', async () => {
    (marketService.getStockPrice as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<StockPriceForm />);
    
    const input = screen.getByPlaceholderText('Ex: VALE3');
    fireEvent.change(input, { target: { value: 'PETR4' } });
    
    fireEvent.click(screen.getByText('Buscar'));

    await waitFor(() => {
      expect(screen.getByText(/35,8/)).toBeInTheDocument();
      expect(screen.getByText(/\+1\.5%/)).toBeInTheDocument();
    });
    expect(marketService.getStockPrice).toHaveBeenCalledWith('PETR4');
  });

  it('shows error when request fails', async () => {
    (marketService.getStockPrice as jest.Mock).mockRejectedValueOnce(new Error('API error'));

    render(<StockPriceForm />);
    
    const input = screen.getByPlaceholderText('Ex: VALE3');
    fireEvent.change(input, { target: { value: 'INVALID' } });
    
    fireEvent.click(screen.getByText('Buscar'));

    await waitFor(() => {
      expect(screen.getByText('Ativo não encontrado.')).toBeInTheDocument();
    });
  });
});
