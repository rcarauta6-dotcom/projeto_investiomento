import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from dotenv import load_dotenv

load_dotenv()

class VectorStoreManager:
    def __init__(self):
        self.embedding_model = HuggingFaceEmbeddings(
            model_name=os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2"),
            model_kwargs={'device': 'cpu'}
        )
        self.chroma_path = os.getenv("CHROMA_PATH", "./data/chroma")
        self.vector_store = Chroma(
            persist_directory=self.chroma_path,
            embedding_function=self.embedding_model,
            collection_name="stock_market_info"
        )

    def add_texts(self, texts, metadatas=None):
        self.vector_store.add_texts(texts, metadatas=metadatas)
        # In newer versions of Chroma, persistence is often automatic, 
        # but let's be safe if using an older version that needs .persist()
        if hasattr(self.vector_store, 'persist'):
            self.vector_store.persist()

    def as_retriever(self, search_kwargs=None):
        if search_kwargs is None:
            search_kwargs = {"k": 5}
        return self.vector_store.as_retriever(search_kwargs=search_kwargs)

vector_store_manager = VectorStoreManager()
