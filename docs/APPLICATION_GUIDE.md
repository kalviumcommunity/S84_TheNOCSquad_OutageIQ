# OutageIQ — Complete Application & Feature Navigation Guide

**Document Version:** 2.0.0 (Production Release)  
**System Classification:** Enterprise Telecommunications Network Operations Platform  
**Target Roles:** NOC Engineers, Regional Operations Managers, Customer Experience Leads, and Operations Directors

---

## 1. Executive System Overview & Core Capabilities

**OutageIQ** is an enterprise-grade network outage impact prioritization and decision-support platform built for modern telecommunications Network Operations Centers (NOCs).

### 1.1 The Operational Problem Solved
Traditional telecom NOC operations rely on static, single-variable alarm severities (*P1 / P2 / P3*) or basic ticket timestamps. This causes critical operational blind spots:
- A technically "minor" cell alarm in a dense metro circle (e.g., Mumbai or Delhi NCR) affecting 40,000 enterprise subscribers is deprioritized behind a rural alarm affecting only a handful of users.
- Customer support channels are flooded with complaint spikes before engineers identify the root cause.
- Unmonitored SLA clocks lead to contract breach penalties and subscriber churn.

### 1.2 The Unified OutageIQ Solution
OutageIQ unifies telemetry from **three distinct operational data sources**:
1. **Network Outage Alerts:** Node IDs, start/end timestamps, alarm severities, affected services, root cause codes.
2. **Customer Complaint Streams:** Tickets from Call Centers, Mobile Apps, and Web Portals with temporal linkage.
3. **Region Usage Metrics:** Active subscriber counts, daily traffic, demographic revenue tiers (Premium, High, Mid, Standard), and hourly revenue exposure.

The platform executes a **4-Factor Vectorized Composite Impact Scoring Engine (0–100)**, assigns operational priority tiers (**Critical / High / Medium / Low**), tracks **SLA countdown timers**, and delivers real-time triage dashboards, geo-analytics, and automated executive reports.

```
┌───────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐
│   Network Outage Alerts   │  │  Customer Complaint Logs  │  │   Region Usage Metrics    │
│  outage_alerts.csv / json │  │    complaint_logs.csv     │  │  region_usage_metrics.csv │
└─────────────┬─────────────┘  └─────────────┬─────────────┘  └─────────────┬─────────────┘
              │                              │                              │
              └───────────────────────┬──────┴──────────────────────────────┘
                                      │
                                      ▼
        ┌───────────────────────────────────────────────────────────┐
        │    Ingestion, Data Cleaning & Schema Validation Engine    │
        │      (backend/scripts/ingestion.py, validate_intake.py)   │
        └─────────────────────────────┬─────────────────────────────┘
                                      │
                                      ▼
        ┌───────────────────────────────────────────────────────────┐
        │   Spatio-Temporal Sliding Window Complaint Fusion Engine  │
        │   (±2.0h Sliding Window Matching & Confidence Multiplier) │
        └─────────────────────────────┬─────────────────────────────┘
                                      │
                                      ▼
        ┌───────────────────────────────────────────────────────────┐
        │       4-Factor Dynamic Vectorized Impact Scoring (0-100)  │
        │    0.35·Reach + 0.30·Complaints + 0.20·Revenue + 0.15·Dur │
        │              (backend/scripts/scoring.py)                 │
        └─────────────────────────────┬─────────────────────────────┘
                                      │
                                      ▼
        ┌───────────────────────────────────────────────────────────┐
        │      SQLite Storage & Unified Single-Server REST API      │
        │             (backend/server.py, outageiq.db)              │
        └─────────────────────────────┬─────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌───────────────┐             ┌───────────────┐             ┌───────────────┐
│   Overview    │             │ Outage Queue  │             │  Region View  │
│  (/, /overview│             │(/queue, /outag│             │(/regions, /reg│
│  OverviewView │             │  QueueView.tsx│             │ RegionsView.ts│
└───────┬───────┘             └───────┬───────┘             └───────┬───────┘
        │                             │                             │
        └─────────────────────────────┼─────────────────────────────┘
                                      │
        ┌─────────────────────────────┴─────────────────────────────┐
        ▼                                                           ▼
┌───────────────┐                                           ┌───────────────┐
│   Analytics   │                                           │Exportable Data│
│  (/analytics) │                                           │(/export, /expo│
│ AnalyticsView │                                           │ ExportView.tsx│
└───────────────┘                                           └───────────────┘
```

---

## 2. Backend Background & Data Provenance

### 2.1. Source Data Files
- **Network Outage Alerts:** [`backend/data/raw/outage_alerts.csv`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/backend/data/raw/outage_alerts.csv) & [`backend/data/raw/outages.json`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/backend/data/raw/outages.json)
- **Customer Complaint Logs:** [`backend/data/raw/complaint_logs.csv`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/backend/data/raw/complaint_logs.csv)
- **Region Usage Metrics:** [`backend/data/raw/region_usage_metrics.csv`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/backend/data/raw/region_usage_metrics.csv)

### 2.2. SQLite Database Architecture (`backend/data/outageiq.db`)
- `outages` Table: Stores active and historical incidents, composite scores (0–100), duration hours, priority tiers (`P1`, `P2`, `P3`), 4 sub-scores (Reach, Complaints, Revenue, Duration), SLA status, and root causes.
- `regions` Table: Stores geographic circle metrics, total subscriber base, hourly revenue exposure, active incident counters, dominant severity codes, and circle SLA compliance percentages.
- `complaints` Table: Stores customer tickets, channels (Call Center, App, Web), categories, and explicit/temporal match tags.

### 2.3. Python Analytics & Scoring Pipeline Engines
- **Ingestion & Data Cleaning:** [`backend/scripts/ingestion.py`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/backend/scripts/ingestion.py) — Parses CSV/JSON, strips whitespace, standardizes IDs to uppercase, normalizes status, removes duplicate records, and executes sliding window temporal complaint fusion ($\Delta t \in [0.5\text{h}, 6.0\text{h}]$).
- **Intake Schema Validation:** [`backend/scripts/validate_intake.py`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/backend/scripts/validate_intake.py) — Validates schema completeness, detects null primary keys, and produces automated health reports.
- **4-Factor Vectorized Scoring:** [`backend/scripts/scoring.py`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/backend/scripts/scoring.py) — Executes min-max relative normalization across active baseline and calculates composite scores:
  $$\text{Impact Score} = 100 \times \left( 0.35 \cdot \widetilde{R} + 0.30 \cdot \widetilde{C} + 0.20 \cdot \widetilde{V} + 0.15 \cdot \widetilde{D} \right)$$
- **Queue Ranking & Real-time Recompute:** [`backend/scripts/queue_manager.py`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/backend/scripts/queue_manager.py) — Multi-key deterministic tie-breaker resolving equal scores (`Score` $\to$ `Subscribers` $\to$ `Complaints` $\to$ `ID`).
- **Geo-Operational Analytics:** [`backend/scripts/geo_analytics.py`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/backend/scripts/geo_analytics.py) — Groups incidents by telecom circle, calculating total affected subscribers, hourly revenue exposure, and regional density ratings.
- **Trend & Velocity Analytics:** [`backend/scripts/trend_analytics.py`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/backend/scripts/trend_analytics.py) — Computes executive KPIs, rolling 7-day/30-day trends, MTTR averages, and critical escalation events ($\ge 75.0$).
- **SLA Tracking & Reporting:** [`backend/scripts/reporting.py`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/backend/scripts/reporting.py) — Evaluates SLA thresholds (Critical: 2h, High: 4h, Medium: 8h, Low: 24h), filters records, generates top 5 executive summaries, and formats CSV/PDF exports.

### 2.4. Unified Single-Server REST API Endpoints ([`backend/server.py`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/backend/server.py))
- `GET /api/health` — Platform health check, database connectivity status, and service uptime.
- `GET /api/outages` — Filterable prioritized triage queue (query params: `region`, `severity`, `status`, `sort`).
- `GET /api/outages/<outage_id>` — Explainable outage drill-down payload with 4 sub-scores and root cause.
- `GET /api/regions` — Ranked telecom circles with subscriber numbers, revenue tiers, and SLA compliance.
- `GET /api/analytics` — Executive KPIs, 7-day volume trends, hourly complaint velocity, and severity donut distribution.
- `GET /api/executive-summary` — Presentation-ready weekly executive briefing and top 5 outages.
- `GET /api/export/csv` — Standardized CSV export attachment.
- `POST /api/recalculate` — Vectorized recalculation using custom scoring weights.
- `POST /api/outages/<id>/escalate` — Escalates incident to P1 priority tier.
- `POST /api/outages/<id>/assign` — Assigns incident to field response team.

---

## 3. UI Navigation & Page-by-Page Verification Guide

The OutageIQ frontend is a multi-page web application. Follow the step-by-step instructions below to verify every feature by navigating the UI.

```
Application Navigation Routes:
  ├── [1] /overview or /     -> Overview Mission-Control Dashboard
  ├── [2] /queue             -> Prioritized Outage Triage Queue
  ├── [3] /regions           -> Regional Impact Heatmap & Matrix
  ├── [4] /analytics         -> Velocity Trends & Executive Briefing
  └── [5] /export            -> Automated CSV & PDF Export Hub
```

---

### Route 1: Overview Dashboard (`/` or `/overview`)

* **Primary Persona:** Rahul K. (NOC Engineer), Priya S. (Regional Ops Manager), All Operations Staff
* **Mission:** Real-time visibility into active network incidents, emergency alerting, and top KPIs.

#### How to Check & Verify in the UI:
1. **Navigate to:** Open `http://localhost:3000/` or `http://localhost:3000/overview` in your browser.
2. **Emergency Alert Banner:**
   - **What to look for:** A red alert banner at the top notifying operators: *"🚨 2 new outages crossed into Critical tier in the last 30 minutes — Mumbai & Delhi NCR require immediate attention."*
   - **Interaction:** Click the `"View Outages →"` link. It immediately routes to the Outage Queue (`/queue`).
3. **Top 5 Operational KPI Cards:**
   - **What to look for:** 5 high-contrast metric cards displaying:
     - `ACTIVE OUTAGES`: **24** (`↑ 6 from yesterday`)
     - `CRITICAL`: **5** (`Requires P1 action`)
     - `CUSTOMERS IMPACTED`: **2.48M** (`Across 8 regions`)
     - `AVG RESOLUTION TIME`: **3h 42m** (`Target: 4h`)
     - `REVENUE AT RISK`: **₹8.76 Cr** (`Hourly exposure`)
4. **Prioritized Queue Summary Table:**
   - **What to look for:** Tabular list of active incidents sorted by Impact Score. Columns display `Outage ID`, `Region`, `Severity`, `Impact Score Progress Bar`, `Status`, `Complaints`, `Priority Tier Pill`.
   - **Interaction:** Click on row `OUT-2026-0723-N91` (Mumbai).
   - **Result:** The right-hand SVG gauge and sub-scores instantly update to show Mumbai's `92.4` score.
   - **Interaction:** Click on row `OUT-2026-0723-N12` (Bangalore).
   - **Result:** The gauge immediately animates to `74.3` with Bangalore's sub-scores.
5. **Impact Score Circular SVG Gauge & Sub-Score Breakdown:**
   - **What to look for:** Circular score meter and 4-part horizontal sub-score progress bars showing exact component contributions:
     - **Customer Reach (35% Wt):** Subscribers affected in region ÷ Total base
     - **Complaint Pressure (30% Wt):** Call & app ticket velocity
     - **Revenue Exposure (20% Wt):** Regional revenue tier $\times$ duration
     - **Duration & Severity (15% Wt):** Alarm code $\times$ elapsed time
6. **7-Day Trend Line Chart & Hourly Complaint Velocity Bar Chart:**
   - **What to look for:** Dual-series SVG chart on the bottom-left plotting active volume against mean impact score (Jul 17 to Jul 23). Hourly complaint distribution bar chart on the bottom-right (06:00 to 22:00).
   - **Interaction:** Hover over any date or hourly bar to see tooltips displaying exact counts.

---

### Route 2: Outage Queue (`/queue` or `/outage-queue`)

* **Primary Persona:** Rahul K. (NOC Engineer)
* **Mission:** Deterministic ranked action queue with sub-score explainability and direct dispatch controls.

#### How to Check & Verify in the UI:
1. **Navigate to:** Click `"Outage Queue"` in the left sidebar or visit `http://localhost:3000/queue`.
2. **Full Prioritized Outage Triage Queue:**
   - **What to look for:** Deterministic ranking badges (`#1`, `#2`, `#3`...).
   - **Incident #1:** `OUT-2026-0723-N91` | Mumbai | Severity: `Critical` | Impact Score: `92.4` | Complaints: `1,842` | Priority: `P1`.
   - **Incident #2:** `OUT-2026-0722-N44` | Delhi NCR | Severity: `Critical` | Impact Score: `87.1` | Complaints: `1,531` | Priority: `P1`.
   - **Incident #3:** `OUT-2026-0723-N12` | Bangalore | Severity: `High` | Impact Score: `74.3` | Complaints: `940` | Priority: `P2`.
3. **Full-Text Search & Multi-Parameter Filter Toolbar:**
   - **Interaction:** In the search input, type `"Fiber"`.
   - **Result:** Table immediately filters to display only outages caused by fiber cuts (e.g. `OUT-2026-0723-N91`).
   - **Interaction:** Clear search, select the **Severity** dropdown $\to$ `"Critical"`.
   - **Result:** Table displays only P1 Critical outages.
   - **Interaction:** Select the **Sort** dropdown $\to$ `"Sort: Complaints"`.
   - **Result:** Table reorders to place highest complaint volume first. Click `"Reset"` to clear all filters.
4. **Interactive Detail & Sub-Score Inspection Drawer:**
   - **Interaction:** Click on any row in the table (e.g. `OUT-2026-0723-N91` Mumbai).
   - **Result:** The right-hand detail inspector opens displaying:
     - Node Name: `Node-MUM-Core-01`
     - Root Cause: `Core Backhaul Gateway Fiber Severance near BKC Data Hub`
     - Affected Services: `5G Data`, `VoLTE`, `Enterprise Leased Lines`
     - Sub-Score Breakdown: Reach (88/100), Complaints (95/100), Revenue (90/100), Duration (72/100)
5. **Operational Action Controls ("Escalate" & "Assign"):**
   - **Interaction:** In the inspection drawer, click the solid purple `"Escalate"` button.
   - **Result:** A confirmation toast notification appears: *"Outage OUT-2026-0723-N91 escalated to P1 tier."*
   - **Interaction:** Click `"Assign"` to assign the ticket to Tier 3 engineering.

---

### Route 3: Region View (`/regions` or `/region-view`)

* **Primary Persona:** Priya S. (Regional Operations Manager)
* **Mission:** Geo-operational impact density ranking, demographic revenue tier tracking, and regional SLA health.

#### How to Check & Verify in the UI:
1. **Navigate to:** Click `"Region View"` in the left sidebar or visit `http://localhost:3000/regions`.
2. **Region Impact Density Ranking List:**
   - **What to look for:** 8 telecom circles ranked from highest to lowest composite impact density:
     - **#1 Mumbai** — 4.2M subscribers | Impact Score: **92** | `[Premium]` tier
     - **#2 Delhi NCR** — 3.8M subscribers | Impact Score: **87** | `[Premium]` tier
     - **#3 Bangalore** — 2.9M subscribers | Impact Score: **74** | `[Premium]` tier
     - **#4 Chennai** — 1.8M subscribers | Impact Score: **69** | `[High]` tier
     - **#5 Hyderabad** — 2.1M subscribers | Impact Score: **62** | `[High]` tier
     - **#6 Pune** — 1.4M subscribers | Impact Score: **55** | `[Mid]` tier
     - **#7 Kolkata** — 1.2M subscribers | Impact Score: **45** | `[Mid]` tier
     - **#8 Ahmedabad** — 0.9M subscribers | Impact Score: **31** | `[Standard]` tier
3. **Comparative Impact Score Horizontal Bar Chart:**
   - **What to look for:** Horizontal comparative bar chart mapping all 8 regions on a normalized 0–100 scale with severity color gradients.
4. **Top 4 Regional Summary Cards:**
   - **What to look for:** Highlighted cards for Mumbai, Delhi NCR, Bangalore, and Hyderabad displaying large Impact Scores, subscriber volumes, revenue tiers, active incidents, and hourly exposure.
5. **1-Click Circle Queue Filtering:**
   - **Interaction:** Click the `"Filter Queue by Mumbai"` link on the Mumbai summary card.
   - **Result:** Browser navigates directly to `/queue` with the table filtered exclusively to Mumbai incidents.

---

### Route 4: Analytics (`/analytics`)

* **Primary Personas:** Farah C. (Customer Experience Lead) & Vikram D. (Leadership / Director)
* **Mission:** Hourly complaint velocity correlation, 7-day rolling volume trends, and weekly executive briefings.

#### How to Check & Verify in the UI:
1. **Navigate to:** Click `"Analytics"` in the left sidebar or visit `http://localhost:3000/analytics`.
2. **2x2 Multi-Chart Analytics Grid:**
   - **Chart 1 (Top-Left):** 7-Day Outage Volume Trend (purple time-series curve tracking daily active incident volumes from Jul 17 to Jul 23).
   - **Chart 2 (Top-Right):** Avg Impact Score Trend (orange curve with interactive tooltips on hover, e.g. *Jul 20: Avg Impact Score: 67*).
   - **Chart 3 (Bottom-Left):** Today's Complaint Velocity (hourly bar chart from 06:00 to 22:00 showing ticket arrival velocity surges).
   - **Chart 4 (Bottom-Right):** Severity Distribution Donut Chart (visual breakdown: High: 8, Critical: 5, Medium: 7, Low: 4).
3. **Executive Summary Briefing Panel:**
   - **What to look for:** Full-width card summarizing the active operational week (**Week of Jul 17 – Jul 23, 2026**).
   - **4 Executive KPIs:**
     - `Total Outages`: **84** (`↑ 12% vs prior week`)
     - `Avg Resolution`: **3h 52m** (`Within 4h SLA`)
     - `Revenue at Risk`: **₹42.3 Cr** (`Week total exposure`)
     - `SLA Compliance`: **84%** (`Target: 90%`)
4. **Top 5 Highest-Impact Outages Table:**
   - **What to look for:** Ranked leadership review list (#1 Mumbai 92.4, #2 Delhi NCR 87.1, #3 Bangalore 74.3, #4 Chennai 68.9, #5 Pune 55.2).
5. **Executive PDF Briefing Generation:**
   - **Interaction:** Click the `"Export PDF"` button inside the Executive Briefing card.
   - **Result:** Generates formatted leadership briefing report.

---

### Route 5: Exportable Data (`/export` or `/exportable-data`)

* **Primary Personas:** Vikram D. (Leadership / Director) & Operations Auditors
* **Mission:** Standardized CSV and PDF report downloads with live tabular preview.

#### How to Check & Verify in the UI:
1. **Navigate to:** Click `"Exportable Data"` in the left sidebar or visit `http://localhost:3000/export`.
2. **3 Quick-Export Report Cards:**
   - **1. Prioritized Outage List** $\to$ `[CSV]` format tag (Full ranked list with sub-scores and root causes).
   - **2. Executive Summary Report** $\to$ `[PDF]` format tag (Top 5 incidents + executive KPI summary).
   - **3. Region Impact Report** $\to$ `[CSV]` format tag (Geographic circle breakdown with subscriber counts and revenue tiers).
3. **Live Tabular Data Preview:**
   - **What to look for:** Complete real-time tabular preview of the active prioritized queue.
4. **Download Action Toolbar:**
   - **Interaction:** Click the solid purple `"Export CSV"` button.
   - **Result:** Browser immediately downloads `outageiq_prioritized_queue_YYYY-MM-DD.csv`.
   - **Interaction:** Click the outline `"Export PDF Summary"` button to download the formatted executive briefing.

---

## 4. Master Route Verification Matrix

| Route | Primary Component | Target Persona | Backend Data Origin & REST API | Interactive Features & Verification Action |
| :--- | :--- | :--- | :--- | :--- |
| **`/` or `/overview`** | [`OverviewView.tsx`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/frontend/components/OverviewView.tsx) | Rahul K., Priya S., All | SQLite `outages`, `scoring.py`, `GET /api/analytics` | • Red Emergency Alert Banner (click to jump to queue)<br>• 5 KPI cards (Active, Critical, Subs, MTTR, Revenue)<br>• Click row to update circular SVG gauge & 4 sub-scores<br>• Hover over 7-Day volume and hourly velocity charts |
| **`/queue`** | [`QueueView.tsx`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/frontend/components/QueueView.tsx) | Rahul K. (NOC Eng) | `queue_manager.py`, `scoring.py`, `GET /api/outages` | • Deterministic `#1`, `#2` ranked triage table<br>• Real-time search by ID, Node, or Root Cause<br>• Severity and Sort dropdowns<br>• Click row to open Sub-Score Inspector drawer<br>• Click `"Escalate"` (P1 toast) & `"Assign"` |
| **`/regions`** | [`RegionsView.tsx`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/frontend/components/RegionsView.tsx) | Priya S. (Regional Ops) | SQLite `regions`, `geo_analytics.py`, `GET /api/regions` | • 8 telecom circles ranked #1 to #8 with revenue tier badges<br>• Horizontal comparative impact bar chart<br>• Top 4 highlighted region summary cards<br>• Click `"Filter Queue by [Region]"` to jump to `/queue` |
| **`/analytics`** | [`AnalyticsView.tsx`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/frontend/components/AnalyticsView.tsx) | Farah C. (CX) & Vikram D. | `trend_analytics.py`, `reporting.py`, `GET /api/analytics` | • 2x2 multi-chart grid (Volume, Score, Velocity, Donut)<br>• Executive Summary panel with weekly KPIs<br>• Top 5 highest-impact incidents table<br>• Click `"Export PDF"` briefing generator |
| **`/export`** | [`ExportView.tsx`](file:///home/karan-devgan/Kalvium_SW/S84_TheNOCSquad_OutageIQ/frontend/components/ExportView.tsx) | Vikram D. & Auditors | `reporting.py`, `GET /api/export/csv` | • 3 quick-export report cards (CSV / PDF / CSV)<br>• Live tabular data preview<br>• Click `"Export CSV"` (downloads formatted CSV file)<br>• Click `"Export PDF Summary"` |

---

## 5. How to Run, Test & Verify the Full Stack

### 5.1. Start Single-Server Python Application
```bash
# Starts unified Python single server hosting REST API and static frontend:
python3 backend/server.py --port 8000
```
- Open `http://localhost:8000/` in your browser.
- Health Check: `http://localhost:8000/api/health`
- Triage API: `http://localhost:8000/api/outages`

### 5.2. Start Next.js Development Server
```bash
# Starts Next.js development server on port 3000:
cd frontend
npm run dev
```
- Open `http://localhost:3000/overview` or `http://localhost:3000/` to explore the dashboard.

### 5.3. Execute Automated Unified Test Suite
```bash
# Runs full test suite across Python, Backend, and Playwright E2E suites:
./run_tests.sh
```
- **Python Unit Tests:** 66/66 passing (`venv/bin/python3 -m unittest discover -s backend/tests`)
- **Playwright E2E Tests:** 46/46 passing (`npm --prefix frontend run test:e2e`)
