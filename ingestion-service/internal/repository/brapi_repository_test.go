package repository

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

type mockResponse struct {
	Results []struct {
		Symbol string  `json:"symbol"`
		Price  float64 `json:"price"`
	} `json:"results"`
}

func TestGetQuote_ReturnsExpectedQuote(t *testing.T) {
	mockResults := mockResponse{
		Results: []struct {
			Symbol string  `json:"symbol"`
			Price  float64 `json:"price"`
		}{
			{Symbol: "PETR4", Price: 28.45},
		},
	}
	mockJSON, _ := json.Marshal(mockResults)

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(mockJSON)
	}))
	defer ts.Close()

	// CORREÇÃO: Usando o nome correto do construtor
	repo := NewBrapiRepository(ts.URL)

	quote, err := repo.GetQuote("PETR4")
	if err != nil {
		t.Fatalf("GetQuote retornou erro: %v", err)
	}

	if quote.Symbol != "PETR4" || quote.Price != 28.45 {
		t.Errorf("dados incorretos no quote: %+v", quote)
	}
}

func TestGetQuote_HandleHTTPError_ReturnsError(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	}))
	defer ts.Close()

	repo := NewBrapiRepository(ts.URL)
	_, err := repo.GetQuote("INVALID")

	if err == nil {
		t.Error("esperava erro para status 404")
	}
}

func TestGetQuote_Timeout_ReturnsError(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(200 * time.Millisecond) // Dorme mais que o timeout
	}))
	defer ts.Close()

	repo := NewBrapiRepository(ts.URL)
	repo.client.Timeout = time.Millisecond * 50 // Timeout curto

	// CORREÇÃO: GetQuote retorna dois valores (quote, err)
	_, err := repo.GetQuote("PETR4")

	if err == nil {
		t.Error("esperava erro de timeout")
	}
}