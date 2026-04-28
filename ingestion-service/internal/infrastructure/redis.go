package infrastructure

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	Client *redis.Client
}

func NewRedisClient(addr, password string) *RedisClient {
	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password, // Senha adicionada aqui
		DB:       0,        // DB padrão
	})
	
	// Verificar conexão na inicialização
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("⚠️ Alerta: Não foi possível conectar ao Redis em %s (com senha): %v", addr, err)
	} else {
		log.Printf("✅ Redis conectado com sucesso em %s", addr)
	}

	return &RedisClient{Client: rdb}
}

func (r *RedisClient) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return r.Client.Set(ctx, key, value, expiration).Err()
}

func (r *RedisClient) Get(ctx context.Context, key string) (string, error) {
	return r.Client.Get(ctx, key).Result()
}

func (r *RedisClient) GetAllQuotes(ctx context.Context) (map[string]string, error) {
	// Em produção, usar SCAN. Para estudo/poucas chaves, KEYS resolve.
	keys, err := r.Client.Keys(ctx, "*").Result()
	if err != nil {
		return nil, err
	}

	result := make(map[string]string)
	for _, key := range keys {
		val, err := r.Client.Get(ctx, key).Result()
		if err == nil {
			result[key] = val
		}
	}
	return result, nil
}
