package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"ingestion-service/internal/model"
)

// MockQuoteService é um mock para a interface QuoteService
type MockQuoteService struct {
	GetQuoteFunc         func(ctx context.Context, symbol string) (*model.Quote, error)
	GetAllQuotesFunc     func(ctx context.Context) ([]*model.Quote, error)
	ForceUpdateQuoteFunc func(ctx context.Context, symbol string) (*model.Quote, error)
}

func (m *MockQuoteService) GetQuote(ctx context.Context, symbol string) (*model.Quote, error) {
	return m.GetQuoteFunc(ctx, symbol)
}

func (m *MockQuoteService) GetAllQuotes(ctx context.Context) ([]*model.Quote, error) {
	return m.GetAllQuotesFunc(ctx)
}

func (m *MockQuoteService) ForceUpdateQuote(ctx context.Context, symbol string) (*model.Quote, error) {
	return m.ForceUpdateQuoteFunc(ctx, symbol)
}

func TestQuoteHandler(t *testing.T) {
	mockSvc := &MockQuoteService{
		GetQuoteFunc: func(ctx context.Context, symbol string) (*model.Quote, error) {
			if symbol == "PETR4" {
				return &model.Quote{Symbol: "PETR4", Price: 30.0}, nil
			}
			return nil, errors.New("not found")
		},
	}

	handler := QuoteHandler(mockSvc)

	t.Run("sucesso ao buscar cotação", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/quote?symbol=PETR4", nil)
		rr := httptest.NewRecorder()

		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("esperava status 200, recebeu %d", rr.Code)
		}

		var quote model.Quote
		json.Unmarshal(rr.Body.Bytes(), &quote)
		if quote.Symbol != "PETR4" {
			t.Errorf("esperava PETR4, recebeu %s", quote.Symbol)
		}
	})

	t.Run("erro quando símbolo não é passado", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/quote", nil)
		rr := httptest.NewRecorder()

		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusBadRequest {
			t.Errorf("esperava status 400, recebeu %d", rr.Code)
		}
	})
}

func TestUpdateQuoteHandler(t *testing.T) {
	mockSvc := &MockQuoteService{
		ForceUpdateQuoteFunc: func(ctx context.Context, symbol string) (*model.Quote, error) {
			return &model.Quote{Symbol: symbol, Price: 100.0}, nil
		},
	}

	handler := UpdateQuoteHandler(mockSvc)

	t.Run("sucesso no post com json", func(t *testing.T) {
		body := `{"symbol": "VALE3"}`
		req := httptest.NewRequest("POST", "/api/quote", strings.NewReader(body))
		rr := httptest.NewRecorder()

		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("esperava status 200, recebeu %d", rr.Code)
		}
	})
}
