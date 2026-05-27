import os
import json
import logging
from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from .vector_store import vector_store_manager
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class StockChatbot:
    def __init__(self):
        # Forçamos a leitura da chave GROQ_API_KEY
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model_name = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
        self.llm = None
        
        if not self.api_key or "SUA_CHAVE" in self.api_key or self.api_key == "your_groq_api_key_here":
            logger.error("❌ GROQ_API_KEY não configurada ou inválida.")
            return

        try:
            # Configuração direta para Groq.com
            self.llm = ChatGroq(
                groq_api_key=self.api_key,
                model_name=self.model_name,
                temperature=0.1
            )
            logger.info(f"✅ LLM Groq.com inicializado com sucesso: {self.model_name}")
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar ChatGroq: {e}")

        template = """Você é um assistente financeiro especialista em Bolsa de Valores.
Use as seguintes peças de contexto para responder à pergunta no final.
Se você não souber a resposta, apenas diga que não sabe.

Contexto: {context}

Pergunta: {question}
Resposta útil em Português:"""
        
        self.QA_CHAIN_PROMPT = PromptTemplate(
            input_variables=["context", "question"],
            template=template,
        )

    def ask(self, query, request_data=None):
        if not self.llm:
            return "Erro: O serviço de IA não está configurado. Verifique se a sua chave (gsk_...) foi inserida no Kubernetes."

        try:
            # Verificar se é uma análise de portfólio
            if request_data and request_data.get("type") == "portfolio_analysis":
                portfolio = request_data.get("portfolio", [])
                return self._analyze_portfolio(portfolio)

            qa_chain = RetrievalQA.from_chain_type(
                self.llm,
                retriever=vector_store_manager.as_retriever(),
                chain_type_kwargs={"prompt": self.QA_CHAIN_PROMPT}
            )
            
            result = qa_chain.invoke({"query": query})
            return result["result"]
        except Exception as e:
            logger.error(f"💥 Erro na execução Groq: {e}")
            if "401" in str(e):
                return "Erro de Autenticação: Sua chave da Groq (gsk_...) é inválida."
            return f"Erro na IA (Groq): {str(e)}"

    def _analyze_portfolio(self, portfolio):
        try:
            portfolio_str = json.dumps(portfolio, indent=2)
            prompt = f"Analise este portfólio de ações: {portfolio_str}. Responda em Português."
            docs = vector_store_manager.as_retriever().invoke("mercado financeiro b3")
            context = "\n".join([d.page_content for d in docs])
            full_prompt = f"Contexto:\n{context}\n\n{prompt}"
            response = self.llm.invoke(full_prompt)
            return response.content
        except Exception as e:
            logger.error(f"💥 Erro na análise: {e}")
            return f"Erro na análise: {str(e)}"

chatbot = StockChatbot()
