package com.example.core.web;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.core.model.PortfolioPosition;
import com.example.core.model.PortfolioSummary;
import com.example.core.model.Transaction;
import com.example.core.portfolio.PortfolioService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

@WebMvcTest(PortfolioController.class)
class PortfolioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PortfolioService portfolioService;

   @Test
    @DisplayName("Deve retornar a lista de ativos conforme contrato")
    void getPortfolio_Success() throws Exception {
        PortfolioPosition p1 = new PortfolioPosition("PETR4", 100, 32.50);
        when(portfolioService.getPortfolio()).thenReturn(List.of(p1));

        mockMvc.perform(get("/api/v1/portfolio")
                .header(HttpHeaders.AUTHORIZATION, "Bearer token123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].ticker").value("PETR4"))
                .andExpect(jsonPath("$[0].quantidade").value(100));
    }

    @Test
    @DisplayName("Deve retornar 400 se o header Authorization estiver ausente")
    void getPortfolio_NoAuth_BadRequest() throws Exception {
        mockMvc.perform(get("/api/v1/portfolio"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar o resumo financeiro dinâmico")
    void getSummary_Success() throws Exception {
        PortfolioSummary summary = new PortfolioSummary();
        summary.setPatrimonio_total(15500.00);
        summary.setRentabilidade_mes_percentual(0.0);
        
        PortfolioSummary.Distribution dist = new PortfolioSummary.Distribution();
        dist.setRenda_variavel(100.0);
        dist.setRenda_fixa(0.0);
        summary.setDistribuicao(dist);

        when(portfolioService.getSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/v1/portfolio/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patrimonio_total").value(15500.00))
                .andExpect(jsonPath("$.distribuicao.renda_variavel").value(100.0))
                .andExpect(jsonPath("$.distribuicao.renda_fixa").value(0.0));
    }

    @Test
    @DisplayName("Deve registrar transação válida e retornar 201 Created com a transação")
    void postTransaction_Success() throws Exception {
        String json = "{\"ativo\":\"WEGE3\",\"tipo\":\"COMPRA\",\"quantidade\":50,\"precoUnitario\":38.90,\"dataOperacao\":\"2023-10-25\"}";

        Transaction mockTx = new Transaction();
        mockTx.setId(1L);
        mockTx.setTicker("WEGE3");
        mockTx.setTipo("COMPRA");
        mockTx.setQuantidade(50);
        mockTx.setPrecoUnitario(38.90);
        mockTx.setDataOperacao(LocalDate.of(2023, 10, 25));

        when(portfolioService.saveTransaction(any())).thenReturn(mockTx);

        mockMvc.perform(post("/api/v1/portfolio/transactions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.ticker").value("WEGE3"))
                .andExpect(jsonPath("$.quantidade").value(50));
    }

    @Test
    @DisplayName("Deve atualizar transação existente e retornar 200 OK")
    void putTransaction_Success() throws Exception {
        String json = "{\"ativo\":\"WEGE3\",\"tipo\":\"COMPRA\",\"quantidade\":60,\"precoUnitario\":38.90,\"dataOperacao\":\"2023-10-25\"}";

        Transaction mockTx = new Transaction();
        mockTx.setId(1L);
        mockTx.setTicker("WEGE3");
        mockTx.setQuantidade(60);

        when(portfolioService.updateTransaction(eq(1L), any())).thenReturn(mockTx);

        mockMvc.perform(put("/api/v1/portfolio/transactions/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantidade").value(60));
    }

    @Test
    @DisplayName("Deve deletar transação existente e retornar 204 No Content")
    void deleteTransaction_Success() throws Exception {
        doNothing().when(portfolioService).deleteTransaction(1L);

        mockMvc.perform(delete("/api/v1/portfolio/transactions/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer token"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Deve retornar 400 ao tentar registrar transação sem quantidade")
    void postTransaction_Invalid_BadRequest() throws Exception {
        String json = "{\"ativo\":\"WEGE3\",\"tipo\":\"COMPRA\"}"; // faltando campos

        mockMvc.perform(post("/api/v1/portfolio/transactions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }
}
