package repository

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestBrapiRepository_GetQuote(t *testing.T) {
	// Cria um servidor de teste para simular a API externa
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := BrapiResponse{
			Results: []struct {
				Symbol string  `json:"symbol"`
				Price  float64 `json:"regularMarketPrice"`
			}{
				{Symbol: "PETR4", Price: 35.50},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	repo := NewBrapiRepository(server.URL, "fake-token")

	t.Run("sucesso ao buscar da API simulada", func(t *testing.T) {
		quote, err := repo.GetQuote("PETR4")
		if err != nil {
			t.Fatalf("não esperava erro: %v", err)
		}

		if quote.Symbol != "PETR4" {
			t.Errorf("esperava PETR4, recebeu %s", quote.Symbol)
		}

		if quote.Price != 35.50 {
			t.Errorf("esperava 35.50, recebeu %f", quote.Price)
		}
	})

	t.Run("erro quando API retorna 404", func(t *testing.T) {
		// Podemos criar outro servidor ou mudar o comportamento
		errorServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusNotFound)
		}))
		defer errorServer.Close()

		repoErr := NewBrapiRepository(errorServer.URL, "token")
		_, err := repoErr.GetQuote("ERRO")
		if err == nil {
			t.Error("esperava erro mas recebeu nil")
		}
	})
}
