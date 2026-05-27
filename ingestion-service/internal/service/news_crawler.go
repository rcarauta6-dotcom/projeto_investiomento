package service

import (
	"context"
	"encoding/json"
	"log"
	"time"
)

type NewsCrawler struct {
	kafka MessageProducer
	cache Cache
	topic string
}

func NewNewsCrawler(kafka MessageProducer, cache Cache, topic string) *NewsCrawler {
	return &NewsCrawler{
		kafka: kafka,
		cache: cache,
		topic: topic,
	}
}

func (c *NewsCrawler) Start(ctx context.Context, interval time.Duration) {
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				c.crawl(ctx)
			}
		}
	}()
	
	// Executa uma vez no início
	go c.crawl(ctx)
}

func (c *NewsCrawler) crawl(ctx context.Context) {
	log.Printf("📡 Buscando notícias de mercado...")
	
	// Mock de notícias para exemplo
	news := []map[string]string{
		{"title": "Bolsa fecha em alta puxada por commodities", "url": "https://exemplo.com/1"},
		{"title": "Dólar recua com cenário externo favorável", "url": "https://exemplo.com/2"},
	}

	data, _ := json.Marshal(news)
	
	// Salvar no Cache com prefixo
	c.cache.Set(ctx, "news:latest_market_news", string(data), time.Hour*24)

	// Publicar no Kafka
	c.kafka.Publish(ctx, []byte("latest_news"), data)
	log.Printf("✅ Notícias atualizadas e publicadas no Kafka")
}
