# OutageIQ — Multi-Page Architecture & Feature Specification

**Document Version:** 1.0.0 (Production Release)  
**Target Personas:** NOC Engineer (*Rahul*), Regional Ops Manager (*Priya*), CX Lead (*Farah*), Leadership / Director (*Vikram*)  
**PRD Reference:** [`docs/PRD.md`](./PRD.md) & [`docs/FEATURES.MD`](./FEATURES.MD)  
**UI Reference:** Figma Make Design System ([`images/`](../images/))

---

## 1. Executive Summary & Persona-to-Page Mapping

OutageIQ provides a dedicated multi-page dashboard suite designed to solve the telemetry silo problem in modern telecom Network Operations Centers (NOCs). Each route is purpose-built for specific operational personas identified in Section 4 of [`docs/PRD.md`](./PRD.md):

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               OutageIQ NOC Dashboard Suite                                       │
├───────────────────────┬───────────────────────┬──────────────────────────┬───────────────────────┤
│ Route                 │ Page Title            │ Target Persona           │ Core Mission          │
├───────────────────────┼───────────────────────┼──────────────────────────┼───────────────────────┤
│ `/` or `/overview`    │ Overview              │ Rahul (NOC Eng) & All    │ Real-time Prioritized │
│                       │                       │                          │ Triage & Alerting     │
│ `/queue`              │ Outage Queue          │ Rahul (NOC Engineer)     │ Ranked Action Queue & │
│ (`/outage-queue`)     │                       │                          │ Sub-Score Deep-Dive   │
│ `/regions`            │ Region View           │ Priya (Regional Ops)     │ Geo-Impact Ranking &  │
│ (`/region-view`)      │                       │                          │ Regional SLA Health   │
│ `/analytics`          │ Analytics             │ Farah (CX Lead) &        │ Complaint Velocity &  │
│                       │                       │ Vikram (Director)        │ Exec Summary Trends   │
│ `/export`             │ Exportable Data       │ Vikram (Director) &      │ Presentation-Ready    │
│ (`/exportable-data`)  │                       │ Ops Auditors             │ CSV & PDF Reports     │
└───────────────────────┴───────────────────────┴──────────────────────────┴───────────────────────┘
```

---

## 2. Shared Global Navigation & Layout Architecture

All pages share a consistent dark-theme sidebar on the left and a unified top header bar aligned with the Figma Make design system.

### 2.1. Left Navigation Sidebar
- **Brand Identity:** Deep purple icon badge `OQ` with white bold lettering, `OutageIQ` title, and `NOC Dashboard` subtitle.
- **MAIN Navigation Menu:**
  - `Overview` (`/` or `/overview`) — LayoutGrid icon
  - `Outage Queue` (`/queue` or `/outage-queue`) — Zap lightning bolt icon
  - `Region View` (`/regions` or `/region-view`) — Globe icon
  - `Analytics` (`/analytics`) — TrendingUp icon
  - `Exportable Data` (`/export` or `/exportable-data`) — Download arrow icon
  - *Active State:* Solid vibrant purple pill background (`bg-purple-600`) with white text and smooth rounded corners.
- **FILTERS Section:**
  - **Priority Count Badges:**
    - `P1 — Critical` (Rose dot) — 2 active incidents
    - `P2 — High` (Amber dot) — 4 active incidents
    - `P3 — Medium` (Yellow dot) — 3 active incidents
  - **Status Checkboxes:** `[x] Open`, `[x] In Progress`, `[ ] Resolved`
  - **Region Dropdown:** Quick-switch between `All Regions`, `Mumbai`, `Delhi NCR`, `Bangalore`, `Chennai`, `Hyderabad`, `Pune`, `Kolkata`, `Ahmedabad`, `Jaipur`.
- **Sidebar Footer:** Real-time telemetry freshness indicator (`Last refresh: 2 min ago`) and version tag (`v1.0 - NOC Squad`).

### 2.2. Global Header Bar
- **Page Title & Subtitle:** Dynamically reflects current route purpose.
- **Date Range Badge:** `Jul 23, 2026 | Last 24h` with calendar icon.
- **Refresh Action Button:** Purple `Refresh` button triggering live score re-ranking animation.
- **Persona View Switcher:** Dropdown displaying active operator initials (`RK` Rahul K., `PS` Priya S., `FC` Farah C., `VD` Vikram D.) with contextual role descriptions.

---

## 3. Detailed Page Breakdown & Features

---

### Page 1: Overview Dashboard

* **Primary Route:** `/` (Home)  
* **Direct Alias Route:** `/overview`  
* **Target Persona:** **Rahul (NOC Engineer)**, **Priya (Regional Ops)**, and **All Stakeholders**  
* **Figma Screenshot Reference:** `images/Screenshot 2026-08-24 094219.png` / `Screenshot from 2026-08-24 09-41-08.png`  
* **PRD Requirements Met:** `FR8`, `FR9`, `FR10`, `FR12`, `FR16`, `G1`, `G2`, `G3`

#### Persona Purpose & Problem Solved
> **"NOC Engineer ('Rahul') wants to instantly see what is on fire across the entire network and which outages require immediate P1 intervention."**  
> Prior to OutageIQ, engineers triaged outages using static alarm codes, risking critical enterprise fiber breaks sitting unresolved behind minor residential alarms. The Overview page unifies real-time alerts, complaints, and usage metrics into a single mission-control dashboard.

#### Features & Components
1. **Critical Incident Emergency Banner (`FR16`):**
   - High-visibility red alert banner notifying operators: *"🚨 2 new outages crossed into Critical tier in the last 30 minutes — Mumbai & Delhi NCR require immediate attention."*
   - Direct 1-click navigation link: `View Outages →`.
2. **Top 5 Operational KPI Cards (`FR8`):**
   - `ACTIVE OUTAGES`: **24** (`↑ 6 from yesterday`)
   - `CRITICAL`: **5** (Requires P1 action)
   - `CUSTOMERS IMPACTED`: **2.48M** (Across 8 regions)
   - `AVG RESOLUTION TIME`: **3h 42m** (SLA target: 4h)
   - `REVENUE AT RISK`: **₹8.76 Cr** (Estimated hourly exposure)
3. **Prioritized Outage Queue Table (`FR9`):**
   - Ranked list of top active incidents sorted by 4-factor composite Impact Score.
   - Columns: `Outage ID`, `Region`, `Severity`, `Impact Progress Bar & Score`, `Status`, `Complaints`, `Priority Tier Pill`.
   - 1-Click row selection dynamically updates the right-hand inspection card.
   - Link to full queue: `View all →`.
4. **Interactive Impact Score Gauge & Sub-Score Inspector (`FR10`):**
   - Circular SVG gauge visualizing relative impact (e.g. `92.4 / 100`).
   - 4-Part Transparent Sub-Score Progress Bars:
     - **Customer Reach (35%):** `88/100` (subscribers affected in region)
     - **Complaint Pressure (30%):** `95/100` (ticket & call velocity)
     - **Revenue Exposure (20%):** `90/100` (hourly enterprise revenue risk)
     - **Duration & Severity (15%):** `72/100` (elapsed outage time & technical code)
   - Explainability footer: *"Weight breakdown: Reach 35% · Complaints 30% · Revenue 20% · Duration 15%"*.
5. **Quick Stats Panel:**
   - `SLA Compliance`: **84%**
   - `Avg Impact Score`: **61.3**
   - `P1 Outages Open`: **2**
   - `Complaints / Hour`: **342**
6. **7-Day Outage Volume & Avg Impact Trend Chart (`FR12`):**
   - Dual-series line chart plotting daily active incident count against mean composite impact score.
7. **Today's Complaint Velocity Hourly Bar Chart (`FR12`):**
   - Hourly complaint distribution bar chart (06:00 to 22:00) tracking complaint surges.

---

### Page 2: Outage Queue

* **Primary Route:** `/queue`  
* **Direct Alias Route:** `/outage-queue`  
* **Target Persona:** **NOC Engineer ("Rahul")**  
* **Figma Screenshot Reference:** `images/Screenshot 2026-08-24 094236.png`  
* **PRD Requirements Met:** `FR5`, `FR6`, `FR7`, `FR9`, `FR10`, `FR13`, `G3`, `G4`

#### Persona Purpose & Problem Solved
> **"NOC Engineer ('Rahul') wants a ranked list of active outages, filterable by region/severity, so he knows what to fix next."**  
> Rahul needs an actionable operational queue where every open incident has a deterministic rank, explainable sub-score breakdown, duration timer, and direct 1-click dispatch/escalation controls.

#### Features & Components
1. **Full Prioritized Outage Triage Queue (`FR9`):**
   - Complete inventory of all active and resolving network incidents.
   - Deterministic sorting by composite score with secondary tie-breakers (Subscribers $\to$ Complaint Velocity $\to$ ID).
   - Columns: `Rank (#1, #2...)`, `Outage ID`, `Region`, `Severity`, `Impact Score`, `Status`, `Complaints`, `Duration (e.g. 4h 12m)`, `Priority (P1, P2, P3)`.
2. **Multi-Parameter Search & Filter Bar (`FR13`):**
   - Full-text search by Outage ID, Node name, or Root Cause.
   - Severity dropdown filter: `All Severities`, `Critical`, `High`, `Medium`, `Low`.
   - Sort criteria dropdown: `Sort: Impact Score`, `Sort: Complaints`, `Sort: Duration`.
3. **Interactive Outage Detail & Triage Inspector (`FR10`):**
   - Selecting any row opens the complete detail panel on the right.
   - Displays Outage ID, affected Region, technical Severity, Status, Duration, and total linked customer complaints.
   - 4-Part sub-score horizontal progress bars displaying exact component contributions.
   - Highlighted Composite Score box: `92.4` (*Out of 100 · Relative to active outages*).
4. **Operational Action Dispatch Controls:**
   - **`Escalate` (Solid Purple CTA):** Instantly triggers P1 emergency field technician dispatch and generates notification toast.
   - **`Assign` (Outline CTA):** Assigns ticket to Tier 3 Optical / RAN engineering lead.

---

### Page 3: Region View

* **Primary Route:** `/regions`  
* **Direct Alias Route:** `/region-view`  
* **Target Persona:** **Regional Operations Manager ("Priya")**  
* **Figma Screenshot Reference:** `images/Screenshot 2026-08-24 094254.png`  
* **PRD Requirements Met:** `FR11`, `FR13`, `G1`, `G5`

#### Persona Purpose & Problem Solved
> **"Regional Ops Manager ('Priya') wants to see impact concentrated in her region, complaint spikes, subscriber reach, and resolution SLAs."**  
> Priya is responsible for regional uptime and SLA compliance. She needs geographic density rankings to defend customer experience in high-revenue telecom circles (e.g. Mumbai, Delhi NCR, Bangalore).

#### Features & Components
1. **Region Impact Ranking List (`FR11`):**
   - Geographic zones ranked from highest to lowest composite impact.
   - Displays Rank (`#1` to `#8`), Region Name, Active Subscriber Base (`4.2M subscribers`), Progress Bar, Composite Score (`92`), and Demographic Revenue Tier Badges:
     - `Mumbai` (4.2M subs, Score: 92, [Premium])
     - `Delhi NCR` (3.8M subs, Score: 87, [Premium])
     - `Bangalore` (2.9M subs, Score: 74, [Premium])
     - `Hyderabad` (2.1M subs, Score: 62, [High])
     - `Chennai` (1.8M subs, Score: 69, [High])
     - `Pune` (1.4M subs, Score: 55, [Mid])
     - `Kolkata` (1.2M subs, Score: 45, [Mid])
     - `Ahmedabad` (0.9M subs, Score: 31, [Standard])
2. **Comparative Impact Score by Region Horizontal Bar Chart (`FR11`):**
   - Horizontal comparative bar chart mapping all active regions across a normalized 0–100 scale with severity color gradients.
3. **Regional Summary Cards:**
   - Top 4 highlighted region cards (Mumbai, Delhi NCR, Bangalore, Hyderabad) showing:
     - Large Impact Score
     - Total Subscriber Count
     - Revenue Tier Badge
     - Active Incident Counter
     - Quick `"Filter Queue"` link jumping directly to regional outages in the Outage Queue.

---

### Page 4: Analytics

* **Primary Route:** `/analytics`  
* **Target Personas:** **Customer Experience Lead ("Farah")** & **Leadership / Director ("Vikram")**  
* **Figma Screenshot Reference:** `images/Screenshot 2026-08-24 094319.png`  
* **PRD Requirements Met:** `FR8`, `FR12`, `FR14`, `FR15`, `G2`, `G5`

#### Persona Purpose & Problem Solved
> **"Customer Experience Lead ('Farah') wants to correlate complaint volume with outages to justify customer credits/comms, while Leadership / Director ('Vikram') wants a weekly exec view: top 5 outages by impact, trend over time, and revenue at risk."**  
> Farah needs hourly complaint velocity analytics to detect customer sentiment spikes, while Vikram requires executive-level summaries for board and stakeholder reporting.

#### Features & Components
1. **2x2 Analytics Multi-Chart Grid (`FR12`):**
   - **7-Day Outage Volume Trend:** Purple time-series curve tracking daily active incident volumes (Jul 17 to Jul 23).
   - **Avg Impact Score Trend:** Orange time-series curve with interactive date tooltips (e.g. *Jul 20: Avg Impact Score: 67*).
   - **Complaint Velocity — Today:** Hourly bar chart (06:00 to 22:00) tracking complaint arrival rates across all customer support channels.
   - **Severity Distribution Donut Chart:** Breakdown of active grid incidents by technical severity (`High: 8`, `Critical: 5`, `Medium: 7`, `Low: 4`).
2. **Executive Summary Briefing Panel (`FR15`):**
   - Full-width deep purple card summarizing the active operational week (Week of Jul 17 – Jul 23, 2026).
   - **4 Executive KPIs:**
     - `Total Outages`: **84** (`↑ 12% vs prior week`)
     - `Avg Resolution`: **3h 52m** (`Within 4h SLA`)
     - `Revenue at Risk`: **₹42.3 Cr** (`Week total exposure`)
     - `SLA Compliance`: **84%** (`Target: 90%`)
   - **Top 5 Highest-Impact Outages Table:**
     - `#1 OUT-2026-0723-N91` | Mumbai | Score: **92.4**
     - `#2 OUT-2026-0722-N44` | Delhi NCR | Score: **87.1**
     - `#3 OUT-2026-0723-N12` | Bangalore | Score: **74.3**
     - `#4 OUT-2026-0721-N88` | Chennai | Score: **68.9**
     - `#5 OUT-2026-0722-N55` | Pune | Score: **55.2**
   - **`Export PDF` Action Button:** Generates an executive briefing document formatted for executive review.

---

### Page 5: Exportable Data

* **Primary Route:** `/export`  
* **Direct Alias Route:** `/exportable-data`  
* **Target Persona:** **Leadership / Director ("Vikram")** & **Auditors / Operations Leads**  
* **Figma Screenshot Reference:** `images/Screenshot 2026-08-24 094332.png`  
* **PRD Requirements Met:** `FR14`, `FR15`, `G5`

#### Persona Purpose & Problem Solved
> **"Leadership / Director ('Vikram') and Operations Leads want to export prioritized lists, executive briefings, and regional data in standardized CSV and PDF formats for compliance and external reporting."**

#### Features & Components
1. **3 Quick-Export Report Cards (`FR14`):**
   - **Prioritized Outage List:** Full ranked list with sub-scores and root causes $\to$ `[CSV]` download button.
   - **Executive Summary Report:** Top 5 incidents + KPI summary $\to$ `[PDF]` download button.
   - **Region Impact Report:** Geographic breakdown with subscriber counts and revenue tiers $\to$ `[CSV]` download button.
2. **Data Preview Table:**
   - Real-time tabular preview of the prioritized queue with complete telemetry fields.
3. **Download Action Toolbar:**
   - `Export CSV` (Solid Purple CTA) — Downloads `OutageIQ_Prioritized_Queue_YYYY-MM-DD.csv`.
   - `Export PDF Summary` (Outline CTA) — Generates formatted executive briefing document.

---

## 4. Requirements & Goal Traceability Matrix

| Requirement | Description | Primary Route | Target Persona | Figma Screenshot |
| :--- | :--- | :--- | :--- | :--- |
| **G1 / FR1-4** | Multi-Source Ingestion & Fusion | `/` (Overview) | All | `094219.png` |
| **G2 / FR5** | 4-Factor Impact Scoring (0-100) | `/queue`, `/` | Rahul, Priya | `094219.png`, `094236.png` |
| **G3 / FR9** | Prioritized Triage Queue | `/queue` | Rahul | `094236.png` |
| **G4 / FR10** | Explainable Sub-Score Drilldown | `/queue`, `/` | Rahul, Farah | `094236.png` |
| **G5 / FR11** | Regional Impact Density Ranking | `/regions` | Priya | `094254.png` |
| **FR12** | Rolling Volume & Score Trends | `/analytics`, `/` | Farah, Vikram | `094319.png` |
| **FR13** | Multi-Parameter Filter & SLA | `/queue`, `/regions` | Rahul, Priya | `094236.png` |
| **FR14** | Automated CSV & PDF Export | `/export`, `/analytics`| Vikram, Leads | `094332.png` |
| **FR15** | Executive View Briefing (Top 5) | `/analytics`, `/export`| Vikram | `094319.png` |
| **FR16** | Critical Threshold Alert Banner | `/`, `/queue` | Rahul, Leads | `094219.png` |
