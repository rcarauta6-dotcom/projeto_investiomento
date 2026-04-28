package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"ingestion-service/internal/handler"
	"ingestion-service/internal/infrastructure"
	"ingestion-service/internal/repository"
	"ingestion-service/internal/service"
)

func main() {
	// Configurações (Poderiam vir de variáveis de ambiente)
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}
	redisPass := os.Getenv("REDIS_PASSWORD")
	if redisPass == "" {
		redisPass = ""
	}

	kafkaBrokers := []string{os.Getenv("KAFKA_BROKERS")}
	if kafkaBrokers[0] == "" {
		kafkaBrokers = []string{"localhost:9092"}
	}
	kafkaTopic := "market-quotes"

	brapiToken := os.Getenv("BRAPI_TOKEN")
	if brapiToken == "" {
		brapiToken = "" // Token padrão fornecido
	}

	// 1. Inicializar Infraestrutura
	redisClient := infrastructure.NewRedisClient(redisAddr, redisPass)
	kafkaProducer := infrastructure.NewKafkaProducer(kafkaBrokers, kafkaTopic)
	defer kafkaProducer.Close()

	// 2. Repositório (API Brapi com Token)
	brapiRepo := repository.NewBrapiRepository("https://brapi.dev/api", brapiToken)

	// 3. Serviço (Injetando Repo, Cache e Kafka)
	ingestionSvc := service.NewIngestionService(brapiRepo, redisClient, kafkaProducer)

	// 4. Mux/Roteador
	mux := http.NewServeMux()

	// Endpoints base
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "ingestion-service ok")
	})
	mux.HandleFunc("/api/ingestion/ping", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "pong")
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

	addr := ":8082"
	log.Printf("📡 ingestion-service rodando em %s", addr)
	log.Printf("📦 Redis conectado em %s", redisAddr)
	log.Printf("🚀 Kafka pronto no tópico %s", kafkaTopic)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("falha ao iniciar server: %v", err)
	}
}
