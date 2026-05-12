import os
from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename
from src.rag.chatbot import chatbot
from src.rag.pdf_processor import pdf_processor
from src.rag.kafka_ingestor import kafka_ingestor

app = Flask(__name__)

# Configuração para upload de PDF
UPLOAD_FOLDER = './data/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ai-service ok'})

@app.route('/api/ai/ping', methods=['GET'])
def ping():
    return jsonify({'message': 'pong'})

@app.route('/api/ai/chat', methods=['POST'])
def chat():
    data = request.get_json(silent=True) or {}
    query = data.get('query', '')
    
    response = chatbot.ask(query, request_data=data)
    return jsonify({'response': response})

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

@app.route('/api/ai/recommend', methods=['POST'])
def recommend():
    # Mantendo compatibilidade
    data = request.get_json(silent=True) or {}
    query = data.get('query', 'sem query')
    return jsonify({
        'query': query,
        'recommendations': [
            'Recomendação RAG: Use o endpoint /api/ai/chat para conversar com o assistente.',
        ]
    })

if __name__ == '__main__':
    # Iniciar ingestor Kafka em background
    kafka_ingestor.start()
    
    app.run(host='0.0.0.0', port=8084, debug=False) # Debug False para não iniciar o ingestor duas vezes
