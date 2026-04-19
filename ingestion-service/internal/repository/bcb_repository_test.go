package repository

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

// TDD: O teste define como queremos que a arquitetura funcione antes dela existir.
func TestGetSelicRate_ReturnsExpectedRate(t *testing.T) {
	// Arrange: O BCB retorna um JSON com array de objetos: [{"data":"01/01/2024", "valor":"10.50"}]
	mockResponse := `[{"data":"05/10/2024","valor":"10.50"}]`
	
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/bcdata.sgs.11/dados" { // SGS endpoint 11 é a Selic Diária
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(mockResponse))
		}
	}))
	defer ts.Close()

	// Act: Invocaremos a estrutura que ainda criaremos (BcbRepository)
	repo := NewBcbRepository(ts.URL)
	rate, err := repo.GetSelicRate()

	// Assert
	if err != nil {
		t.Fatalf("não esperava erro: %v", err)
	}
	if rate.Value != 10.50 {
		t.Errorf("esperava taxa Selic de 10.50, recebeu %f", rate.Value)
	}
	if rate.Date != "05/10/2024" {
		t.Errorf("esperava data 05/10/2024, recebeu %s", rate.Date)
	}
}