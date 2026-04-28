package service

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"time"

	"ingestion-service/internal/model"
	"ingestion-service/internal/repository"
)

// Cache define o contrato para o armazenamento temporário.
type Cache interface {
	Get(ctx context.Context, key string) (string, error)
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error
	GetAllQuotes(ctx context.Context) (map[string]string, error)
}

// MessageProducer define o contrato para envio de mensagens.
type MessageProducer interface {
	Publish(ctx context.Context, key, value []byte) error
}

type IngestionService struct {
	repo  repository.QuoteRepository
	cache Cache
	kafka MessageProducer
}

// NewIngestionService cria um novo serviço de ingestão.
func NewIngestionService(repo repository.QuoteRepository, cache Cache, kafka MessageProducer) *IngestionService {
	return &IngestionService{
		repo:  repo,
		cache: cache,
		kafka: kafka,
	}
}

// GetQuote fetches a quote, caches it, and publishes to Kafka.
func (s *IngestionService) GetQuote(ctx context.Context, symbol string) (*model.Quote, error) {
	// 1. Tentar buscar do Cache (Redis)
	cachedQuote, err := s.cache.Get(ctx, symbol)
	if err == nil {
		log.Printf("🔹 Cache hit para %s", symbol)
		var quote model.Quote
		if err := json.Unmarshal([]byte(cachedQuote), &quote); err == nil {
			return &quote, nil
		}
		log.Printf("⚠️ Erro ao desentalar cache para %s: %v", symbol, err)
	}

	return s.ForceUpdateQuote(ctx, symbol)
}

// ForceUpdateQuote fetches fresh data from external API, bypassing cache.
func (s *IngestionService) ForceUpdateQuote(ctx context.Context, symbol string) (*model.Quote, error) {
	// 2. Buscar da API Externa (Brapi/Outra)
	log.Printf("📡 Buscando %s na API externa (FORÇADO)...", symbol)
	quote, err := s.repo.GetQuote(symbol)
	if err != nil {
		log.Printf("❌ Erro ao buscar %s no repositório: %v", symbol, err)
		return nil, err
	}

	if quote.Price <= 0 {
		log.Printf("⚠️ Preço inválido para %s: %f", symbol, quote.Price)
		return nil, errors.New("preço inválido recebido")
	}

	log.Printf("✅ %s obtido com sucesso: R$ %.2f", symbol, quote.Price)

	// 3. Salvar no Cache
	quoteData, err := json.Marshal(quote)
	if err == nil {
		log.Printf("💾 Atualizando %s no Redis...", symbol)
		s.cache.Set(ctx, symbol, quoteData, time.Minute*5) 
	}

	// 4. Publicar no Kafka
	log.Printf("📤 Publicando %s no Kafka...", symbol)
	err = s.kafka.Publish(ctx, []byte(symbol), quoteData)
	if err != nil {
		log.Printf("❌ Erro ao publicar no Kafka: %v", err)
	}

	return quote, nil
}

// GetAllQuotes returns all quotes stored in Redis.
func (s *IngestionService) GetAllQuotes(ctx context.Context) ([]*model.Quote, error) {
	data, err := s.cache.GetAllQuotes(ctx)
	if err != nil {
		return nil, err
	}

	var quotes []*model.Quote
	for _, val := range data {
		var q model.Quote
		if err := json.Unmarshal([]byte(val), &q); err == nil {
			quotes = append(quotes, &q)
		}
	}
	return quotes, nil
}
