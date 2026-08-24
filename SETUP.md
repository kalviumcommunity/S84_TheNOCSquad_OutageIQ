# OutageIQ — Complete Setup & Execution Guide

**Document Version:** 1.0.0 (Production Release)  
**System Support:** Linux, macOS, WSL / Windows  
**Architecture:** Unified Single-Server Python Engine & Decoupled Next.js Frontend  
**Documentation Location:** Also available in [`docs/SETUP.md`](docs/SETUP.md)

---

## 1. Quick Command Cheat-Sheet

| Workflow / Task | Command Line Execution | Default URL / Port |
| :--- | :--- | :--- |
| **🚀 Single Server (Unified)** | `python3 server.py` *(or `python3 backend/server.py --port 8000`)* | `http://localhost:8000` |
| **🎨 Frontend Dev Mode** | `cd frontend && npm run dev` | `http://localhost:3000` |
| **🎨 Frontend Production** | `cd frontend && npm run build && npm run start` | `http://localhost:3000` |
| **🐍 Standalone Backend API** | `python3 backend/server.py --port 8000` | `http://localhost:8000/api/health` |
| **🧪 Run All Tests (Unified)**| `./run_tests.sh` | Terminal Output (100% Pass) |
| **🧪 Run Python Unit Tests** | `python3 -m unittest discover -s backend/tests` | 66 Unit Tests |
| **🧪 Run Playwright E2E Tests**| `cd frontend && npm test` | 46 Browser Journeys |
| **🔍 Validate Data Intake** | `python3 backend/scripts/validate_intake.py` | Schema Health Report |

---

## 2. Environment Variables Reference (`.env`)

Create your `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

### Complete Environment Variable Dictionary

```env
# =============================================================
# OutageIQ Server & Network Configuration
# =============================================================
PORT=8000
HOST=0.0.0.0

# =============================================================
# Database Configuration (SQLite)
# =============================================================
DB_PATH=backend/data/outageiq.db

# =============================================================
# Raw Telemetry & Source Data Paths
# =============================================================
OUTAGE_DATA_PATH=backend/data/raw/outage_alerts.csv
COMPLAINT_DATA_PATH=backend/data/raw/complaint_logs.csv
USAGE_DATA_PATH=backend/data/raw/region_usage_metrics.csv
PROCESSED_DATA_PATH=backend/data/processed
REPORT_OUTPUT_PATH=backend/output

# =============================================================
# 4-Factor Impact Scoring Weights (PRD Section 7)
# Must sum to 1.0 (35% Reach, 30% Complaints, 20% Revenue, 15% Duration)
# =============================================================
IMPACT_WEIGHT_REACH=0.35
IMPACT_WEIGHT_COMPLAINTS=0.30
IMPACT_WEIGHT_REVENUE=0.20
IMPACT_WEIGHT_DURATION=0.15

# =============================================================
# Resolution SLA Thresholds (Hours)
# =============================================================
SLA_CRITICAL_HOURS=2.0
SLA_HIGH_HOURS=4.0
SLA_MEDIUM_HOURS=8.0
SLA_LOW_HOURS=24.0

# =============================================================
# Frontend API Integration URL (Optional in Decoupled Mode)
# =============================================================
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 3. System Prerequisites & Installation

Ensure you have the following installed on your machine:
- **Node.js**: `v18.17.0+` or `v20.x+` (LTS recommended)
- **npm**: `v9.x+` or `v10.x+`
- **Python**: `3.9+`, `3.10+`, `3.11+`, or `3.12+`
- **Git**: `2.x+`

### Step 3.1: Clone the Repository
```bash
git clone https://github.com/kalviumcommunity/S84_TheNOCSquad_OutageIQ.git
cd S84_TheNOCSquad_OutageIQ
```

### Step 3.2: Python Virtual Environment Setup
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment:
# Linux / macOS:
source venv/bin/activate

# Windows (CMD / PowerShell):
# .\venv\Scripts\activate

# Install Python backend dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### Step 3.3: Node.js Frontend Dependencies Setup
```bash
cd frontend
npm install
cd ..
```

---

## 4. Execution Modes

---

### Mode 1: Unified Single-Server Python Application (Recommended for Production / Evaluation)

The single-server app runs both the **frontend dashboard routes**, the **backend REST API**, and initializes/seeds the **SQLite database** from a single process.

```bash
# 1. Ensure frontend is compiled
npm --prefix frontend run build

# 2. Launch single server (root entrypoint)
python3 server.py

# Or launch with custom port/host arguments:
python3 backend/server.py --port 8000 --host 0.0.0.0
```

#### Available Single-Server URLs & Routes:
- 👉 **Overview Dashboard:** [`http://localhost:8000/overview`](http://localhost:8000/overview) or [`http://localhost:8000`](http://localhost:8000)
- 👉 **Outage Queue (Rahul):** [`http://localhost:8000/queue`](http://localhost:8000/queue)
- 👉 **Region View (Priya):** [`http://localhost:8000/regions`](http://localhost:8000/regions)
- 👉 **Analytics (Farah/Vikram):** [`http://localhost:8000/analytics`](http://localhost:8000/analytics)
- 👉 **Exportable Data:** [`http://localhost:8000/export`](http://localhost:8000/export)
- 📡 **REST API Health Check:** [`http://localhost:8000/api/health`](http://localhost:8000/api/health)
- 📊 **REST API Outages Queue:** [`http://localhost:8000/api/outages`](http://localhost:8000/api/outages)

---

### Mode 2: Decoupled Independent Development (Frontend + Backend)

For active full-stack development with hot-reloading:

#### Terminal 1: Start Backend REST API Server
```bash
source venv/bin/activate
python3 backend/server.py --port 8000
```

#### Terminal 2: Start Next.js Development Server
```bash
cd frontend
npm run dev
```

The live frontend will be available with hot-module reloading at:
- 👉 **`http://localhost:3000`**

*(To specify an alternate port: `npm run dev -- -p 3001`)*

---

### Mode 3: Standalone Python Analytics & Ingestion Engine

Execute direct data intake, deduplication, sliding-window temporal matching, and impact scoring in standalone scripts:

#### 1. Validate Data Intake & Schema Integrity:
```bash
python3 backend/scripts/validate_intake.py
```

#### 2. Execute Data Pipeline in Python:
```python
import sys
sys.path.append('backend/scripts')

from ingestion import read_outages, read_complaints, read_usage, run_data_pipeline
from scoring import compute_impact_scores
from queue_manager import get_prioritized_queue
from reporting import add_sla_tracking, get_executive_summary

# Load raw datasets
outages = read_outages('backend/data/raw/outage_alerts.csv')
complaints = read_complaints('backend/data/raw/complaint_logs.csv')
usage = read_usage('backend/data/raw/region_usage_metrics.csv')

# Run spatio-temporal fusion pipeline
pipeline_result = run_data_pipeline(outages, complaints, usage, time_window_hours=2.0)
scored_df = compute_impact_scores(pipeline_result['merged_df'])

# Generate ranked triage queue
queue = get_prioritized_queue(scored_df)
print(queue[['rank', 'outage_id', 'region_id', 'impact_score', 'priority_tier']].head())
```

---

## 5. Complete Testing Suite & Commands

OutageIQ includes a comprehensive 3-tier testing framework guaranteeing 100% test coverage across analytics, schemas, APIs, and UI interactions.

### Run All Tests (Unified Runner):
```bash
./run_tests.sh
```

### Run Specific Test Layers:

#### 1. Python Analytics & Intake Script Tests:
```bash
# Run all backend unit tests:
python3 -m unittest discover -s backend/tests

# Or run via root npm script:
npm run test:python

# Or run via backend npm package:
npm --prefix backend test
```

#### 2. Frontend & Playwright End-to-End Tests:
```bash
# Run from root:
npm run test:frontend

# Or directly inside frontend folder:
cd frontend
npm test
```

#### 3. Run Individual Test Files:
```bash
# Scoring Engine Unit Test:
python3 -m unittest backend/tests/test_scoring.py

# Ingestion & Spatio-Temporal Join Test:
python3 -m unittest backend/tests/test_ingestion.py

# Queue Manager & Tie-Breaking Test:
python3 -m unittest backend/tests/test_queue_manager.py

# Reporting & SLA Tracking Test:
python3 -m unittest backend/tests/test_reporting.py

# Specific Playwright UI Test:
cd frontend
npx playwright test e2e/live-queue.spec.ts
npx playwright test e2e/calculator.spec.ts
npx playwright test e2e/navbar.spec.ts
npx playwright test e2e/regional-analytics.spec.ts
```

---

## 6. SQLite Database Setup & Inspection

The SQLite database file is located at `backend/data/outageiq.db`. It is created and seeded automatically on first startup.

### Querying the Database via SQLite CLI:
```bash
# Check tables
sqlite3 backend/data/outageiq.db ".tables"

# Inspect top prioritized outages
sqlite3 backend/data/outageiq.db "SELECT outage_id, region_name, severity, impact_score, priority_tier FROM outages ORDER BY impact_score DESC LIMIT 5;"

# Inspect regional subscriber and revenue tiers
sqlite3 backend/data/outageiq.db "SELECT name, subscribers_formatted, revenue_tier, impact_score FROM regions ORDER BY impact_score DESC;"
```

---

## 7. Troubleshooting & FAQs

### Q1: `ModuleNotFoundError: No module named 'pandas'`
- **Solution:** Activate your virtual environment (`source venv/bin/activate`) and run `pip install -r backend/requirements.txt`.

### Q2: Port 3000 or 8000 is occupied
- **Solution:** Identify and kill the stale process, or pass a custom port:
  ```bash
  # Free port 3000 or 8000:
  fuser -k 3000/tcp
  fuser -k 8000/tcp

  # Or run Python single server on port 8080:
  python3 server.py --port 8080
  ```

### Q3: Playwright browser binaries missing during E2E testing
- **Solution:** Install the Playwright Chromium browser binary:
  ```bash
  cd frontend
  npx playwright install chromium --with-deps
  ```

### Q4: Reset SQLite Database to Fresh State
- **Solution:** Delete the database file; it will re-seed automatically on next boot:
  ```bash
  rm -f backend/data/outageiq.db
  python3 server.py
  ```

---

## 8. Docker Multi-Stage Deployment & CI/CD

### 8.1 Multi-Stage Docker Build Architecture
OutageIQ packages both the Next.js static UI export and the Python single server engine into a self-contained production container image.

- **Stage 1 (`frontend-builder`)**: Uses `node:20-alpine` to compile Next.js static export files to `frontend/out`.
- **Stage 2 (`runner`)**: Uses `python:3.11-slim` with system utilities (`curl`, `sqlite3`), installs dependencies, copies backend scripts & SQLite telemetry databases, and serves the static UI and REST endpoints on port `8000`.

### 8.2 Building & Running via Docker Locally
```bash
# Build the Docker image
docker build -t outageiq:latest .

# Run the container
docker run -d -p 8000:8000 --name outageiq outageiq:latest

# Check health endpoint
curl http://localhost:8000/api/health
```

### 8.3 Using Docker Compose
```bash
# Start container
docker compose up -d

# Stop container
docker compose down
```

### 8.4 Automated Tag-Driven CI/CD Deployment (`deploy.yml`)
The workflow `.github/workflows/deploy.yml` triggers exclusively when a tag matching `v*` (e.g. `v1.0.0`) is pushed to GitHub:

1. Builds the multi-stage Docker container.
2. Pushes image to Docker Hub tagged with both the version tag (e.g. `user/outageiq:v1.0.0`) and `latest`.
3. Triggers automated deployment on **Render** to deploy the `v*` tagged image.

#### Required GitHub Secrets:
| Secret Name | Description |
| :--- | :--- |
| `DOCKERHUB_USERNAME` | Docker Hub username or organization |
| `DOCKERHUB_TOKEN` | Docker Hub Personal Access Token |
| `RENDER_DEPLOY_HOOK_URL` | Render Service Deploy Hook URL (or `RENDER_API_KEY` + `RENDER_SERVICE_ID`) |
| `RENDER_API_KEY` *(Optional)* | Render API Key for direct REST API deployment |
| `RENDER_SERVICE_ID` *(Optional)* | Render Web Service ID |

#### Triggering a Release Deployment:
```bash
git tag v1.0.0
git push origin v1.0.0
```

