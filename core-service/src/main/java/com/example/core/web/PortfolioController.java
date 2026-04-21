package com.example.core.web;

import com.example.core.model.*;
import com.example.core.portfolio.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class PortfolioController {

    private final PortfolioService portfolioService;

    @Autowired
    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/portfolio")
    public ResponseEntity<List<PortfolioPosition>> getPortfolio() {
        return ResponseEntity.ok(portfolioService.getPortfolio());
    }

    
    @GetMapping("/portfolio/summary")
    public ResponseEntity<PortfolioSummary> getPortfolioSummary() {
       return ResponseEntity.ok(portfolioService.getSummary());
    }


    @PostMapping("/portfolio/transactions")
    public ResponseEntity<Transaction> registerTransaction(@Valid @RequestBody TransactionRequest request) {
        Transaction savedTransaction = portfolioService.saveTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTransaction);
    }


    @PutMapping("/portfolio/transactions/{transaction_id}")
    public ResponseEntity<Transaction> updateTransaction(
            @PathVariable("transaction_id") String transactionId, 
            @Valid @RequestBody TransactionRequest request) {
        Long idFormatado = Long.parseLong(transactionId);
        Transaction updatedTransaction = portfolioService.updateTransaction(idFormatado, request);
        return ResponseEntity.ok(updatedTransaction);
    }

    // está mockado
    @DeleteMapping("/portfolio/transactions/{transaction_id}")
    public ResponseEntity<String> deleteTransaction(@PathVariable("transaction_id") String transactionId) {
        Long idFormatado = Long.parseLong(transactionId);
        portfolioService.deleteTransaction(idFormatado);
        return ResponseEntity.noContent().build();
    }
}