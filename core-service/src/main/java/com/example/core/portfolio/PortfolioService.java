package com.example.core.portfolio;

import java.util.List;

import com.example.core.model.PortfolioPosition;
import com.example.core.model.PortfolioSummary;
import com.example.core.model.Transaction;
import com.example.core.model.TransactionRequest;

/**
 * Service that provides access to the user's portfolio data.
 * The implementation is delegated to {@link PortfolioServiceImpl}.
 */
public interface PortfolioService {
    List<PortfolioPosition> getPortfolio();

    PortfolioSummary getSummary();
    
    Transaction saveTransaction(TransactionRequest req);

    Transaction updateTransaction(Long id, TransactionRequest req);
    
    void deleteTransaction(Long id);
}