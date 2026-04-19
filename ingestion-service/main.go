package main

import (
	"fmt"
	"log"
	"net/http"

	"ingestion-service/internal/handler"
	"ingestion-service/internal/repository"
	"ingestion-service/internal/service"
)

func main() {
	// 1. Repositório (API Brapi)
	// Passamos a URL base oficial. No teste, o httptest.NewServer cuidará disso.
	brapiRepo := repository.NewBrapiRepository("https://brapi.dev/api")
	
	// 2. Serviço (Regras de negócio)
	ingestionSvc := service.NewIngestionService(brapiRepo)

	// 3. Mux/Roteador
	mux := http.NewServeMux()

	// Endpoints base
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "ingestion-service ok")
	})
	mux.HandleFunc("/api/ingestion/ping", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "pong")
	})

	// Endpoint de Cotações (MVC)
	mux.HandleFunc("/api/quote", handler.QuoteHandler(ingestionSvc))

	addr := ":8082"
	log.Printf("📡 ingestion-service rodando em %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("falha ao iniciar server: %v", err)
	}
}