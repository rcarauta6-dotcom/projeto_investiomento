package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"ingestion-service/internal/handler"
	"ingestion-service/internal/infrastructure"
	"ingestion-service/internal/repository"
	"ingestion-service/internal/service"

	"github.com/joho/godotenv"
)

func init() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}
}

func main() {
	// Load configuration from environment variables
	redisAddr := getEnv("REDIS_ADDR", "localhost:6379")
	redisPass := getEnv("REDIS_PASSWORD", "")
	kafkaBrokers := []string{getEnv("KAFKA_BROKERS", "localhost:9092")}
	kafkaTopicQuotes := "market-quotes"
	kafkaTopicNews := "market-news"
	brapiToken := getEnv("BRAPI_TOKEN", "")
	aiServiceURL := getEnv("AI_SERVICE_URL", "http://localhost:8084")
	coreServiceURL := getEnv("CORE_SERVICE_URL", "http://localhost:8081")

	// Validate required environment variables
	if brapiToken == "" {
		log.Fatal("BRAPI_TOKEN environment variable is required")
	}
	if redisPass == "" {
		log.Fatal("REDIS_PASSWORD environment variable is required")
	}

	// 1. Inicializar Infraestrutura
	redisClient := infrastructure.NewRedisClient(redisAddr, redisPass)
	kafkaProducerQuotes := infrastructure.NewKafkaProducer(kafkaBrokers, kafkaTopicQuotes)
	kafkaProducerNews := infrastructure.NewKafkaProducer(kafkaBrokers, kafkaTopicNews)
	defer kafkaProducerQuotes.Close()
	defer kafkaProducerNews.Close()

	// 2. Repositórios
	brapiRepo := repository.NewBrapiRepository("https://brapi.dev/api", brapiToken)
	bcbRepo := repository.NewBcbRepository("https://api.bcb.gov.br/dados/serie")
	yahooRepo := repository.NewYahooRepository()

	// 3. Serviço
	ingestionSvc := service.NewIngestionService(brapiRepo, redisClient, kafkaProducerQuotes)

	// Crawler de Notícias
	newsCrawler := service.NewNewsCrawler(kafkaProducerNews, redisClient, kafkaTopicNews)
	newsCrawler.Start(context.Background(), 30*time.Minute)

	// 4. Mux/Roteador
	mux := http.NewServeMux()

	// Endpoints base
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "ingestion-service ok")
	})
	mux.HandleFunc("/api/ingestion/ping", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "pong")
	})

	// Taxas Macro
	mux.HandleFunc("/api/v1/market/fixed-income/rates", func(w http.ResponseWriter, r *http.Request) {
		selic, _ := bcbRepo.GetSelicRate()
		cdi, _ := bcbRepo.GetCDIRate()
		ipca, _ := bcbRepo.GetIPCA12mRate()

		res := map[string]interface{}{
			"selic":      selic.Value,
			"cdi":        cdi.Value,
			"ipca_12m":   ipca.Value,
			"updated_at": time.Now().Format(time.RFC3339),
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(res)
	})

	// Notícias
	mux.HandleFunc("/api/v1/market/news", func(w http.ResponseWriter, r *http.Request) {
		news, err := redisClient.Get(r.Context(), "latest_market_news")
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte("[]"))
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(news))
	})

	// Histórico de Cotações (Yahoo Finance)
	mux.HandleFunc("/api/v1/market/history", func(w http.ResponseWriter, r *http.Request) {
		symbol := r.URL.Query().Get("symbol")
		if symbol == "" {
			http.Error(w, "symbol is required", http.StatusBadRequest)
			return
		}
		// default range: 5 days, interval: 1 hour
		rangeStr := r.URL.Query().Get("range")
		if rangeStr == "" {
			rangeStr = "5d"
		}
		interval := r.URL.Query().Get("interval")
		if interval == "" {
			interval = "1h"
		}

		data, err := yahooRepo.GetHistory(symbol, interval, rangeStr)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	})

	// Interceptor para Análise de Portfólio
	mux.HandleFunc("/api/v1/market/portfolio/analyze", func(w http.ResponseWriter, r *http.Request) {
		log.Println("💼 Iniciando análise tática do portfólio...")

		portfolioResp, err := http.Get(coreServiceURL + "/api/v1/portfolio")
		if err != nil {
			http.Error(w, "Erro ao buscar portfólio no Core Service", http.StatusServiceUnavailable)
			return
		}
		defer portfolioResp.Body.Close()
		portfolioData, _ := io.ReadAll(portfolioResp.Body)

		payload := map[string]interface{}{
			"type":      "portfolio_analysis",
			"portfolio": json.RawMessage(portfolioData),
		}
		jsonPayload, _ := json.Marshal(payload)

		aiURL := fmt.Sprintf("%s/api/ai/chat", aiServiceURL)
		resp, err := http.Post(aiURL, "application/json", bytes.NewBuffer(jsonPayload))
		if err != nil {
			http.Error(w, "IA indisponível", http.StatusServiceUnavailable)
			return
		}
		defer resp.Body.Close()

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	})

	// Proxy/Interceptor para o AI Service Chat
	mux.HandleFunc("/api/ingestion/ai/chat", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		log.Println("🤖 Ingestion Service interceptando chamada para IA...")
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error reading body", http.StatusInternalServerError)
			return
		}
		aiURL := fmt.Sprintf("%s/api/ai/chat", aiServiceURL)
		resp, err := http.Post(aiURL, "application/json", bytes.NewBuffer(body))
		if err != nil {
			http.Error(w, fmt.Sprintf("AI Service unreachable: %v", err), http.StatusServiceUnavailable)
			return
		}
		defer resp.Body.Close()
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	})

	// Endpoint de Cotações (MVC)
	mux.HandleFunc("/api/quote", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			handler.UpdateQuoteHandler(ingestionSvc)(w, r)
		} else {
			handler.QuoteHandler(ingestionSvc)(w, r)
		}
	})
	mux.HandleFunc("/api/quotes/cached", handler.ListQuotesHandler(ingestionSvc))

	addr := getEnv("SERVER_PORT", ":8082")
	log.Printf("📡 ingestion-service rodando em %s", addr)
	log.Printf("📦 Redis conectado em %s", redisAddr)
	log.Printf("🚀 Kafka pronto nos tópicos %s, %s", kafkaTopicQuotes, kafkaTopicNews)
	log.Printf("🤖 AI Service configurado em %s", aiServiceURL)
	log.Printf("🔗 Core Service configurado em %s", coreServiceURL)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("falha ao iniciar server: %v", err)
	}
}

// getEnv returns the value of an environment variable or a default value if not set
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
