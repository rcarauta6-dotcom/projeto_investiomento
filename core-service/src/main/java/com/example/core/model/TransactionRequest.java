package com.example.core.model;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
/**
 * DTO for transaction request body.
 */
public class TransactionRequest {
    @NotBlank(message = "Ativo é obrigatório")
    private String ativo;

    @NotBlank(message = "Tipo (COMPRA/VENDA) é obrigatório")
    private String tipo;

    @NotNull
    @Positive
    private Integer quantidade;

    @NotNull
    @Positive
    private Double precoUnitario;

    @NotBlank
    private String dataOperacao;

    public String getAtivo() {
        return ativo;
    }
    public void setAtivo(String ativo) {
        this.ativo = ativo;
    }
    public String getTipo() {
        return tipo;
    }
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    public int getQuantidade() {
        return quantidade;
    }
    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }
    public double getPrecoUnitario() {
        return precoUnitario;
    }
    public void setPrecoUnitario(double precoUnitario) {
        this.precoUnitario = precoUnitario;
    }
    public String getDataOperacao() {
        return dataOperacao;
    }
    public void setDataOperacao(String dataOperacao) {
        this.dataOperacao = dataOperacao;
    }
}