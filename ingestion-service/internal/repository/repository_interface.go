package repository

import "ingestion-service/internal/model"

type QuoteRepository interface {
    GetQuote(symbol string) (*model.Quote, error)
}