# NeuroAI Backend Production Dockerfile
FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    MODEL_PATH=/app/brain_tumor_model.h5

WORKDIR /app

# Install minimal OS dependencies required for image processing and network health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application files and model weights
COPY app.py llm_service.py brain_tumor_model.h5 ./

# Create non-root user for security compliance
RUN useradd -u 1000 -m appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Docker healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Start ASGI application on host 0.0.0.0 and dynamic port
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
