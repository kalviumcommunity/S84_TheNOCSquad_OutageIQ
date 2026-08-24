# =============================================================
# OutageIQ Single-Server Multi-Stage Dockerfile
# Stage 1: Build Next.js Static Export
# Stage 2: Production Python Single-Server Runtime
# =============================================================

# -------------------------------------------------------------
# Stage 1: Frontend Static Assets Builder
# -------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend dependency declarations
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies cleanly
RUN npm ci

# Copy frontend source code and configs
COPY frontend/ ./

# Build Next.js static HTML/CSS/JS export
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Unified Single-Server Production Runtime
# -------------------------------------------------------------
FROM python:3.11-slim AS runner

# Set Python and application runtime environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0 \
    DB_PATH=/app/backend/data/outageiq.db \
    OUTAGE_DATA_PATH=/app/backend/data/raw/outage_alerts.csv \
    COMPLAINT_DATA_PATH=/app/backend/data/raw/complaint_logs.csv \
    USAGE_DATA_PATH=/app/backend/data/raw/region_usage_metrics.csv \
    PROCESSED_DATA_PATH=/app/backend/data/processed \
    REPORT_OUTPUT_PATH=/app/backend/output

# Install system dependencies (curl for health check, sqlite3 CLI)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python backend dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy single-server entrypoint and backend modules
COPY server.py ./
COPY backend/ ./backend/

# Ensure necessary data and output directories exist
RUN mkdir -p /app/backend/data/processed /app/backend/output /app/frontend

# Copy compiled static frontend export from builder stage
COPY --from=frontend-builder /app/frontend/out ./frontend/out

# Expose the application port
EXPOSE 8000

# Health check to monitor single server availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Launch the unified single server
CMD ["python3", "server.py"]
