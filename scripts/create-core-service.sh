#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_DIR="core-service"
PROJECT_ROOT="$ROOT_DIR/$PROJECT_DIR"
PACKAGE_DIR="src/main/java/com/example/core"
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
    <artifactId>core-service</artifactId>
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
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

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

cat > "$PROJECT_ROOT/$PACKAGE_DIR/CoreServiceApplication.java" <<'EOF'
package com.example.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CoreServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CoreServiceApplication.class, args);
    }
}
EOF

cat > "$PROJECT_ROOT/$PACKAGE_DIR/HealthController.java" <<'EOF'
package com.example.core;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/core")
public class HealthController {

    @GetMapping("/health")
    public String health() {
        return "core-service ok";
    }
}
EOF

cat > "$PROJECT_ROOT/$RESOURCE_DIR/application.yml" <<'EOF'
server:
  port: 8081

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
EOF

cat <<'EOF'
Core service criado em $PROJECT_ROOT
Próximo passo:
  cd $PROJECT_ROOT
  mvn spring-boot:run
EOF
