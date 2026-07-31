FROM python:3.11-slim

WORKDIR /workspace

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY backend/app/ ./backend/app/
COPY dataset/ ./dataset/
COPY model/ ./model/

ENV PYTHONPATH=/workspace
ENV PORT=8000

EXPOSE 8000

# Start Uvicorn server using $PORT provided by Render/Cloud platforms
CMD uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}
