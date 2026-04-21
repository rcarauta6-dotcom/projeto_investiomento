package com.example.gateway.filter;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class HostFilter implements GlobalFilter, Ordered {

    // O valor que sua aplicação vai validar
    private static final String ALLOWED_APP_ID = "meu-app-autorizado";
    private static final String CUSTOM_HEADER = "X-Custom-Host";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // Permitir requisições OPTIONS (CORS preflight) sem validar o header
        if (org.springframework.http.HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }

        // Buscamos o header customizado em vez do 'Host' nativo do protocolo
        String customHost = exchange.getRequest().getHeaders().getFirst(CUSTOM_HEADER);

        if (customHost == null || !customHost.equals(ALLOWED_APP_ID)) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }
        
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return HIGHEST_PRECEDENCE;
    }
}