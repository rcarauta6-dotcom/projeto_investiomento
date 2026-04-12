package main

import (
    "fmt"
    "log"
    "net/http"
)

func main() {
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "ingestion-service ok")
    })

    http.HandleFunc("/api/ingestion/ping", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "pong")
    })

    addr := ":8082"
    log.Printf("ingestion-service rodando em %s", addr)
    if err := http.ListenAndServe(addr, nil); err != nil {
        log.Fatalf("falha ao iniciar server: %v", err)
    }
}
