package com.example.gateway;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.io.IOException;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient(timeout = "5000")
@TestPropertySource(properties = {
    "spring.security.enabled=false"
})
class HostFilterIntegrationTest {

    private static MockWebServer mockBackEnd;

    @Autowired
    private WebTestClient webTestClient;

    private static final String CUSTOM_HEADER = "X-Custom-Host";
    private static final String ALLOWED_VALUE = "meu-app-autorizado";

    @BeforeAll
    static void setUp() throws IOException {
        mockBackEnd = new MockWebServer();
        mockBackEnd.start();
    }

    @DynamicPropertySource
    static void registerBackendProperties(DynamicPropertyRegistry registry) {
        registry.add("CORE_SERVICE_URL", () -> "http://localhost:" + mockBackEnd.getPort());
    }

    @AfterAll
    static void tearDown() throws IOException {
        mockBackEnd.shutdown();
    }

    @Test
    void whenHostIsAllowed_thenRequestIsForwarded() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(200).setBody("ok"));

        webTestClient.get()
                .uri("/api/v1/portfolio")
                .header(CUSTOM_HEADER, ALLOWED_VALUE)
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).isEqualTo("[]");
    }

    @Test
    void whenHostIsNotAllowed_thenForbidden() {
        webTestClient.get()
                .uri("/api/v1/portfolio")
                .header(CUSTOM_HEADER, "invasor")
                .exchange()
                .expectStatus().isForbidden();
    }

    @Test
    void whenAiHostIsAllowed_thenHealth() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(200).setBody("ok"));

        webTestClient.get()
                .uri("/api/core/health")
                .header(CUSTOM_HEADER, ALLOWED_VALUE)
                .exchange()
                .expectStatus().isOk();
    }

    @Test
    void whenHostIsAllowed_thenForwardPostTransaction() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(201));

        String json = """
                        {
                        "ativo": "WEGE3",
                        "tipo": "COMPRA",
                        "quantidade": 50,
                        "dataOperacao": "2026-04-20",
                        "precoUnitario": 35.50
                        }
                        """;

        webTestClient.post()
                .uri("/api/v1/portfolio/transactions")
                .header(CUSTOM_HEADER, ALLOWED_VALUE)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(json)
                .exchange()
                .expectStatus().isCreated();
    }

    @Test
    void whenHostIsNotAllowed_thenForbiddenPostTransaction() {
        webTestClient.post()
                .uri("/api/v1/portfolio/transactions")
                .header(CUSTOM_HEADER, "evil.com")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("{}")
                .exchange()
                .expectStatus().isForbidden();
    }

    @Test
    void whenHostIsAllowed_thenForwardDeleteTransaction() {
        mockBackEnd.enqueue(new MockResponse().setResponseCode(204));

        webTestClient.delete()
                .uri("/api/v1/portfolio/transactions/1")
                .header(CUSTOM_HEADER, ALLOWED_VALUE)
                .exchange()
                .expectStatus().isNoContent();
    }
}