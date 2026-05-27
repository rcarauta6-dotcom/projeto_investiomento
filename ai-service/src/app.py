import os
import requests
import logging
import traceback
from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename
from src.rag.chatbot import chatbot
from src.rag.pdf_processor import pdf_processor
from src.rag.kafka_ingestor import kafka_ingestor

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuração para upload de PDF
UPLOAD_FOLDER = './data/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"🔥 ERRO NÃO TRATADO: {str(e)}")
    logger.error(traceback.format_exc())
    return jsonify({
        "error": "Erro interno no servidor de IA",
        "details": str(e)
    }), 500

@app.route('/health', methods=['GET'])
def health():
    # Teste rápido de conectividade externa com Groq
    groq_reachability = "unknown"
    try:
        # Groq API endpoint for reachability check
        requests.get("https://api.groq.com/openai/v1/models", timeout=2)
        groq_reachability = "ok"
    except Exception as e:
        logger.warning(f"⚠️ Falha de conectividade com Groq: {e}")
        groq_reachability = "failed"
    
    return jsonify({
        'status': 'ai-service ok',
        'connectivity': {
            'groq': groq_reachability
        },
        'llm_ready': chatbot.llm is not None,
        'model': chatbot.model_name
    })

@app.route('/api/ai/ping', methods=['GET'])
def ping():
    return jsonify({'message': 'pong'})

@app.route('/api/ai/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json(silent=True) or {}
        query = data.get('query', '')
        
        if not query:
             return jsonify({'error': 'Query vazia'}), 400

        logger.info(f"🤖 AI Service: Processando query: {query[:50]}...")
        response = chatbot.ask(query, request_data=data)
        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"💥 Erro na rota /chat: {e}")
        return jsonify({'error': f'Falha ao processar chat: {str(e)}'}), 500

@app.route('/api/ai/upload_pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.pdf'):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Processar o PDF e adicionar ao vector store
        num_chunks = pdf_processor.process_pdf(file_path)
        
        return jsonify({
            'message': f'PDF {filename} processado com sucesso',
            'chunks_indexed': num_chunks
        })
    else:
        return jsonify({'error': 'Somente arquivos PDF são permitidos'}), 400

if __name__ == '__main__':
    # Iniciar ingestor Kafka em background
    kafka_ingestor.start()
    app.run(host='0.0.0.0', port=8084, debug=False)
