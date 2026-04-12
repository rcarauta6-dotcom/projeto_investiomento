# Gateway

Projeto Spring Cloud Gateway responsável por roteamento entre frontend e microserviços.

## Como rodar

```bash
cd gateway
./mvnw spring-boot:run
```

## Rotas iniciais

- /api/core/** -> core-service
- /api/ai/** -> ai-service

Ajuste as URIs em src/main/resources/application.yml conforme sua infraestrutura.
