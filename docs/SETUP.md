# OutageIQ — Local Setup & Development Guide

This guide provides step-by-step instructions to set up, configure, and run both the **Backend Analytics Engine** and the **Frontend Web Application** on your local machine.

---

## 1. System Requirements & Prerequisites

Ensure the following runtimes and tools are installed:

- **Node.js**: `v18.17.0+` or `v20.x+` (LTS recommended)
- **npm**: `v9.x+` or `v10.x+`
- **Python**: `3.9+` or `3.10+` / `3.11+` / `3.12+`
- **Git**: `2.x+`
- **Bash / Terminal**: Linux, macOS, or WSL (Windows Subsystem for Linux)

---

## 2. Project Architecture Overview

```
S84_TheNOCSquad_OutageIQ/
├── docs/                     # Specifications, architecture, and setup guides
│   ├── PRD.md                # Product Requirements Document
│   ├── PLANNER.md            # 10-Phase Implementation & Roadmap
│   └── SETUP.md              # Local setup and execution guide (this file)
├── backend/                  # Python Analytics Engine, Ingestion & Data
│   ├── data/                 # Raw and processed datasets
│   │   ├── raw/              # Source datasets (outages, complaints, metrics)
│   │   └── processed/        # Merged & sanitized data outputs
│   ├── output/               # Generated reports and exports
│   ├── scripts/              # Ingestion, scoring, queue manager, and reporting
│   ├── tests/                # Unit and integration test suites
│   ├── requirements.txt      # Python dependencies
│   └── package.json          # Backend npm test scripts
├── frontend/                 # Next.js 16 Web Application
│   ├── app/                  # App Router pages and layout
│   ├── components/           # UI components (Triage Queue, Simulator, ROI, etc.)
│   ├── e2e/                  # Playwright End-to-End test suite
│   ├── package.json          # Frontend dependencies & scripts
│   └── playwright.config.ts  # Playwright test configuration
├── .env.example              # Environment variables template
├── package.json              # Root project scripts
├── requirements.txt          # Root Python dependencies
└── run_tests.sh              # 3-tier unified test runner script
```

---

## 3. Quick Start (All-in-One Setup)

### Step 3.1: Clone the Repository
```bash
git clone https://github.com/kalviumcommunity/S84_TheNOCSquad_OutageIQ.git
cd S84_TheNOCSquad_OutageIQ
```

### Step 3.2: Configure Environment Variables
Copy the template configuration to create your local `.env`:
```bash
cp .env.example .env
```

The default environment settings:
```env
# Local data sources for OutageIQ
OUTAGE_DATA_PATH=./data/raw/outage_alerts.csv
COMPLAINT_DATA_PATH=./data/raw/complaint_logs.csv
USAGE_DATA_PATH=./data/raw/region_usage_metrics.csv

# Output location for cleaned and merged datasets
PROCESSED_DATA_PATH=./data/processed
REPORT_OUTPUT_PATH=./output

# Config-driven scoring weights from the PRD
IMPACT_WEIGHT_REACH=0.35
IMPACT_WEIGHT_COMPLAINTS=0.30
IMPACT_WEIGHT_REVENUE=0.20
IMPACT_WEIGHT_DURATION=0.15
```

---

## 4. Backend Setup & Execution (Python Analytics Engine)

The backend provides data intake validation, deduplication, temporal complaint linkage, multi-factor Impact Scoring (0–100), SLA breach calculation, and prioritized queue management.

### Step 4.1: Create & Activate Virtual Environment
From the repository root:
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux / macOS:
source venv/bin/activate

# On Windows (Command Prompt / PowerShell):
# .\venv\Scripts\activate
```

### Step 4.2: Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### Step 4.3: Running Backend Scripts & Validation
You can run individual modules or execute data intake validation:

#### 1. Validate Data Intake & Schema Integrity
```bash
python3 backend/scripts/validate_intake.py
```

#### 2. Execute Data Pipeline in Python REPL / Scripts
```python
import sys
sys.path.append('backend/scripts')

from ingestion import read_outages, read_complaints, read_usage, run_data_pipeline
from scoring import compute_impact_scores
from queue_manager import get_prioritized_queue
from reporting import add_sla_tracking, generate_executive_summary

# Load raw datasets
outages = read_outages('backend/data/raw/outage_alerts.csv')
complaints = read_complaints('backend/data/raw/complaint_logs.csv')
usage = read_usage('backend/data/raw/region_usage_metrics.csv')

# Run ingestion & temporal association pipeline
pipeline_result = run_data_pipeline(outages, complaints, usage, time_window_hours=2.0)
merged_df = pipeline_result['merged_df']

# Compute explainable 0-100 Impact Scores
scored_df = compute_impact_scores(merged_df)

# Rank triage queue
queue = get_prioritized_queue(scored_df)
print(queue[['rank', 'outage_id', 'region_id', 'impact_score', 'priority_tier']])
```

#### 3. Launch Jupyter Notebook / Lab (Optional)
```bash
jupyter notebook
```

---

## 5. Frontend Setup & Execution (Next.js Application)

The frontend is a modern Next.js 16 App Router application with interactive components including the **Live Triage Queue Preview**, **Interactive Impact Score Calculator & Simulator**, **Scoring Methodology Explorer**, **Persona Views**, and **ROI Business Case Calculator**.

### Step 5.1: Install Node Dependencies
```bash
cd frontend
npm install
```

### Step 5.2: Run in Development Mode
To start the Next.js development server with hot reloading:
```bash
npm run dev
```

The application will be available at:
👉 **`http://localhost:3000`**

*(If port 3000 is occupied, you can run on a custom port using: `npm run dev -- -p 3001`)*

### Step 5.3: Build & Run in Production Mode
To create an optimized production build and serve it:
```bash
# 1. Build the production package
npm run build

# 2. Start the production server
npm run start
```

---

## 6. Running Tests

OutageIQ includes a comprehensive 3-tier testing framework covering Python analytics unit tests, schema validators, backend npm test runners, and Playwright end-to-end UI tests.

### Run All Test Suites (Unified Runner)
From the repository root:
```bash
./run_tests.sh
```

### Run Layer-Specific Test Suites

#### 1. Backend Python Unit Tests:
```bash
# Using Python directly (with venv activated):
python3 -m unittest discover -s backend/tests

# Or using the root npm alias:
npm run test:python

# Or using the backend npm package:
npm --prefix backend test
```

#### 2. Frontend Build & Playwright E2E Tests:
```bash
# Run from root:
npm run test:frontend

# Or directly in frontend folder:
cd frontend
npm test
```

#### 3. Run Specific Test Files:
```bash
# Specific Python unit test:
python3 -m unittest backend/tests/test_scoring.py
python3 -m unittest backend/tests/test_ingestion.py
python3 -m unittest backend/tests/test_queue_manager.py
python3 -m unittest backend/tests/test_reporting.py

# Specific Playwright UI test:
cd frontend
npx playwright test e2e/live-queue.spec.ts
npx playwright test e2e/impact-calculator.spec.ts
```

---

## 7. Troubleshooting & FAQs

### Q1: `ModuleNotFoundError: No module named 'pandas'`
- **Cause**: The Python virtual environment is not activated or dependencies are not installed.
- **Solution**: Run `source venv/bin/activate` and `pip install -r backend/requirements.txt`.

### Q2: Port 3000 is already in use
- **Solution**: Next.js will automatically prompt or you can specify a different port:
  ```bash
  npm run dev -- -p 3005
  ```

### Q3: Playwright browser binaries missing during E2E testing
- **Solution**: Install Playwright browser dependencies inside the `frontend` directory:
  ```bash
  cd frontend
  npx playwright install --with-deps
  ```

### Q4: Python unittest discovery from root
- When running `python3 -m unittest discover -s backend/tests`, ensure `backend/scripts` is in your `PYTHONPATH` if running custom interactive scripts:
  ```bash
  export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend/scripts"
  ```
