package service

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/mmcdole/gofeed"
)

type NewsItem struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Link        string    `json:"link"`
	PublishedAt time.Time `json:"published_at"`
	Source      string    `json:"source"`
}

type NewsCrawler struct {
	kafka  MessageProducer
	cache  Cache
	fp     *gofeed.Parser
	feeds  map[string]string
	topic  string
}

func NewNewsCrawler(kafka MessageProducer, cache Cache, topic string) *NewsCrawler {
	return &NewsCrawler{
		kafka: kafka,
		cache: cache,
		fp:    gofeed.NewParser(),
		topic: topic,
		feeds: map[string]string{
			"InfoMoney": "https://www.infomoney.com.br/feed/",
			"Investing": "https://br.investing.com/rss/news_25.rss",
		},
	}
}

func (nc *NewsCrawler) Start(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	log.Printf("📰 News Crawler iniciado. Intervalo: %v", interval)

	go func() {
		for {
			select {
			case <-ticker.C:
				nc.crawl(ctx)
			case <-ctx.Done():
				ticker.Stop()
				return
			}
		}
	}()
	
	// Primeira execução imediata
	nc.crawl(ctx)
}

func (nc *NewsCrawler) crawl(ctx context.Context) {
	var allNews []NewsItem
	for name, url := range nc.feeds {
		log.Printf("📡 Buscando notícias de %s...", name)
		feed, err := nc.fp.ParseURLWithContext(url, ctx)
		if err != nil {
			log.Printf("❌ Erro ao buscar feed de %s: %v", name, err)
			continue
		}

		for _, item := range feed.Items {
			if item.PublishedParsed != nil && time.Since(*item.PublishedParsed) > 24*time.Hour {
				continue
			}

			news := NewsItem{
				Title:       item.Title,
				Description: item.Description,
				Link:        item.Link,
				PublishedAt: *item.PublishedParsed,
				Source:      name,
			}

			allNews = append(allNews, news)

			data, _ := json.Marshal(news)
			err := nc.kafka.Publish(ctx, []byte(news.Link), data)
			if err != nil {
				log.Printf("❌ Erro ao publicar notícia no Kafka: %v", err)
			}
		}
		log.Printf("✅ %s: %d notícias processadas", name, len(feed.Items))
	}

	// Salvar as 10 mais recentes no Redis para o Dashboard
	if len(allNews) > 0 {
		// Ordenar por data (simplificado)
		if len(allNews) > 10 {
			allNews = allNews[:10]
		}
		newsData, _ := json.Marshal(allNews)
		nc.cache.Set(ctx, "latest_market_news", newsData, 1*time.Hour)
	}
}
