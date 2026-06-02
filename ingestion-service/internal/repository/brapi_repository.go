package repository

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
	"log"
	"ingestion-service/internal/model"
)

type BrapiResponse struct {
	Results []struct {
		Symbol string  `json:"symbol"`
		Price  float64 `json:"regularMarketPrice"`
	} `json:"results"`
}

type BrapiRepository struct {
	client  *http.Client
	baseURL string
	token   string
}

func NewBrapiRepository(baseURL, token string) *BrapiRepository {
	return &BrapiRepository{
		client:  &http.Client{Timeout: time.Second * 10},
		baseURL: baseURL,
		token:   token,
	}
}

func (r *BrapiRepository) GetQuote(symbol string) (*model.Quote, error) {
	endpoint := fmt.Sprintf("%s/quote/%s", r.baseURL, url.PathEscape(symbol))
	
	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar request: %v", err)
	}

	// Add Authorization header
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", r.token))

	// Add User-Agent to avoid being blocked by Cloudflare/WAF
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

	log.Printf("📡 Chamando BrAPI para símbolo %s via Header...", symbol)
	
	resp, err := r.client.Do(req)
	if err != nil {
		log.Printf("❌ Falha na conexão com BrAPI: %v", err)
		return nil, fmt.Errorf("falha de conexão com api externa: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("❌ BrAPI retornou erro %d para o ticker %s", resp.StatusCode, symbol)
		return nil, fmt.Errorf("api externa retornou erro: %d", resp.StatusCode)
	}

	var brapiResp BrapiResponse
	if err := json.NewDecoder(resp.Body).Decode(&brapiResp); err != nil {
		log.Printf("❌ Erro ao decodificar resposta da BrAPI: %v", err)
		return nil, fmt.Errorf("erro ao ler resposta da api: %v", err)
	}

	if len(brapiResp.Results) == 0 {
		log.Printf("⚠️ Ticker %s não encontrado nos resultados da BrAPI", symbol)
		return nil, fmt.Errorf("ticker %s não encontrado na BrAPI", symbol)
	}

	result := brapiResp.Results[0]
	return &model.Quote{
		Symbol: result.Symbol,
		Price:  result.Price,
		Time:   time.Now().Format(time.RFC3339),
	}, nil
}
