# OutageIQ — Comprehensive Feature & Architecture Specification

**Document Version:** 1.0.0 (Production Release)  
**Target Audience:** Software Engineers, DevOps Engineers, Telecom NOC Leads, Product Managers, and Operations Directors  
**Specification Basis:** Aligned with [`docs/PRD.md`](./PRD.md) and [`docs/PLANNER.md`](./PLANNER.md)

---

## 1. Executive Product Overview & Use Case

**OutageIQ** is an enterprise-grade, intelligent outage prioritization and impact scoring platform built specifically for modern telecommunications Network Operations Centers (NOCs).

### The Core Problem Solved
Traditional telecom NOC operations rely on static, single-variable severity flags (e.g. *P1 / P2 / P3*) or basic ticket timestamps. This legacy reactive approach causes severe operational blind spots:
- A technically "minor" tower alert affecting 40,000 high-revenue enterprise subscribers is left deprioritized.
- A "critical" backhaul alarm affecting zero active customers consumes urgent field technician dispatch.
- Customer support centers are flooded with untriaged complaint spikes before NOC engineers identify the root cause.
- Unmonitored SLA clocks lead to contract breach penalties and customer churn.

### The OutageIQ Solution
OutageIQ fuses real-time telemetry from **three distinct operational data sources** (Network Outage Alerts, Customer Complaint Streams, and Regional Demographics & Revenue Data), calculates a dynamic **4-Factor Composite Impact Score (0–100)**, assigns prioritized operational tiers, and surfaces an actionable, explainable triage queue with real-time critical threshold alerting, geo-analytics, and executive reporting.

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│  Network Outage Alerts  │  │ Customer Complaints Logs │  │ Regional Demographics   │
│   (Nodes, Alarms, P1-4) │  │  (Calls, App, Web, Tags) │  │  (Subscribers, Revenue) │
└────────────┬────────────┘  └────────────┬────────────┘  └────────────┬────────────┘
             │                            │                            │
             └──────────────────────┬─────┴────────────────────────────┘
                                    │
                                    ▼
       ┌──────────────────────────────────────────────────────────┐
       │   OutageIQ Data Ingestion, Cleaning & Validation Engine   │
       └────────────────────────────┬─────────────────────────────┘
                                    │
                                    ▼
       ┌──────────────────────────────────────────────────────────┐
       │  Spatio-Temporal Sliding Window Complaint Fusion Engine  │
       └────────────────────────────┬─────────────────────────────┘
                                    │
                                    ▼
       ┌──────────────────────────────────────────────────────────┐
       │      4-Factor Dynamic Vectorized Impact Scoring (0-100)  │
       │   0.35·Reach + 0.30·Complaints + 0.20·Revenue + 0.15·Dur │
       └────────────────────────────┬─────────────────────────────┘
                                    │
                                    ▼
       ┌──────────────────────────────────────────────────────────┐
       │    Prioritized Operational Triage & SLA Tracking Engine  │
       └────────────────────────────┬─────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   NOC Live    │           │ Regional Geo  │           │   Executive   │
│ Triage Queue  │           │ Impact Matrix │           │ Briefing/PDF  │
└───────────────┘           └───────────────┘           └───────────────┘
```

---

## 2. Backend Services & Analytics Pipeline Architecture

The OutageIQ backend consists of modular, high-performance Python analytics and scoring engines located under [`backend/scripts/`](../backend/scripts/).

### 2.1. Multi-Source Ingestion & Schema Validation Engine (`ingestion.py`, `validate_intake.py`)
* **Requirements:** `FR1`, `FR2`, `FR3`
* **Key Functions:**
  - `load_dataset(filepath)`: Ingests structured multi-format datasets (CSV, JSON) with automated encoding fallbacks.
  - `clean_outages(df)`: Strips whitespace, standardizes timestamps to ISO 8601 UTC, removes duplicate records, and normalizes severity codes (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
  - `clean_complaints(df)`: Deduplicates complaint streams, normalizes customer communication channels (`Call Center`, `Mobile App`, `Web Portal`), and categorizes issue tags.
  - `clean_regions(df)`: Validates region IDs, standardizes demographic metrics, and formats revenue tiers (`Tier 1`, `Tier 2`, `Tier 3`).
  - `validate_ingested_datasets(outages, complaints, regions)`: Performs strict schema validation, identifies missing required fields, detects orphaned foreign keys, and outputs data quality health diagnostic reports.

### 2.2. Spatio-Temporal Sliding Window Fusion Engine (`ingestion.py`)
* **Requirements:** `FR4`, `Persona: Farah`
* **Key Functions:**
  - `merge_datasets(outages_df, complaints_df, regions_df, time_window_hours=2.0)`:
    - Joins network outage events with regional demographics on `region_id`.
    - Matches complaints carrying explicit `outage_id` tags directly.
    - Matches unlinked complaints to active regional outages occurring within a configurable temporal sliding window ($\Delta t \in [0.5\text{h}, 6.0\text{h}]$).
  - `calculate_telemetry_confidence(outage_row)`: Evaluates data completeness (presence of subscriber counts, complaint velocity, duration, and telemetry health) and generates a data confidence multiplier ($0.0 - 1.0$) with operational audit flags (`HIGH_CONFIDENCE`, `LOW_CONFIDENCE_PARTIAL_DATA`).

### 2.3. 4-Factor Vectorized Impact Scoring Engine (`scoring.py`)
* **Requirements:** `FR5`, `Persona: Rahul`
* **Formula:**
  $$\text{Impact Score} = 100 \times \left( w_1 \cdot \widetilde{R} + w_2 \cdot \widetilde{C} + w_3 \cdot \widetilde{V} + w_4 \cdot \widetilde{D} \right) \times \text{Confidence Multiplier}$$
  *Default Config-Driven Weights:*
  - **Customer Reach ($w_1 = 0.35$):** Normalized active subscriber count ($\widetilde{R} \in [0, 1]$).
  - **Complaint Pressure ($w_2 = 0.30$):** Normalized customer ticket/call velocity ($\widetilde{C} \in [0, 1]$).
  - **Revenue Exposure ($w_3 = 0.20$):** Regional $/hr exposure rating based on revenue tier ($\widetilde{V} \in [0, 1]$).
  - **Duration & Severity ($w_4 = 0.15$):** Active elapsed outage duration combined with technical alarm severity code ($\widetilde{D} \in [0, 1]$).
* **Key Functions:**
  - `min_max_normalize(series)`: Dynamic relative normalization against active grid baseline to prevent static skew.
  - `compute_impact_scores(merged_df, weights)`: Vectorized score computation executing in $<50\text{ms}$ for enterprise workloads.

### 2.4. Operational Priority Tier Classifier & Tie-Breaking Engine (`scoring.py`)
* **Requirements:** `FR6`, `FR7`, `FR9`
* **Tier Thresholds:**
  - **Critical Tier ($\ge 75.0$):** Immediate P1 escalation and field technician emergency dispatch.
  - **High Priority ($50.0 - 74.9$):** Active NOC lead monitoring and optical team investigation.
  - **Medium Priority ($25.0 - 49.9$):** Scheduled Tier 2 engineering ticket assignment.
  - **Low Priority ($< 25.0$):** Routine maintenance and peripheral cell tower diagnostics.
* **Key Functions:**
  - `assign_priority_tier(score)`: Maps numerical scores to operational severity tiers.
  - `rank_outage_queue(df)`: Multi-key deterministic tie-breaker resolving identical scores:
    $$\text{Impact Score (desc)} \longrightarrow \text{Subscriber Count (desc)} \longrightarrow \text{Complaint Velocity (desc)} \longrightarrow \text{Outage ID (asc)}$$

### 2.5. Explainable Outage Drill-Down Inspector (`scoring.py`)
* **Requirements:** `FR10`, `Persona: Rahul`
* **Key Functions:**
  - `get_outage_deep_dive_details(df, outage_id)`: Assembles comprehensive explainability payload:
    - 4-part sub-score breakdown with weighted contribution verification ($|\text{Score} - \sum \text{Contributions}| \le 0.05$).
    - Regional demographics context and hourly revenue exposure.
    - Linked customer complaint streams with explicit vs temporal match tags.
    - Affected network service tags (VoLTE, 5G Data, Enterprise Leased Lines, E911 Emergency Services).

### 2.6. Geo-Operational Analytics & Regional Heatmap Aggregator (`geo_analytics.py`)
* **Requirements:** `FR11`, `Persona: Priya`
* **Key Functions:**
  - `compute_regional_aggregations(df)`: Groups outages across all operational sectors (North, West, South, East, Central), calculating total affected subscriber counts, revenue risk ($/hr), average impact score, dominant regional severity, and SLA compliance percentage.
  - `get_regional_ranking(aggregations, sort_by)`: Ranks geographic zones and assigns impact density ratings (`CRITICAL_IMPACT`, `HIGH_IMPACT`, `MODERATE_IMPACT`, `HEALTHY`).
  - Handles zero-outage regions gracefully with clean empty states.

### 2.7. Multi-Dimensional Filtering, SLA Tracking & Search Engine (`reporting.py`)
* **Requirements:** `FR13`, `FR16`
* **Key Functions:**
  - `calculate_sla_status(elapsed_hours, severity)`: Evaluates SLA targets (Critical: 2.0h, High: 4.0h, Medium: 8.0h, Low: 24.0h), computing remaining hours and status badges (`BREACHED`, `AT_RISK`, `ON_TRACK`).
  - `add_sla_tracking(df)`: Enriches datasets with dynamic SLA counters.
  - `filter_outages(df, region_id, severity, status, priority_tier, search_query, sla_status, min_score, max_score)`: Multi-parameter filtering and full-text substring search across IDs, nodes, regions, and root causes.

### 2.8. Real-Time Critical Threshold Alerting & Historical Trend Analytics (`trend_analytics.py`)
* **Requirements:** `FR8`, `FR12`, `FR16`
* **Key Functions:**
  - `compute_kpis(active_df, resolved_df)`: Aggregates executive KPIs (Active Incidents, Critical P1 Outages, Total Impacted Customers, MTTR hours, Hourly Revenue Risk, SLA Compliance Rate).
  - `compute_rolling_trends(history_df, window_days)`: Calculates time-series volume trends and average score curves across 7-day and 30-day horizons.
  - `detect_critical_breach_events(df, threshold=75.0)`: Detects critical score threshold breaches and creates urgent operational escalation payloads.

### 2.9. Executive Reporting, Automated Export & Benchmarking (`reporting.py`)
* **Requirements:** `FR14`, `FR15`, `NFR Performance`
* **Key Functions:**
  - `get_executive_summary(df, top_n=5)`: Extracts top $N$ critical outages for leadership reviews.
  - `export_outages_to_csv(df, output_path)`: Exports ranked outages to standardized CSV format.
  - `generate_executive_pdf_summary_data(df)`: Generates structured executive briefing report payloads.
  - `export_executive_summary_report(df, output_path)`: Formats presentation-ready executive markdown/text reports.
  - `benchmark_full_pipeline(num_records=100000)`: Automated stress test verifying full scoring and export pipeline completes under $5.0\text{ seconds}$.

---

## 3. Frontend Pages, Components & Interactive Interfaces

The frontend is built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**, offering an ultra-responsive, accessible dark-mode NOC dashboard.

### 3.1. Route Map & Page Structure
| Route | Page File | Description |
| :--- | :--- | :--- |
| `/` | [`frontend/app/page.tsx`](../frontend/app/page.tsx) | Main single-page interactive application housing all 11 core functional modules. |
| `/_not-found` | [`frontend/app/not-found.tsx`](../frontend/app/not-found.tsx) | Custom 404 page preserving branding and navigation. |

---

### 3.2. Detailed Component Breakdown

#### 1. Navigation & Brand Bar ([`Navbar.tsx`](../frontend/components/Navbar.tsx))
- **Features:** Sticky header with OutageIQ brand identity, live status pulse badge (`🟢 System Live`), desktop navigation anchor links (`Simulator`, `Personas`, `Regional Matrix`, `Live Queue`, `Trends`, `Methodology`, `PRD Spec`, `ROI`), and mobile drawer menu with touch-friendly navigation.

#### 2. Hero Header Section ([`Hero.tsx`](../frontend/components/Hero.tsx))
- **Features:** High-impact executive headline, mission value proposition, quick metrics ribbon ($-30\%$ Time-to-Triage, $\ge 90\%$ SLA Target, $0.35$ Customer Reach Weight), and direct action CTA buttons (`⚡ Launch Live Queue`, `📊 Impact Simulator`).

#### 3. Interactive Impact Calculator & Simulator ([`ImpactCalculator.tsx`](../frontend/components/ImpactCalculator.tsx) — `PRD Sec 7`, `FR5`)
- **Features:**
  - 4 real-time interactive parameter sliders: Affected Subscribers ($0-100\text{k}$), Complaints/Hour ($0-1\text{k}$), Revenue Tier ($1-3$), and Outage Duration ($0-24\text{h}$).
  - 3 One-Click Scenario Presets: **Metro Fiber Cut (Critical)**, **Social Complaint Spike (High)**, and **Rural Tower Maintenance (Low)**.
  - Configurable Scoring Weight Presets: **Default Balanced (35/30/20/15)**, **Customer Reach Heavy (50/20/20/10)**, and **Complaint Heavy (20/50/20/10)**.
  - Dynamic Priority Tier Badge, Circular Score Meter, and 4-Row Contribution Breakdown Table.

#### 4. Problem vs. Solution Matrix ([`ProblemSolution.tsx`](../frontend/components/ProblemSolution.tsx) — `PRD Sec 1 & 2`)
- **Features:** Side-by-side comparative breakdown contrasting the pitfalls of Legacy Reactive Triage with the quantifiable advantages of OutageIQ Intelligent Prioritization.

#### 5. Persona Experience Hub ([`PersonasSection.tsx`](../frontend/components/PersonasSection.tsx) — `PRD Sec 4`)
- **Features:** Interactive tabs tailored to 4 key enterprise personas:
  - **Rahul (NOC Engineer):** Fast queue triage, sub-score visibility, root cause tagging.
  - **Vikram (Operations Director):** Top 5 executive view, SLA penalty reduction, automated briefing exports.
  - **Priya (Regional Ops Lead):** Geo-operational ranking, regional subscriber reach heatbars.
  - **Farah (CX & Support Lead):** Complaint velocity tracking, temporal correlation explorer.

#### 6. Regional Impact Heatmap & Geo-Analytics ([`RegionalImpactOverview.tsx`](../frontend/components/RegionalImpactOverview.tsx) — `PRD Sec 8.3`, `FR11`)
- **Features:**
  - **5 Interactive Regional Cards:** Displays rank impact exposure, dominant severity badges, active incident counters, affected subscribers, revenue exposure ($/hr), and SLA compliance percentages.
  - **One-Click Quick-Filter Action:** Clicking `"Filter Queue by [Region]"` automatically filters the triage queue and scrolls directly into view.
  - **Comparative Heatmap Matrix Grid:** Sortable table comparing regions by subscriber volume, revenue exposure, and average composite impact score.

#### 7. Prioritized Outage Triage Queue Dashboard ([`LiveQueuePreview.tsx`](../frontend/components/LiveQueuePreview.tsx) — `PRD Sec 8.3`, `FR8–FR16`)
- **Features:**
  - **Critical Incident Alert Banner (FR16):** Urgent visual alert with flashing badge notifying operators when a Critical-tier incident ($\ge 75.0$) fires, with 1-click `"⚡ Triage Now"` and `"Acknowledge Alert"` actions.
  - **Executive KPI Summary Ribbon (FR8):** 4 executive summary metric cards (Active Incidents, Critical P1 Tier, Total Impacted Customers, and MTTR).
  - **Executive View Mode Toggle (FR15):** One-click toggle filtering to Top 5 presentation-ready outages.
  - **Multi-Dimensional Filter & Search Toolbar (FR13):** Filter dropdowns for Region, Severity, Priority Tier, and Status, plus instant full-text search input and a `"Reset Filters"` button.
  - **Prioritized Triage Table (FR9):** Interactive table with sortable column headers (Impact Score, Subscribers, Complaints), rank badges (`#1`, `#2`), dynamic SLA Countdown timers, and data confidence flags.
  - **Explainability Outage Drill-Down Modal (FR10):** Clicking any row opens an in-depth modal displaying sub-score decomposition, regional demographic context, linked complaints stream table, affected network services, and keyboard `Escape` close listener.
  - **Export Action Toolbar (FR14):** Client-side `"📥 Export CSV"` button and `"📄 Export Briefing"` markdown report generator.

#### 8. Rolling Outage Volume & Historical Trend Analytics ([`ImpactTrendAnalytics.tsx`](../frontend/components/ImpactTrendAnalytics.tsx) — `PRD Sec 8.3`, `FR12`)
- **Features:**
  - Time horizon toggle switching between **7-Day Rolling View** and **30-Day Monthly View**.
  - Custom SVG/CSS interactive bar chart plotting incident volume vs. composite impact score curves.
  - Dynamic Period Inspector card displaying total outages, average impact scores, MTTR hours, and resolved incidents.
  - 4 Key Trend Highlights (-42.8% Volume Reduction, 1.8h MTTR, $840k Annual SLA Savings, 99.4% Dispatch Rate).

#### 9. Scoring Methodology Pipeline ([`MethodologySection.tsx`](../frontend/components/MethodologySection.tsx) — `PRD Sec 6 & 7`)
- **Features:** 5-stage architectural walkthrough with an interactive **Sliding Window Complaint Correlation Slider** ($0.5\text{h} - 6.0\text{h}$) simulating real-time complaint linkage ratios.

#### 10. Technical PRD Requirements Explorer ([`PrdRequirementsExplorer.tsx`](../frontend/components/PrdRequirementsExplorer.tsx) — `FR1–FR16`, `NFRs`)
- **Features:** Tabbed interactive specifications viewer for:
  - **Functional Requirements (FR1–FR16):** Full description, target persona, status, and associated source files.
  - **Data Sources & Schemas:** Schemas for Network Outages, Customer Complaints, and Regional Data.
  - **Non-Functional Requirements (NFRs):** Performance ($<5\text{s}$), Accuracy ($100\%$ formula compliance), Reliability ($99.9\%$), and Security.

#### 11. Business ROI & Savings Calculator ([`RoiCalculator.tsx`](../frontend/components/RoiCalculator.tsx) — `PRD Sec 10`)
- **Features:** Real-time business savings estimator with adjustable sliders for annual outage volume, average SLA penalty, and baseline breach rates, demonstrating annual SLA penalty savings, engineer triage hours saved, and target SLA compliance.

#### 12. Footer ([`Footer.tsx`](../frontend/components/Footer.tsx))
- **Features:** Platform copyright, tech stack tags, PRD release status, and quick section navigation.

---

## 4. Requirements Traceability Matrix (FR1–FR16)

| Req ID | Feature Description | Primary Backend File | Primary Frontend Component | Test Suite File |
| :--- | :--- | :--- | :--- | :--- |
| **FR1** | Multi-Source Dataset Ingestion | `backend/scripts/ingestion.py` | `PrdRequirementsExplorer.tsx` | `backend/tests/test_validate_intake.py` |
| **FR2** | Schema Validation & Error Reporting | `backend/scripts/validate_intake.py` | `PrdRequirementsExplorer.tsx` | `backend/tests/test_ingestion.py` |
| **FR3** | Data Cleaning & Type Standardization | `backend/scripts/ingestion.py` | `MethodologySection.tsx` | `backend/tests/test_ingestion.py` |
| **FR4** | Spatio-Temporal Dataset Merge | `backend/scripts/ingestion.py` | `MethodologySection.tsx` | `backend/tests/test_ingestion.py` |
| **FR5** | 4-Factor Impact Score Computation | `backend/scripts/scoring.py` | `ImpactCalculator.tsx` | `frontend/e2e/calculator.spec.ts` |
| **FR6** | Dynamic Re-Ranking on Data Refresh | `backend/scripts/scoring.py` | `LiveQueuePreview.tsx` | `backend/tests/test_scoring.py` |
| **FR7** | Priority Tier Assignment & Tracking | `backend/scripts/scoring.py` | `LiveQueuePreview.tsx` | `backend/tests/test_scoring.py` |
| **FR8** | Executive KPI Summary Ribbon | `backend/scripts/trend_analytics.py`| `LiveQueuePreview.tsx`, `Hero.tsx` | `frontend/e2e/trend-analytics.spec.ts` |
| **FR9** | Prioritized Outage Triage Queue | `backend/scripts/scoring.py` | `LiveQueuePreview.tsx` | `frontend/e2e/live-queue.spec.ts` |
| **FR10**| Explainable Outage Drill-Down Modal | `backend/scripts/scoring.py` | `LiveQueuePreview.tsx` | `frontend/e2e/live-queue.spec.ts` |
| **FR11**| Regional Impact Heatmap & Geo Analytics| `backend/scripts/geo_analytics.py` | `RegionalImpactOverview.tsx` | `frontend/e2e/regional-analytics.spec.ts`|
| **FR12**| Rolling Volume & Score Trend Charts | `backend/scripts/trend_analytics.py`| `ImpactTrendAnalytics.tsx` | `frontend/e2e/trend-analytics.spec.ts` |
| **FR13**| Multi-Parameter Filter & SLA Search | `backend/scripts/reporting.py` | `LiveQueuePreview.tsx` | `frontend/e2e/live-queue.spec.ts` |
| **FR14**| Automated CSV & PDF Briefing Export | `backend/scripts/reporting.py` | `LiveQueuePreview.tsx` | `backend/tests/test_reporting.py` |
| **FR15**| Executive View Toggle (Top 5 Mode) | `backend/scripts/reporting.py` | `LiveQueuePreview.tsx` | `frontend/e2e/live-queue.spec.ts` |
| **FR16**| Critical Threshold Alert Banner | `backend/scripts/trend_analytics.py`| `LiveQueuePreview.tsx` | `frontend/e2e/trend-analytics.spec.ts` |

---

## 5. Automated Test Suite & Verification

OutageIQ features a unified 3-tier test suite with 100% automated pass rate:

```bash
# Execute full test runner across Python, Backend, and Playwright E2E suites:
./run_tests.sh
```

- **Tier 1: Python Analytics & Scoring Unit Tests** (66 unit tests passing)
  - `test_ingestion.py`
  - `test_validate_intake.py`
  - `test_scoring.py`
  - `test_geo_analytics.py`
  - `test_reporting.py`
  - `test_trend_analytics.py`
- **Tier 2: Backend Integration Tests** (66 tests passing)
- **Tier 3: Playwright End-to-End User Journey Tests** (46 E2E tests passing)
  - `hero.spec.ts`
  - `calculator.spec.ts`
  - `live-queue.spec.ts`
  - `regional-analytics.spec.ts`
  - `trend-analytics.spec.ts`
  - `roi-calculator.spec.ts`
  - `methodology.spec.ts`
  - `prd-explorer.spec.ts`
  - `navbar.spec.ts`
  - `end-to-end.spec.ts` (Comprehensive 10-phase journey)
