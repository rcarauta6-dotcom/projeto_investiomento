#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_DIR="gateway"
PROJECT_ROOT="$ROOT_DIR/$PROJECT_DIR"
PACKAGE_DIR="src/main/java/com/example/gateway"
RESOURCE_DIR="src/main/resources"

if [ -d "$PROJECT_ROOT" ]; then
  echo "Erro: o diretório '$PROJECT_ROOT' já existe. Remova-o ou escolha outro nome."
  exit 1
fi

mkdir -p "$PROJECT_ROOT/$PACKAGE_DIR"
mkdir -p "$PROJECT_ROOT/$RESOURCE_DIR"

cat > "$PROJECT_ROOT/pom.xml" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>gateway</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <properties>
        <java.version>17</java.version>
        <spring-cloud.version>2023.0.4</spring-cloud.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
EOF

cat > "$PROJECT_ROOT/$PACKAGE_DIR/GatewayApplication.java" <<'EOF'
package com.example.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
EOF

cat > "$PROJECT_ROOT/$RESOURCE_DIR/application.yml" <<'EOF'
server:
  port: 8080

spring:
  cloud:
    gateway:
      routes:
        - id: core-service
          uri: http://localhost:8081
          predicates:
            - Path=/api/core/**
        - id: ai-service
          uri: http://localhost:8082
          predicates:
            - Path=/api/ai/**

management:
  endpoints:
    web:
      exposure:
        include: health,info
EOF

cat > "$PROJECT_ROOT/.gitignore" <<'EOF'
/target
/*.iml
/.idea
/.mvn
/mvnw
/mvnw.cmd
EOF

cat > "$PROJECT_ROOT/README.md" <<'EOF'
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
EOF

cat <<'EOF'
Gateway criado em $PROJECT_ROOT
Próximo passo:
  cd $PROJECT_ROOT
  ./mvnw spring-boot:run
EOF

