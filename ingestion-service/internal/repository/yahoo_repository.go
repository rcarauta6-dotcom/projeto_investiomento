package repository

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type HistoryData struct {
	Symbol string           `json:"symbol"`
	Prices []HistoricalPrice `json:"prices"`
}

type HistoricalPrice struct {
	Date  string  `json:"date"`
	Close float64 `json:"price"`
}

type YahooRepository struct {
	client *http.Client
}

func NewYahooRepository() *YahooRepository {
	return &YahooRepository{
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

func (r *YahooRepository) GetHistory(symbol string, interval string, rangeStr string) (*HistoryData, error) {
	// Yahoo Finance non-documented API
	// Example: https://query1.finance.yahoo.com/v8/finance/chart/PETR4.SA?range=5d&interval=1h
	
	url := fmt.Sprintf("https://query1.finance.yahoo.com/v8/finance/chart/%s?range=%s&interval=%s", symbol, rangeStr, interval)
	
	req, _ := http.NewRequest("GET", url, nil)
	// Add user agent to avoid being blocked
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

	resp, err := r.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("yahoo finance error: status %d", resp.StatusCode)
	}

	var yahooResp struct {
		Chart struct {
			Result []struct {
				Meta struct {
					Symbol string `json:"symbol"`
				} `json:"meta"`
				Timestamp []int64 `json:"timestamp"`
				Indicators struct {
					Quote []struct {
						Close []float64 `json:"close"`
					} `json:"quote"`
				} `json:"indicators"`
			} `json:"result"`
		} `json:"chart"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&yahooResp); err != nil {
		return nil, err
	}

	if len(yahooResp.Chart.Result) == 0 {
		return nil, fmt.Errorf("no results for symbol %s", symbol)
	}

	result := yahooResp.Chart.Result[0]
	history := &HistoryData{
		Symbol: result.Meta.Symbol,
		Prices: make([]HistoricalPrice, 0),
	}

	for i, ts := range result.Timestamp {
		if i < len(result.Indicators.Quote[0].Close) {
			price := result.Indicators.Quote[0].Close[i]
			if price > 0 {
				date := time.Unix(ts, 0).Format("2006-01-02 15:04")
				history.Prices = append(history.Prices, HistoricalPrice{
					Date:  date,
					Close: price,
				})
			}
		}
	}

	return history, nil
}
