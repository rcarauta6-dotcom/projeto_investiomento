package repository

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
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
	endpoint := fmt.Sprintf("%s/quote/%s?token=%s", r.baseURL, url.PathEscape(symbol), r.token)
	resp, err := r.client.Get(endpoint)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
// ...

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("erro api: %d", resp.StatusCode)
	}

	var brapiResp BrapiResponse
	if err := json.NewDecoder(resp.Body).Decode(&brapiResp); err != nil {
		return nil, err
	}

	if len(brapiResp.Results) == 0 {
		return nil, fmt.Errorf("ticker não encontrado")
	}

	return &model.Quote{
		Symbol: brapiResp.Results[0].Symbol,
		Price:  brapiResp.Results[0].Price,
		Time:   time.Now().Format(time.RFC3339),
	}, nil
}