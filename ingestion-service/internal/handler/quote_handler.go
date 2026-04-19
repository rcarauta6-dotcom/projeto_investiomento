package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ingestion-service/internal/model"
)

// QuoteService define o contrato que o Handler espera do Service.
// Seguindo os princípios SOLID, a interface fica onde é usada.
type QuoteService interface {
	GetQuote(ctx context.Context, symbol string) (*model.Quote, error)
}

// QuoteHandler retorna um http.HandlerFunc para buscar cotações.
func QuoteHandler(svc QuoteService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. Extração de Parâmetros
		symbol := r.URL.Query().Get("symbol")
		if symbol == "" {
			http.Error(w, "query param 'symbol' is required", http.StatusBadRequest)
			return
		}

		// 2. Chamada da Camada de Serviço (Regras de Negócio)
		quote, err := svc.GetQuote(r.Context(), symbol)
		if err != nil {
			// Traduz erros de negócio para status HTTP apropriados
			if err.Error() == "invalid price received" {
				http.Error(w, err.Error(), http.StatusUnprocessableEntity)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// 3. Resposta JSON
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if err := json.NewEncoder(w).Encode(quote); err != nil {
			http.Error(w, "falha ao encodar resposta", http.StatusInternalServerError)
		}
	}
}