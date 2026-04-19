package com.example.core.model;

/**
 * Represents a single holding in the user's portfolio.
 * Matches the JSON structure defined in apiInterna.md:
 * [
 *   { "ticker": "PETR4", "quantidade": 100, "preco_medio": 32.50 },
 *   ...
 ]
 */
public class PortfolioPosition {
    private final String ticker;
    private final int quantidade;
    private final double precoMedio;

    public PortfolioPosition(String ticker, int quantidade, double precoMedio) {
        this.ticker = ticker;
        this.quantidade = quantidade;
        this.precoMedio = precoMedio;
    }

    public String getTicker() {
        return ticker;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public double getPrecoMedio() {
        return precoMedio;
    }
}