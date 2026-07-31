FROM python:3.11-slim

# Set working directory
WORKDIR /workspace

# Install system dependencies needed for compiling packages like shap
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend app and structural directories
COPY backend/app/ ./backend/app/
COPY dataset/ ./dataset/
COPY model/ ./model/

# Set Python Path to workspace so backend.app is importable
ENV PYTHONPATH=/workspace

# Expose port
EXPOSE 8000

# Run uvicorn server
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
