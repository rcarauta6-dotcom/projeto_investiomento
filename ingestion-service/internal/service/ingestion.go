package service

import (
	"context"
	"time"
	"errors"
	"ingestion-service/internal/model"
	"ingestion-service/internal/repository"
)

type IngestionService struct {
	repo repository.QuoteRepository
}

// NewIngestionService creates a new ingestion service.
func NewIngestionService(repo repository.QuoteRepository) *IngestionService {
	return &IngestionService{repo: repo}
}

// GetQuote fetches a quote for the given symbol with a timeout.
func (s *IngestionService) GetQuote(ctx context.Context, symbol string) (*model.Quote, error) {
	// Context with timeout of 5 seconds to prevent hanging.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Delegate the repository call; business logic could be added here.
	quote, err := s.repo.GetQuote(symbol)
	if err != nil {
		return nil, err
	}
	// Additional validation could be added before returning.
	if quote.Price <= 0 {
		return nil, errors.New("invalid price received")
	}
	return quote, nil
}