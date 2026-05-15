FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for ChromaDB and Kafka
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and data directory
COPY src/ ./src/
# Ensure data directory exists for local runs without volumes
RUN mkdir -p data/uploads data/chroma

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8084

# Start the application
CMD ["python", "src/app.py"]
