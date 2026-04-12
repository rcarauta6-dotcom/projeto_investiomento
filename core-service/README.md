# Core Service

Microserviço Java Spring Boot responsável pela lógica de portfólio e APIs do core.

## Como rodar

```bash
cd core-service
mvn spring-boot:run
```

## Endpoints iniciais

- GET /api/core/health -> retorna status do serviço

Ajuste a aplicação em src/main/resources/application.yml e adicione novas APIs em src/main/java/com/example/core.
