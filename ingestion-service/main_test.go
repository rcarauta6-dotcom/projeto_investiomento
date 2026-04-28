package main

import (
	"testing"
)

func TestSanity(t *testing.T) {
	// Apenas um teste para garantir que o ambiente de teste funciona
	if 1+1 != 2 {
		t.Error("Matemática quebrou")
	}
}
