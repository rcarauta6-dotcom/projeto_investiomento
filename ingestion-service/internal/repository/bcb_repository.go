package repository

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

type SelicRate struct {
	Date  string
	Value float64
}

type BcbRepository struct {
	baseURL string
	client  *http.Client
}

func NewBcbRepository(baseURL string) *BcbRepository {
	return &BcbRepository{
		baseURL: baseURL,
		client:  &http.Client{Timeout: 5 * time.Second},
	}
}

func (r *BcbRepository) GetSelicRate() (*SelicRate, error) {
	url := fmt.Sprintf("%s/bcdata.sgs.11/dados?formato=json", r.baseURL)
	resp, err := r.client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// O BCB retorna struct via array: [{"data":"...","valor":"..."}]
	var bcbResp []struct {
		Data  string `json:"data"`
		Valor string `json:"valor"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&bcbResp); err != nil {
		return nil, err
	}

	if len(bcbResp) == 0 {
		return nil, fmt.Errorf("nenhum dado retornado do BCB")
	}

	// Pegamos o último registro (o mais atual)
	latest := bcbResp[len(bcbResp)-1]
	
	// String to Float
	val, err := strconv.ParseFloat(latest.Valor, 64)
	if err != nil {
		return nil, err
	}

	return &SelicRate{
		Date:  latest.Data,
		Value: val,
	}, nil
}