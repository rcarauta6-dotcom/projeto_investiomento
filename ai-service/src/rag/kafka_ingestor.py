import os
import json
import threading
import logging
from confluent_kafka import Consumer, KafkaError
from .vector_store import vector_store_manager
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KafkaIngestor:
    def __init__(self):
        self.conf = {
            'bootstrap.servers': os.getenv("KAFKA_BROKERS", "localhost:9092"),
            'group.id': 'ai-service-rag-v2',
            'auto.offset.reset': 'earliest'
        }
        self.topics = [
            os.getenv("KAFKA_TOPIC", "market-quotes"),
            "market-news"
        ]
        self.running = False

    def start(self):
        self.running = True
        self.thread = threading.Thread(target=self._consume)
        self.thread.daemon = True
        self.thread.start()
        logger.info(f"Started Kafka Ingestor on topics: {self.topics}")

    def _consume(self):
        consumer = Consumer(self.conf)
        consumer.subscribe(self.topics)

        while self.running:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    logger.error(f"Kafka error: {msg.error()}")
                    break

            try:
                topic = msg.topic()
                data = json.loads(msg.value().decode('utf-8'))
                
                if topic == "market-news":
                    text = f"NOTÍCIA ({data.get('source')}): {data.get('title')}. {data.get('description')}"
                    metadata = {"source": "rss", "link": data.get('link'), "type": "news"}
                    logger.info(f"Indexed news: {data.get('title')[:50]}...")
                else:
                    text = f"Cotação: {data.get('symbol')} - Preço: {data.get('price')} - Variação: {data.get('change_percent')}%"
                    metadata = {"source": "kafka", "symbol": data.get('symbol'), "type": "quote"}
                    logger.info(f"Indexed quote for {data.get('symbol')}")

                vector_store_manager.add_texts([text], metadatas=[metadata])
                
            except Exception as e:
                logger.error(f"Error processing Kafka message: {e}")

        consumer.close()

    def stop(self):
        self.running = False
        if hasattr(self, 'thread'):
            self.thread.join()

kafka_ingestor = KafkaIngestor()
