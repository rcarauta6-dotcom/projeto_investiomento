package infrastructure

import (
	"context"
	"log"
	"time"
	"strings"

	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	Client *redis.Client
}

func NewRedisClient(addr, password string) *RedisClient {
	log.Printf("🛠️ Inicializando cliente Redis em: %s (Password set: %v)", addr, password != "")
	
	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       0,
	})
	
	// Verificar conexão na inicialização
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("❌ ERRO CRÍTICO REDIS: Não foi possível conectar ao Redis em %s: %v", addr, err)
	} else {
		log.Printf("✅ CONEXÃO ESTABELECIDA: Redis conectado com sucesso em %s", addr)
	}

	return &RedisClient{Client: rdb}
}

func (r *RedisClient) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	err := r.Client.Set(ctx, key, value, expiration).Err()
	if err != nil {
		log.Printf("❌ Erro ao escrever no Redis (Key: %s): %v", key, err)
	}
	return err
}

func (r *RedisClient) Get(ctx context.Context, key string) (string, error) {
	val, err := r.Client.Get(ctx, key).Result()
	if err != nil && err != redis.Nil {
		log.Printf("❌ Erro ao ler do Redis (Key: %s): %v", key, err)
	}
	return val, err
}

func (r *RedisClient) GetAllQuotes(ctx context.Context) (map[string]string, error) {
	// Buscar apenas chaves que começam com "quote:"
	keys, err := r.Client.Keys(ctx, "quote:*").Result()
	if err != nil {
		log.Printf("❌ Erro ao listar chaves no Redis: %v", err)
		return nil, err
	}

	result := make(map[string]string)
	for _, key := range keys {
		val, err := r.Client.Get(ctx, key).Result()
		if err == nil {
			// Remover o prefixo "quote:" para o mapa de retorno se necessário, 
			// mas o service faz o unmarshal do valor, então a chave original simplificada é melhor.
			cleanKey := strings.TrimPrefix(key, "quote:")
			result[cleanKey] = val
		}
	}
	return result, nil
}
