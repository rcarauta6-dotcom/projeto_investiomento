package repository

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

type BcbRate struct {
	Date  string  `json:"data"`
	Value float64 `json:"valor"`
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

func (r *BcbRepository) getRate(serieCode string) (*BcbRate, error) {
	url := fmt.Sprintf("%s/bcdata.sgs.%s/dados?formato=json", r.baseURL, serieCode)
	resp, err := r.client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var bcbResp []struct {
		Data  string `json:"data"`
		Valor string `json:"valor"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&bcbResp); err != nil {
		return nil, err
	}

	if len(bcbResp) == 0 {
		return nil, fmt.Errorf("nenhum dado retornado do BCB para serie %s", serieCode)
	}

	latest := bcbResp[len(bcbResp)-1]
	
	val, err := strconv.ParseFloat(latest.Valor, 64)
	if err != nil {
		return nil, err
	}

	return &BcbRate{
		Date:  latest.Data,
		Value: val,
	}, nil
}

func (r *BcbRepository) GetSelicRate() (*BcbRate, error) {
	return r.getRate("11")
}

func (r *BcbRepository) GetCDIRate() (*BcbRate, error) {
	return r.getRate("12")
}

func (r *BcbRepository) GetIPCA12mRate() (*BcbRate, error) {
	return r.getRate("433")
}