package com.example.core.portfolio;

import com.example.core.model.PortfolioPosition;
import com.example.core.model.PortfolioSummary;
import com.example.core.model.Transaction;
import com.example.core.model.TransactionRequest;
import com.example.core.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PortfolioServiceImpl implements PortfolioService {

    private final TransactionRepository transactionRepository;

    @Autowired
    public PortfolioServiceImpl(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Override
    public List<PortfolioPosition> getPortfolio() {
        // 1. Busca todas as transações do banco
        List<Transaction> allTransactions = transactionRepository.findAll();

        // 2. Agrupa por ticker (ex: PETR4, WEGE3)
        Map<String, List<Transaction>> groupedByTicker = allTransactions.stream()
                .collect(Collectors.groupingBy(Transaction::getTicker));

        // 3. Para cada grupo (ativo), calcula quantidade atual e preço médio
        return groupedByTicker.entrySet().stream().map(entry -> {
            String ticker = entry.getKey();
            List<Transaction> transactions = entry.getValue();

            int quantidadeAtual = 0;
            double somaCustosCompra = 0;
            int totalQuantidadeComprada = 0;

            for (Transaction t : transactions) {
                if ("COMPRA".equalsIgnoreCase(t.getTipo())) {
                    quantidadeAtual += t.getQuantidade();
                    totalQuantidadeComprada += t.getQuantidade();
                    somaCustosCompra += (t.getQuantidade() * t.getPrecoUnitario());
                } else if ("VENDA".equalsIgnoreCase(t.getTipo())) {
                    quantidadeAtual -= t.getQuantidade();
                    // Nota: No cálculo de Preço Médio para IR, a venda não altera o preço médio,
                    // apenas a quantidade. Por isso não mexemos na somaCustosCompra aqui.
                }
            }

            // Preço Médio = Total gasto nas compras / Total de cotas compradas
            double precoMedio = totalQuantidadeComprada > 0 ? 
                                somaCustosCompra / totalQuantidadeComprada : 0;

            return new PortfolioPosition(ticker, quantidadeAtual, precoMedio);
        })
        .filter(p -> p.getQuantidade() > 0) // Só retorna o que o usuário ainda possui em carteira
        .collect(Collectors.toList());
    }

    //TODO falta implementar renda fixa, rentabilidade mensal e distribuição de ativos
    @Override
    public PortfolioSummary getSummary() {
        List<PortfolioPosition> portfolio = getPortfolio();
        
        // Calcula o patrimônio total multiplicando a quantidade atual em carteira pelo preço médio
        double patrimonioTotal = portfolio.stream()
                .mapToDouble(p -> p.getQuantidade() * p.getPrecoMedio())
                .sum();

        PortfolioSummary summary = new PortfolioSummary();
        summary.setPatrimonio_total(patrimonioTotal);
        summary.setRentabilidade_mes_percentual(0.0); // Valor zerado, pois exigiria preços em tempo real

        PortfolioSummary.Distribution dist = new PortfolioSummary.Distribution();
        dist.setRenda_variavel(100.0); // Como a regra atual se baseia em ações, estamos simplificando para 100% Renda Variável
        dist.setRenda_fixa(0.0);
        summary.setDistribuicao(dist);

        return summary;
    }

    @Override
    public Transaction saveTransaction(TransactionRequest req) {
        Transaction t = new Transaction();
        t.setTicker(req.getAtivo());
        t.setTipo(req.getTipo());
        t.setQuantidade(req.getQuantidade());
        t.setPrecoUnitario(req.getPrecoUnitario());
        t.setDataOperacao(LocalDate.parse(req.getDataOperacao()));
        transactionRepository.save(t);
        return t;
    }

    @Override
    public Transaction updateTransaction(Long id, TransactionRequest req) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        
        t.setTicker(req.getAtivo());
        t.setTipo(req.getTipo());
        t.setQuantidade(req.getQuantidade());
        t.setPrecoUnitario(req.getPrecoUnitario());
        t.setDataOperacao(LocalDate.parse(req.getDataOperacao()));
        
        return transactionRepository.save(t);
    }

    @Override
    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found");
        }
        transactionRepository.deleteById(id);
    }
}