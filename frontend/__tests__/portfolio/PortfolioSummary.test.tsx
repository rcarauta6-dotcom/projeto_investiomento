import { render, screen, waitFor } from '@testing-library/react';
import PortfolioSummary from '../../src/app/portfolio/portfolio-summary/page';
import fetchMock from 'jest-fetch-mock';

const mockSummary = {
  patrimonio_total: 17750,
  rentabilidade_mes_percentual: 1.2,
  distribuicao: { renda_variavel: 18.3, renda_fixa: 81.7 },
};

describe('PortfolioSummary', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
  });

  afterAll(() => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it('displays loading state initially', () => {
    fetchMock.mockResponseOnce(() => new Promise(() => {})); // Nunca resolve
    render(<PortfolioSummary />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('renders the summary when data is fetched successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockSummary));

    render(<PortfolioSummary />);

    // Loading text should disappear
    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    // Check that the summary fields are present
    expect(screen.getByText(/R\$17.750/)).toBeInTheDocument();
    expect(screen.getByText(/1.2%/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /\d+\.?\d*% Renda Variável,\s*\d+\.?\d*% Renda Fixa/,
      ),
    ).toBeInTheDocument();
  });

  it('renders an error message when the request fails', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'));

    render(<PortfolioSummary />);

    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(/Network error/i),
    ).toBeInTheDocument();
  });
});
