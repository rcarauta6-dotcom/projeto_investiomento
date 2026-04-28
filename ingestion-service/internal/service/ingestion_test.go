package service

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"ingestion-service/internal/model"
)

// MockCache para testes
type MockCache struct {
	GetFunc func(ctx context.Context, key string) (string, error)
	SetFunc func(ctx context.Context, key string, value interface{}, expiration time.Duration) error
}

func (m *MockCache) Get(ctx context.Context, key string) (string, error) { return m.GetFunc(ctx, key) }
func (m *MockCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return m.SetFunc(ctx, key, value, expiration)
}
func (m *MockCache) GetAllQuotes(ctx context.Context) (map[string]string, error) { return nil, nil }

// MockProducer para testes
type MockProducer struct {
	PublishFunc func(ctx context.Context, key, value []byte) error
}

func (m *MockProducer) Publish(ctx context.Context, key, value []byte) error {
	return m.PublishFunc(ctx, key, value)
}

// MockRepo para testes
type MockRepo struct {
	GetQuoteFunc func(symbol string) (*model.Quote, error)
}

func (m *MockRepo) GetQuote(symbol string) (*model.Quote, error) { return m.GetQuoteFunc(symbol) }

func TestIngestionService_GetQuote_CacheHit(t *testing.T) {
	ctx := context.Background()
	expectedQuote := &model.Quote{Symbol: "PETR4", Price: 30.0}
	data, _ := json.Marshal(expectedQuote)

	cache := &MockCache{
		GetFunc: func(ctx context.Context, key string) (string, error) {
			return string(data), nil
		},
	}

	svc := NewIngestionService(nil, cache, nil)
	quote, err := svc.GetQuote(ctx, "PETR4")

	if err != nil {
		t.Errorf("não esperava erro, recebeu %v", err)
	}
	if quote.Symbol != "PETR4" {
		t.Errorf("esperava PETR4, recebeu %s", quote.Symbol)
	}
}

func TestIngestionService_GetQuote_CacheMiss(t *testing.T) {
	ctx := context.Background()
	
	cache := &MockCache{
		GetFunc: func(ctx context.Context, key string) (string, error) {
			return "", errors.New("miss")
		},
		SetFunc: func(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
			return nil
		},
	}

	repo := &MockRepo{
		GetQuoteFunc: func(symbol string) (*model.Quote, error) {
			return &model.Quote{Symbol: symbol, Price: 40.0}, nil
		},
	}

	producer := &MockProducer{
		PublishFunc: func(ctx context.Context, key, value []byte) error {
			return nil
		},
	}

	svc := NewIngestionService(repo, cache, producer)
	quote, err := svc.GetQuote(ctx, "VALE3")

	if err != nil {
		t.Errorf("não esperava erro, recebeu %v", err)
	}
	if quote.Price != 40.0 {
		t.Errorf("esperava preço 40.0, recebeu %f", quote.Price)
	}
}
