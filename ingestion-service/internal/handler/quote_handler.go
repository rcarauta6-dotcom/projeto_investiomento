package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"log"

	"ingestion-service/internal/model"
)

// QuoteService define o contrato que o Handler espera do Service.
type QuoteService interface {
	GetQuote(ctx context.Context, symbol string) (*model.Quote, error)
	GetAllQuotes(ctx context.Context) ([]*model.Quote, error)
	ForceUpdateQuote(ctx context.Context, symbol string) (*model.Quote, error)
}

// QuoteHandler retorna um http.HandlerFunc para buscar uma cotação específica (GET).
func QuoteHandler(svc QuoteService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		symbol := r.URL.Query().Get("symbol")
		if symbol == "" {
			http.Error(w, "query param 'symbol' is required", http.StatusBadRequest)
			return
		}

		quote, err := svc.GetQuote(r.Context(), symbol)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(quote)
	}
}

// UpdateQuoteHandler recebe um POST com o símbolo para forçar atualização.
func UpdateQuoteHandler(svc QuoteService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var symbol string

		// Tenta pegar do corpo JSON primeiro
		var req struct {
			Symbol string `json:"symbol"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err == nil && req.Symbol != "" {
			symbol = req.Symbol
		} else {
			// Se falhar o JSON, tenta pegar da query string (fallback)
			symbol = r.URL.Query().Get("symbol")
		}

		if symbol == "" {
			http.Error(w, "Símbolo é obrigatório (via JSON body ou query param)", http.StatusBadRequest)
			return
		}

		log.Printf("🔄 Solicitação de atualização forçada para: %s", symbol)
		quote, err := svc.ForceUpdateQuote(r.Context(), symbol)
		if err != nil {
			log.Printf("❌ Erro na atualização forçada: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(quote)
	}
}

// ListQuotesHandler retorna todas as cotações armazenadas no cache.
func ListQuotesHandler(svc QuoteService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		quotes, err := svc.GetAllQuotes(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(quotes)
	}
}