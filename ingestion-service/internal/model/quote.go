package model

// Quote represents a generic quote structure returned by external APIs.
type Quote struct {
	Symbol string  `json:"symbol"`
	Price  float64 `json:"price"`
	Time   string  `json:"timestamp"`
}