#!/usr/bin/env bash

echo "🧹 1. Limpando tentativas anteriores..."
rm -rf kafka
helm uninstall kafka-dev -n meu-kafka-ns 2>/dev/null

echo "📂 2. Criando a estrutura da pasta 'kafka'..."
mkdir -p kafka/templates

echo "📝 3. Gerando os arquivos do Chart..."

# --- Chart.yaml ---
cat << 'EOF' > kafka/Chart.yaml
apiVersion: v2
name: meu-kafka-chart
description: Um chart Helm customizado do zero com Kafka UI
type: application
version: 1.0.0
appVersion: "7.5.0"
EOF

# --- values.yaml ---
cat << 'EOF' > kafka/values.yaml
zookeeper:
  image: confluentinc/cp-zookeeper:7.5.0
  port: 2181

kafka:
  image: confluentinc/cp-kafka:7.5.0
  port: 9092

kafkaui:
  image: provectuslabs/kafka-ui:latest
  port: 8080
EOF

# --- templates/zookeeper.yaml ---
cat << 'EOF' > kafka/templates/zookeeper.yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-zookeeper
spec:
  ports:
    - port: {{ .Values.zookeeper.port }}
      name: client
  selector:
    app: {{ .Release.Name }}-zookeeper
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-zookeeper
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {{ .Release.Name }}-zookeeper
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-zookeeper
    spec:
      containers:
        - name: zookeeper
          image: "{{ .Values.zookeeper.image }}"
          ports:
            - containerPort: {{ .Values.zookeeper.port }}
          env:
            - name: ZOOKEEPER_CLIENT_PORT
              value: "{{ .Values.zookeeper.port }}"
            - name: ZOOKEEPER_TICK_TIME
              value: "2000"
EOF

# --- templates/kafka.yaml ---
cat << 'EOF' > kafka/templates/kafka.yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-kafka
spec:
  ports:
    - port: {{ .Values.kafka.port }}
      name: broker
  selector:
    app: {{ .Release.Name }}-kafka
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: {{ .Release.Name }}-kafka
spec:
  serviceName: {{ .Release.Name }}-kafka
  replicas: 1
  selector:
    matchLabels:
      app: {{ .Release.Name }}-kafka
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-kafka
    spec:
      containers:
        - name: kafka
          image: "{{ .Values.kafka.image }}"
          ports:
            - containerPort: {{ .Values.kafka.port }}
          env:
            - name: KAFKA_BROKER_ID
              value: "1"
            - name: KAFKA_ZOOKEEPER_CONNECT
              value: "{{ .Release.Name }}-zookeeper:{{ .Values.zookeeper.port }}"
            - name: KAFKA_LISTENERS
              value: "PLAINTEXT://0.0.0.0:{{ .Values.kafka.port }}"
            - name: KAFKA_ADVERTISED_LISTENERS
              value: "PLAINTEXT://{{ .Release.Name }}-kafka:{{ .Values.kafka.port }}"
            - name: KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR
              value: "1"
EOF

# --- templates/kafka-ui.yaml (A MÁGICA AQUI) ---
cat << 'EOF' > kafka/templates/kafka-ui.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-kafka-ui
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {{ .Release.Name }}-kafka-ui
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-kafka-ui
    spec:
      containers:
        - name: kafka-ui
          image: "{{ .Values.kafkaui.image }}"
          ports:
            - containerPort: {{ .Values.kafkaui.port }}
          env:
            - name: KAFKA_CLUSTERS_0_NAME
              value: "Meu-Cluster-K8s"
            - name: KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS
              value: "{{ .Release.Name }}-kafka:{{ .Values.kafka.port }}"
---
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-kafka-ui
spec:
  ports:
    - port: {{ .Values.kafkaui.port }}
      targetPort: {{ .Values.kafkaui.port }}
  selector:
    app: {{ .Release.Name }}-kafka-ui
EOF

echo "🚀 4. Instalando no Kubernetes..."
# Agora a ordem está certa: Cria o namespace PRIMEIRO
kubectl create namespace meu-kafka-ns --dry-run=client -o yaml | kubectl apply -f -

# Instala TUDO (Zookeeper + Kafka + Kafka UI) de uma vez só!
helm upgrade --install kafka-dev ./kafka \
  --namespace meu-kafka-ns \
  -f ./kafka/values.yaml

echo "========================================="
echo "✅ Instalado com sucesso!"
echo "========================================="
sleep 2
kubectl get pods -n meu-kafka-ns