package service

import (
	"context"
	"errors"
	"testing"
	"time"

	"ingestion-service/internal/model"
)

// mockQuoteRepository simula o repositório de cotações para isolar a camada de serviço.
type mockQuoteRepository struct {
	mockQuote *model.Quote
	mockErr   error
}

func (m *mockQuoteRepository) GetQuote(symbol string) (*model.Quote, error) {
	return m.mockQuote, m.mockErr
}

func TestGetQuote_Success(t *testing.T) {
	// Arrange
	expectedQuote := &model.Quote{Symbol: "VALE3", Price: 65.50, Time: time.Now().Format(time.RFC3339)}
	repo := &mockQuoteRepository{mockQuote: expectedQuote, mockErr: nil}
	service := NewIngestionService(repo)

	// Act
	quote, err := service.GetQuote(context.Background(), "VALE3")

	// Assert
	if err != nil {
		t.Fatalf("não esperava erro, recebeu: %v", err)
	}
	if quote.Price != 65.50 {
		t.Errorf("esperava preço 65.50, recebeu %f", quote.Price)
	}
}

func TestGetQuote_InvalidPrice_ReturnsError(t *testing.T) {
	// Arrange: Repositório retorna um preço negativo (incomum, mas possível falha na API)
	invalidQuote := &model.Quote{Symbol: "OIBR3", Price: -1.50, Time: time.Now().Format(time.RFC3339)}
	repo := &mockQuoteRepository{mockQuote: invalidQuote, mockErr: nil}
	service := NewIngestionService(repo)

	// Act
	_, err := service.GetQuote(context.Background(), "OIBR3")

	// Assert
	if err == nil {
		t.Error("esperava erro por preço inválido, mas não recebeu nada")
	}
	if err.Error() != "invalid price received" {
		t.Errorf("esperava mensagem 'invalid price received', recebeu: %v", err.Error())
	}
}

func TestGetQuote_RepositoryError_ReturnsError(t *testing.T) {
	// Arrange: Simulando queda da API Brapi
	repo := &mockQuoteRepository{mockQuote: nil, mockErr: errors.New("timeout da api")}
	service := NewIngestionService(repo)

	// Act
	_, err := service.GetQuote(context.Background(), "PETR4")

	// Assert
	if err == nil {
		t.Error("esperava erro repassado do repositório, mas foi nulo")
	}
}