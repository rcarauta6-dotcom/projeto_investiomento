package infrastructure

import (
	"context"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
)

type KafkaProducer struct {
	Writer *kafka.Writer
}

func NewKafkaProducer(brokers []string, topic string) *KafkaProducer {
	log.Printf("🛠️ Inicializando produtor Kafka nos brokers %v, tópico: %s", brokers, topic)
	
	return &KafkaProducer{
		Writer: &kafka.Writer{
			Addr:                   kafka.TCP(brokers...),
			Topic:                  topic,
			Balancer:               &kafka.LeastBytes{},
			AllowAutoTopicCreation: true,
			MaxAttempts:            5,
			WriteTimeout:           10 * time.Second,
			ReadTimeout:            10 * time.Second,
			// Transport customizado pode ajudar em ambientes de desenvolvimento
			Transport: &kafka.Transport{
				DialTimeout: 10 * time.Second,
				IdleTimeout: 30 * time.Second,
			},
		},
	}
}

func (p *KafkaProducer) Publish(ctx context.Context, key, value []byte) error {
	err := p.Writer.WriteMessages(ctx, kafka.Message{
		Key:   key,
		Value: value,
	})
	
	if err != nil {
		log.Printf("❌ Erro persistente ao escrever no Kafka: %v", err)
		log.Printf("💡 DICA: Se o erro for 'lookup kafka-dev-kafka', adicione '127.0.0.1 kafka-dev-kafka' ao seu /etc/hosts")
		return err
	}
	return nil
}

func (p *KafkaProducer) Close() error {
	return p.Writer.Close()
}
