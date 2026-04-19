package com.example.core.model;

public class PortfolioSummary {
    private double patrimonio_total;
    private double rentabilidade_mes_percentual;
    private Distribution distribuicao;

    public static class Distribution {
        private double renda_variavel;
        private double renda_fixa;

        // Getters e Setters
        public double getRenda_variavel() { return renda_variavel; }
        public void setRenda_variavel(double renda_variavel) { this.renda_variavel = renda_variavel; }
        public double getRenda_fixa() { return renda_fixa; }
        public void setRenda_fixa(double renda_fixa) { this.renda_fixa = renda_fixa; }
    }

    // Getters e Setters
    public double getPatrimonio_total() { return patrimonio_total; }
    public void setPatrimonio_total(double patrimonio_total) { this.patrimonio_total = patrimonio_total; }
    public double getRentabilidade_mes_percentual() { return rentabilidade_mes_percentual; }
    public void setRentabilidade_mes_percentual(double rentabilidade_mes_percentual) { this.rentabilidade_mes_percentual = rentabilidade_mes_percentual; }
    public Distribution getDistribuicao() { return distribuicao; }
    public void setDistribuicao(Distribution distribuicao) { this.distribuicao = distribuicao; }    
}
