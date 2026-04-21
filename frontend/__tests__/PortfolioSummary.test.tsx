import { render, screen, waitFor } from '@testing-library/react';
import PortfolioSummary from '../app/portfolio/portfolio-summary/page';
import * as api from '../lib/api';

// Mock the API module so we don't hit the real backend
jest.mock('../lib/api');

const mockSummary = {
  patrimonio_total: 17750,
  rentabilidade_mes_percentual: 1.2,
  distribuicao: { renda_variavel: 18.3, renda_fixa: 81.7 },
};

describe('PortfolioSummary', () => {
  // set the env variable used by the component
  beforeAll(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
  });

  afterAll(() => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it('displays loading state initially', () => {
    render(<PortfolioSummary />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('renders the summary when data is fetched successfully', async () => {
    // Mock fetch to resolve with the summary data
    (api.apiGet as jest.Mock).mockResolvedValueOnce(mockSummary);

    render(<PortfolioSummary />);

    // Loading text should disappear
    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    // Check that the summary fields are present
    expect(screen.getByText(/R\$17750/)).toBeInTheDocument();
    expect(screen.getByText(/1.2%/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /\d+% Renda Variável,\s*\d+% Renda Fixa/,
      ),
    ).toBeInTheDocument();
  });

  it('renders an error message when the request fails', async () => {
    (api.apiGet as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<PortfolioSummary />);

    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(/Network error/gi),
    ).toBeInTheDocument();
  });
});
