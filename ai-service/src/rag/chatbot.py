import os
import json
from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from .vector_store import vector_store_manager
from dotenv import load_dotenv

load_dotenv()

class StockChatbot:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key or api_key == "your_groq_api_key_here":
            # Fallback or error handling
            self.llm = None
            print("Warning: GROQ_API_KEY not set. Chatbot will not work.")
        else:
            self.llm = ChatGroq(
                groq_api_key=api_key,
                model_name=os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
            )

        template = """Você é um assistente financeiro especialista em Bolsa de Valores.
Use as seguintes peças de contexto para responder à pergunta no final.
Se você não souber a resposta, apenas diga que não sabe, não tente inventar uma resposta.
RESTRICÕES:
- Responda APENAS perguntas relacionadas à bolsa de valores, investimentos e mercado financeiro.
- NUNCA forneça ou solicite informações pessoais (CPF, senhas, endereços, etc.).
- Se o usuário perguntar algo fora do escopo de mercado financeiro, diga educadamente que você só pode ajudar com dúvidas sobre investimentos.

Contexto: {context}

Pergunta: {question}
Resposta útil em Português:"""
        
        self.QA_CHAIN_PROMPT = PromptTemplate(
            input_variables=["context", "question"],
            template=template,
        )

    def ask(self, query, request_data=None):
        if not self.llm:
            return "Desculpe, o serviço de IA não está configurado corretamente (chave API ausente)."

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

    def _analyze_portfolio(self, portfolio):
        portfolio_str = json.dumps(portfolio, indent=2)
        prompt = f"""Analise taticamente o seguinte portfólio de investimentos e forneça recomendações curtas e diretas:
{portfolio_str}

Considere:
1. Diversificação de ativos.
2. Riscos potenciais baseados nas notícias recentes (se houver no contexto).
3. Sugestões de rebalanceamento.

Resposta em Português, formatada com Markdown:"""
        
        # Usar o retriever para pegar contexto de notícias recentes antes da análise
        docs = vector_store_manager.as_retriever().invoke("últimas notícias mercado financeiro brasil")
        context = "\n".join([d.page_content for d in docs])
        
        full_prompt = f"Contexto de Mercado:\n{context}\n\n{prompt}"
        response = self.llm.invoke(full_prompt)
        return response.content

chatbot = StockChatbot()
