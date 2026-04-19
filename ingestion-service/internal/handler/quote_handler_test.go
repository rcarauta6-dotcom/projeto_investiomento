package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"ingestion-service/internal/model"
)

// mockService implementa QuoteService
type mockService struct {
	mockQuote *model.Quote
	mockErr   error
}

func (m *mockService) GetQuote(ctx context.Context, symbol string) (*model.Quote, error) {
	return m.mockQuote, m.mockErr
}

func TestQuoteHandler_Success(t *testing.T) {
	// Arrange
	mockSvc := &mockService{
		mockQuote: &model.Quote{Symbol: "ITUB4", Price: 34.12},
		mockErr:   nil,
	}
	req := httptest.NewRequest(http.MethodGet, "/api/quote?symbol=ITUB4", nil)
	rr := httptest.NewRecorder()

	// Act
	handler := QuoteHandler(mockSvc)
	handler.ServeHTTP(rr, req)

	// Assert
	if rr.Code != http.StatusOK {
		t.Errorf("esperava status 200, recebeu %v", rr.Code)
	}

	var q model.Quote
	json.NewDecoder(rr.Body).Decode(&q)
	if q.Symbol != "ITUB4" || q.Price != 34.12 {
		t.Errorf("resposta inesperada: %+v", q)
	}
}

func TestQuoteHandler_MissingSymbol_Returns400(t *testing.T) {
	// Arrange: Sem query param
	req := httptest.NewRequest(http.MethodGet, "/api/quote", nil) 
	rr := httptest.NewRecorder()
	mockSvc := &mockService{}

	// Act
	handler := QuoteHandler(mockSvc)
	handler.ServeHTTP(rr, req)

	// Assert
	if rr.Code != http.StatusBadRequest {
		t.Errorf("esperava status 400, recebeu %v", rr.Code)
	}
}

func TestQuoteHandler_InvalidPrice_Returns422(t *testing.T) {
	// Arrange
	mockSvc := &mockService{
		mockQuote: nil,
		mockErr:   errors.New("invalid price received"),
	}
	req := httptest.NewRequest(http.MethodGet, "/api/quote?symbol=ERROR", nil)
	rr := httptest.NewRecorder()

	// Act
	handler := QuoteHandler(mockSvc)
	handler.ServeHTTP(rr, req)

	// Assert
	if rr.Code != http.StatusUnprocessableEntity {
		t.Errorf("esperava status 422, recebeu %v", rr.Code)
	}
}