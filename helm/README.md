# Helm PostgreSQL

Scripts para instalar e remover PostgreSQL no Kubernetes usando Helm.

## Como usar

1. Torne os scripts executáveis:

```bash
cd /home/renato/Downloads/desenvolvimento/estudos/projeto_investimento/helm
chmod +x install-postgresql.sh uninstall-postgresql.sh
```

3. Instale PostgreSQL e pgAdmin básicos:

```bash
./install-postgresql.sh
```

4. Instale Redis:

```bash
./install-redis.sh
```

5. Se quiser usar outro namespace ou nome de release para PostgreSQL/pgAdmin:

```bash
./install-postgresql.sh meusql meu-release meu-pgadmin
```

6. Se quiser usar outro namespace ou nome de release para Redis:

```bash
./install-redis.sh meuredis meu-release
```

7. Remova o PostgreSQL e pgAdmin:

```bash
./uninstall-postgresql.sh
```

8. Remova o Redis:

```bash
./uninstall-redis.sh
```

8. Instalação do Kafka:

```bash
./install-kafka.sh                 # Instala no namespace kafka (padrão)
./install-kafka.sh meukafka meu-kafka   # Usa outro namespace/release
```

## Integração com Octant

1. Inicie o Octant no root do repositório ou em qualquer pasta:

```bash
octant
```

2. Abra o browser em `http://127.0.0.1:7777`.

3. No painel do Octant, selecione o namespace do PostgreSQL (`postgresql` por padrão).

4. Verifique:

- Deployments
- Pods
- Services
- PersistentVolumeClaims (se habilitados)
- ConfigMaps e Secrets

5. Use a busca dentro do Octant para encontrar `pg-db` ou `postgresql` rapidamente.
