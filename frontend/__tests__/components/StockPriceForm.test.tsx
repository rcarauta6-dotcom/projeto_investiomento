import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StockPriceForm from '../src/components/StockPriceForm';
import * as marketService from '../src/services/market';

jest.mock('../src/services/market');

const mockResponse = {
  ticker: 'PETR4',
  preco_atual: 35.8,
  variacao_diaria: '+1.5%',
};

describe('StockPriceForm', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
  });

  afterAll(() => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it('renders input and button', () => {
    render(<StockPriceForm />);
    expect(screen.getByPlaceholderText('Digite o ticker...')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });

  it('calls getStockPrice on submit and shows result', async () => {
    (marketService.getStockPrice as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<StockPriceForm />);
    fireEvent.click(screen.getByText('Buscar'));

    await waitFor(() => {
      expect(screen.getByText(/35.8/)).toBeInTheDocument();
      expect(screen.getByText(/\+1.5%/)).toBeInTheDocument();
    });
    expect(marketService.getStockPrice).toHaveBeenCalledWith('PETR4');
  });

  it('shows error when request fails', async () => {
    (marketService.getStockPrice as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<StockPriceForm />);
    fireEvent.click(screen.getByText('Buscar'));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});