# OutageIQ — Full-Stack Technical & Application Guide

**System Deployment:** Single-Server Unified Platform (`http://localhost:8000`)  
**Document Version:** 2.2.0 (Production Single-Server Release)  
**System Classification:** Enterprise Telecommunications Network Operations Platform  
**Target Roles:** NOC Engineers, Regional Operations Managers, Customer Experience Leads, and Operations Directors

---

## 1. Single-Server Unified Platform Architecture

OutageIQ runs as a **single-server application hosted on port 8000** (`python3 backend/server.py --port 8000`).

All telemetry, ranking algorithms, database queries, and UI actions are **100% live and dependent on the Python & SQLite backend**:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 1. SOURCE TELEMETRY                                      │
│  outage_alerts.csv (NOC)   │   complaint_logs.csv (CRM)   │ region_usage_metrics.csv (ERP)│
└────────────────────────────┬──────────────────────────────┴──────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                             2. PYTHON ANALYTICS ENGINE                                   │
│  • ingestion.py          : CSV/JSON intake, schema validation, data deduplication        │
│  • ingestion.py (match)  : Spatio-temporal complaint fusion (±2.0h sliding window)       │
│  • scoring.py            : Vectorized 4-factor min-max relative score calculator (0-100) │
│  • queue_manager.py      : Multi-key deterministic priority ranking & tie-breaker        │
│  • geo_analytics.py      : Demographic circle aggregation, density & revenue exposure    │
│  • trend_analytics.py    : 7-day rolling window, MTTR tracking, breach escalation alarms  │
│  • reporting.py          : SLA threshold countdowns, PDF/CSV report generation           │
└────────────────────────────┬─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                             3. SQLITE DATABASE ENGINE                                    │
│                     Embedded File: backend/data/outageiq.db                              │
│  • outages table         : 22 attributes (ID, scores, 4 sub-scores, SLA timers, cause)   │
│  • regions table         : 10 attributes (subscribers, tier, active count, compliance)   │
│  • complaints table      : 7 attributes (complaint ID, timestamps, channels, match tags) │
└────────────────────────────┬─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                   4. UNIFIED SINGLE-SERVER REST API (PORT 8000)                          │
│  GET  /api/health            GET  /api/outages             GET  /api/outages/<id>        │
│  GET  /api/regions           GET  /api/analytics           GET  /api/executive-summary   │
│  GET  /api/export/csv        POST /api/recalculate         POST /api/outages/<id>/escalate│
└────────────────────────────┬─────────────────────────────────────────────────────────────┘
                             │ Live REST JSON Streaming & UI Delivery
                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                   5. PRODUCTION UI ROUTES (http://localhost:8000)                        │
│  • http://localhost:8000/overview  : Live KPIs, circular SVG gauge, sub-scores, trends   │
│  • http://localhost:8000/queue     : Ranked deterministic queue, region filter, escalate │
│  • http://localhost:8000/regions   : Circle matrix, bar chart, "Filter Queue by Region"  │
│  • http://localhost:8000/analytics : 2x2 multi-chart grid, weekly briefing, top 5 outages│
│  • http://localhost:8000/export    : 3 export cards, tabular queue, CSV/PDF downloads    │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Live Regional Queue Filtering Walkthrough ("Filter Queue by Mumbai")

### How it Works in the UI:
1. **Navigate to Region View:** Open `http://localhost:8000/regions`.
2. **Select a Circle:**
   - Click on **#1 Mumbai** in the left ranking list, OR click on the **Mumbai bar** in the horizontal comparative chart, OR click on the **Mumbai card** in the bottom grid.
3. **Locate the Filter Action Buttons:**
   - **Action Button 1 (Selected Region Bar under Chart):** A purple action bar appears below the horizontal chart displaying:  
     `Selected: Mumbai • Exposure: ₹45.2 L/hr • SLA: 82.0%`  
     Right beside it is a solid purple button: **`[ Filter Queue by Mumbai → ]`**.
   - **Action Button 2 (Summary Card):** On the Mumbai card at the bottom, there is a dedicated button: **`[ Filter Queue by Mumbai → ]`**.
   - **Action Button 3 (Top-Right List Header):** A button appears in the top-right of the ranking card: **`[ Filter Queue by Mumbai ]`**.
4. **Click the Button:**
   - The browser navigates directly to `http://localhost:8000/queue?region=Mumbai`.
5. **Inspect the Filtered Queue on `/queue`:**
   - A purple active filter pill appears at the top: `Filtering queue by circle: Mumbai [ Clear Region Filter ]`.
   - The **Region** dropdown in the filter bar is automatically set to `"Mumbai"`.
   - The table executes a live backend query (`GET /api/outages?region=Mumbai`) and displays only outages located in the Mumbai circle (e.g. `OUT-2026-0723-N91`).
   - Click **`[ Clear Region Filter ]`** or change the dropdown to `"All Regions"` at any time to reset the table.

---

## 3. How to Verify Backend Reality (Terminal & UI Proofs)

Run these tests against your running single server (`http://localhost:8000`):

### Proof 1: Query Live REST API Endpoints
```bash
# 1. Health & Database connectivity check
curl -s http://localhost:8000/api/health | jq .

# 2. Query only Mumbai outages from SQLite
curl -s "http://localhost:8000/api/outages?region=Mumbai" | jq '.outages[] | {id: .outage_id, region: .region_name, score: .impact_score, root_cause: .root_cause}'

# 3. Query regional ranking from SQLite
curl -s http://localhost:8000/api/regions | jq '.regions[] | {name: .name, score: .impact_score, tier: .revenue_tier}'

# 4. Query live CSV export stream
curl -s http://localhost:8000/api/export/csv | head -n 4
```

---

### Proof 2: Verify Real Database Mutation via UI Escalation
1. **Check current database state in terminal:**
   ```bash
   venv/bin/python -c "
   import sqlite3
   c = sqlite3.connect('backend/data/outageiq.db').cursor()
   print(c.execute(\"SELECT outage_id, priority_tier, status FROM outages WHERE outage_id='OUT-2026-0723-N12';\").fetchone())
   "
   # Output: ('OUT-2026-0723-N12', 'P2', 'Open')
   ```
2. **Perform Action in UI:** Go to `http://localhost:8000/queue`, click row `OUT-2026-0723-N12` (Bangalore), and click the purple **"Escalate Ticket"** button.
3. **Verify Persistent Database Mutation:**
   ```bash
   venv/bin/python -c "
   import sqlite3
   c = sqlite3.connect('backend/data/outageiq.db').cursor()
   print(c.execute(\"SELECT outage_id, priority_tier, status FROM outages WHERE outage_id='OUT-2026-0723-N12';\").fetchone())
   "
   # Output: ('OUT-2026-0723-N12', 'P1', 'Active Triage')
   ```
   *The SQLite database file on disk was permanently updated by the Python server.*

---

### Proof 3: Dynamic Mathematical Recalculation with Custom Weights
Send custom scoring weights (e.g. increase complaints weight from 30% to 80%):
```bash
curl -X POST http://localhost:8000/api/recalculate \
  -H "Content-Type: application/json" \
  -d '{"weight_reach": 0.10, "weight_complaints": 0.80, "weight_revenue": 0.05, "weight_duration": 0.05}' | jq .
```
Then check the recalculated scores directly in SQLite:
```bash
venv/bin/python -c "
import sqlite3
c = sqlite3.connect('backend/data/outageiq.db').cursor()
for r in c.execute(\"SELECT outage_id, region_name, impact_score, priority_tier FROM outages ORDER BY impact_score DESC LIMIT 3;\").fetchall():
    print(r)
"
```

---

### Proof 4: Run the Backend Unit Test Suite
```bash
venv/bin/python -m unittest discover -s backend/tests
```
**Result:** `Ran 66 tests in ~1.3s — OK`.

---

## 4. Complete Page-by-Page & Persona Verification Guide

All pages are hosted on single-server port 8000:

| Route URL | Primary Persona | Backend Function & SQLite Query | What the UI Displays | Step-by-Step UI Verification |
| :--- | :--- | :--- | :--- | :--- |
| **`http://localhost:8000/overview`** | **Rahul K.** (NOC Eng)<br>**Priya S.** (Regional Ops) | `scoring.py`<br>`compute_impact_scores()`<br>`GET /api/analytics`<br>`GET /api/outages` | 5 system KPI cards, active triage queue, circular SVG gauge, 4-part sub-score bars, 7-day trend, and hourly complaint velocity. | 1. Open `http://localhost:8000/overview`.<br>2. Click row `OUT-2026-0723-N91` (Mumbai) $\to$ gauge displays `92.4`.<br>3. Click row `OUT-2026-0723-N12` (Bangalore) $\to$ gauge displays `74.3`.<br>4. Hover over trend line chart to inspect daily data points. |
| **`http://localhost:8000/queue`** | **Rahul K.** (NOC Eng) | `queue_manager.py`<br>`get_prioritized_queue()`<br>`GET /api/outages`<br>`POST /api/outages/<id>/escalate`<br>`POST /api/outages/<id>/assign` | Ranked triage table (`#1`, `#2`), full-text search, Region dropdown, Severity dropdown, Sort dropdown, and Outage Inspector drawer. | 1. Open `http://localhost:8000/queue`.<br>2. Select **Region** $\to$ `"Mumbai"` $\to$ only Mumbai incidents appear.<br>3. Type `"Fiber"` in search $\to$ filters to fiber cut incidents.<br>4. Click any outage $\to$ inspection drawer displays full root cause.<br>5. Click `"Escalate Ticket"` $\to$ triggers backend API call and updates status. |
| **`http://localhost:8000/regions`** | **Priya S.** (Regional Ops Mgr) | `geo_analytics.py`<br>`compute_regional_aggregations()`<br>`GET /api/regions` | 8 ranked circles (#1 Mumbai 92, #2 Delhi NCR 87), comparative horizontal bar chart, and 4 regional summary cards. | 1. Open `http://localhost:8000/regions`.<br>2. Click on **Mumbai** in the chart or cards.<br>3. Click the purple button **`[ Filter Queue by Mumbai → ]`** $\to$ navigates directly to `/queue?region=Mumbai`. |
| **`http://localhost:8000/analytics`** | **Farah C.** (CX Lead)<br>**Vikram D.** (Director) | `trend_analytics.py`<br>`compute_rolling_trends()`<br>`reporting.py`<br>`get_executive_summary()` | 2x2 multi-chart grid (Volume, Impact, Velocity, Donut), Executive Summary Briefing panel (84 outages, ₹42.3 Cr at risk), and Top 5 table. | 1. Open `http://localhost:8000/analytics`.<br>2. Inspect hourly complaint velocity (06:00 to 22:00).<br>3. Inspect Top 5 Highest-Impact Outages table.<br>4. Click `"Export PDF"` to generate a leadership briefing. |
| **`http://localhost:8000/export`** | **Vikram D.** (Director)<br>**Compliance Auditors** | `reporting.py`<br>`export_outages_to_csv()`<br>`GET /api/export/csv` | 3 quick-export report cards, live tabular queue preview, and automated CSV/PDF downloads. | 1. Open `http://localhost:8000/export`.<br>2. Review the live tabular queue preview.<br>3. Click `"Export CSV"` $\to$ browser downloads `OutageIQ_Prioritized_Queue_YYYY-MM-DD.csv`. |

---

## 5. How to Run the Single Server

```bash
# Start the unified single-server Python platform on port 8000:
python3 backend/server.py --port 8000
```
- Open `http://localhost:8000/` in your browser.
- Health Check: `http://localhost:8000/api/health`
- Triage API: `http://localhost:8000/api/outages`
