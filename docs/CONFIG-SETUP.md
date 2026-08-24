# OutageIQ — Single Server Python Application Setup & Configuration Guide

**Document Version:** 1.0.0 (Production Release)  
**System Basis:** Unified Single-Process Python Server (`server.py` & `backend/server.py`)  
**Target Audience:** DevOps Engineers, Full-Stack Developers, Site Reliability Engineers (SREs), NOC System Administrators

---

## 1. Overview & Architecture

**OutageIQ Single Server** is a unified Python application that hosts both the frontend user interface and the backend analytics/scoring engine in a single, high-performance runtime process.

```
                                    ┌─────────────────────────────────────────┐
                                    │    Client Browser / NOC Dashboards      │
                                    │  (Desktop, Wallboard, Field Tablets)   │
                                    └────────────────────┬────────────────────┘
                                                         │ HTTP / REST / Assets
                                                         ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           OutageIQ Single-Server Python Process (Port 8000)                           │
│                                                                                                       │
│   ┌──────────────────────────────────────────────┐  ┌─────────────────────────────────────────────┐   │
│   │           Static UI Web Server               │  │              REST API Router                │   │
│   │  - Overview (/overview)                      │  │  - /api/health                              │   │
│   │  - Outage Queue (/queue)                     │  │  - /api/outages (Filtered/Ranked)           │   │
│   │  - Region View (/regions)                    │  │  - /api/regions                             │   │
│   │  - Analytics (/analytics)                    │  │  - /api/analytics                           │   │
│   │  - Exportable Data (/export)                 │  │  - /api/executive-summary                   │   │
│   │  - Static JS / CSS / Asset Bundles           │  │  - /api/export/csv & /api/export/pdf        │   │
│   └──────────────────────────────────────────────┘  └──────────────────────┬──────────────────────┘   │
│                                                                            │                          │
│                                                     ┌──────────────────────▼──────────────────────┐   │
│                                                     │   4-Factor Dynamic Impact Scoring Engine    │   │
│                                                     │   0.35·Reach + 0.30·Comp + 0.20·Rev + 0.15  │   │
│                                                     └──────────────────────┬──────────────────────┘   │
│                                                                            │                          │
│                                                     ┌──────────────────────▼──────────────────────┐   │
│                                                     │      SQLite Database (outageiq.db)          │   │
│                                                     │  - Auto-Migration & Schema Setup            │   │
│                                                     │  - Auto-Seeding from Raw CSVs / Telemetry   │   │
│                                                     └─────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Environment Variables & Configuration Reference

OutageIQ utilizes a centralized configuration system driven by environment variables or a `.env` file at the repository root.

| Environment Variable | Default Value | Description |
| :--- | :--- | :--- |
| **`PORT`** | `8000` | HTTP port the unified single server listens on. |
| **`HOST`** | `0.0.0.0` | Network binding address (`0.0.0.0` for all interfaces, `127.0.0.1` for localhost). |
| **`DB_PATH`** | `backend/data/outageiq.db` | Filepath to the SQLite database storage. |
| **`OUTAGE_DATA_PATH`** | `backend/data/raw/outage_alerts.csv` | Raw network outage alerts source file. |
| **`COMPLAINT_DATA_PATH`** | `backend/data/raw/complaint_logs.csv` | Raw customer complaint telemetry source file. |
| **`USAGE_DATA_PATH`** | `backend/data/raw/region_usage_metrics.csv` | Raw demographic and revenue metrics source file. |
| **`IMPACT_WEIGHT_REACH`** | `0.35` | Scoring weight for Customer Reach component (PRD Section 7). |
| **`IMPACT_WEIGHT_COMPLAINTS`** | `0.30` | Scoring weight for Complaint Pressure component. |
| **`IMPACT_WEIGHT_REVENUE`** | `0.20` | Scoring weight for Revenue Exposure component. |
| **`IMPACT_WEIGHT_DURATION`** | `0.15` | Scoring weight for Duration & Severity component. |
| **`SLA_CRITICAL_HOURS`** | `2.0` | Resolution SLA threshold for Critical P1 tier incidents. |
| **`SLA_HIGH_HOURS`** | `4.0` | Resolution SLA threshold for High P2 tier incidents. |
| **`SLA_MEDIUM_HOURS`** | `8.0` | Resolution SLA threshold for Medium P3 tier incidents. |
| **`SLA_LOW_HOURS`** | `24.0` | Resolution SLA threshold for Low tier maintenance events. |

---

## 3. Quick Start (Step-by-Step Setup Guide)

### Step 3.1: Clone Repository & Create Virtual Environment
```bash
git clone https://github.com/kalviumcommunity/S84_TheNOCSquad_OutageIQ.git
cd S84_TheNOCSquad_OutageIQ

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate
```

### Step 3.2: Install Python & Node Dependencies
```bash
# Install Python backend dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt

# Install Node.js frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3.3: Configure Environment Variables
Copy the template configuration to create your local `.env`:
```bash
cp .env.example .env
```

### Step 3.4: Build the UI Production Package
Compile the multi-page Next.js dashboard routes:
```bash
npm --prefix frontend run build
```

### Step 3.5: Launch the Unified Python Single Server
Run the single-server app from the root or backend directory:
```bash
# Option A: From root directory
python3 server.py

# Option B: With custom port and host arguments
python3 backend/server.py --port 8000 --host 0.0.0.0
```

Once launched, access the dashboard and APIs in your browser:
- 👉 **Web Application:** `http://localhost:8000`
- 👉 **Overview Page:** `http://localhost:8000/overview`
- 👉 **Outage Queue (Rahul):** `http://localhost:8000/queue`
- 👉 **Region View (Priya):** `http://localhost:8000/regions`
- 👉 **Analytics (Farah/Vikram):** `http://localhost:8000/analytics`
- 👉 **Exportable Data:** `http://localhost:8000/export`
- 👉 **REST API Health:** `http://localhost:8000/api/health`

---

## 4. SQLite Database Architecture & Automated Seeding

The single-server application automatically initializes and maintains the SQLite database at `backend/data/outageiq.db`.

### 4.1. Database Schema Definitions

```sql
-- 1. Network Outages Table
CREATE TABLE IF NOT EXISTS outages (
    outage_id TEXT PRIMARY KEY,
    short_id TEXT,
    region_name TEXT,
    region_code TEXT,
    node_id TEXT,
    severity TEXT,
    impact_score REAL,
    status TEXT,
    complaints_count INTEGER,
    duration_text TEXT,
    duration_hours REAL,
    priority_tier TEXT,
    subscribers_affected INTEGER,
    revenue_exposure_hourly TEXT,
    sla_status TEXT,
    sla_target_hours REAL,
    subscore_reach REAL,
    subscore_complaints REAL,
    subscore_revenue REAL,
    subscore_duration REAL,
    root_cause TEXT,
    created_at TEXT
);

-- 2. Regional Demographics & Revenue Table
CREATE TABLE IF NOT EXISTS regions (
    region_id TEXT PRIMARY KEY,
    name TEXT,
    subscribers_count INTEGER,
    subscribers_formatted TEXT,
    impact_score REAL,
    revenue_tier TEXT,
    active_outages INTEGER,
    revenue_exposure_hourly TEXT,
    sla_compliance REAL,
    dominant_severity TEXT
);

-- 3. Customer Complaint Telemetry Table
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id TEXT PRIMARY KEY,
    outage_id TEXT,
    region_name TEXT,
    timestamp TEXT,
    channel TEXT,
    category TEXT,
    match_type TEXT
);
```

### 4.2. Automated Data Seeding
Upon initial launch, if `outageiq.db` is empty or absent, the server automatically seeds the database with verified operational signal matching the PRD specification and UI mockups.

---

## 5. REST API Documentation

The single server exposes full REST endpoints under `/api/*`:

### 5.1. `GET /api/health`
Checks server and database health status.
```json
{
  "status": "healthy",
  "service": "OutageIQ Single Server",
  "version": "1.0.0",
  "timestamp": "2026-07-23T09:41:08Z",
  "database": "sqlite3 connected"
}
```

### 5.2. `GET /api/outages`
Returns ranked list of active outages. Supports query filtering:
- `?region=Mumbai`
- `?severity=Critical`
- `?status=Open`
- `?sort=score|complaints|duration`

### 5.3. `GET /api/outages/{outage_id}`
Returns granular telemetry and explainable sub-score breakdown for a single outage.

### 5.4. `GET /api/regions`
Returns regional aggregations, subscriber counts, and SLA compliance metrics.

### 5.5. `GET /api/analytics`
Returns executive KPIs, hourly complaint velocity, 7-day rolling volume curves, and severity distributions.

### 5.6. `GET /api/export/csv`
Downloads standardized CSV export of all ranked active outages.

### 5.7. `POST /api/recalculate`
Dynamically adjusts scoring weights and recomputes all grid impact scores in real-time.
```json
{
  "weight_reach": 0.40,
  "weight_complaints": 0.30,
  "weight_revenue": 0.20,
  "weight_duration": 0.10
}
```

### 5.8. `POST /api/outages/{outage_id}/escalate`
Escalates incident to P1 Critical priority and dispatches emergency alerts.

---

## 6. Running Automated Tests

Run the complete 3-tier test suite across Python unit tests, backend scripts, and Playwright end-to-end user journeys:

```bash
./run_tests.sh
```

---

## 7. Production Deployment (Systemd / Docker)

### Systemd Service Configuration (`/etc/systemd/system/outageiq.service`):
```ini
[Unit]
Description=OutageIQ Unified Single Server
After=network.target

[Service]
Type=simple
User=noc-admin
WorkingDirectory=/opt/outageiq
Environment="PORT=8000"
Environment="HOST=0.0.0.0"
ExecStart=/opt/outageiq/venv/bin/python3 /opt/outageiq/server.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

To enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable outageiq
sudo systemctl start outageiq
```
