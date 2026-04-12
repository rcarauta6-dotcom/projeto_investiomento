from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ai-service ok'})

@app.route('/api/ai/ping', methods=['GET'])
def ping():
    return jsonify({'message': 'pong'})

@app.route('/api/ai/recommend', methods=['POST'])
def recommend():
    data = request.get_json(silent=True) or {}
    query = data.get('query', 'sem query')
    return jsonify({
        'query': query,
        'recommendations': [
            'Recomendação 1 para ' + query,
            'Recomendação 2 para ' + query,
        ]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8083, debug=True)
