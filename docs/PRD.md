Product Requirements Document
OutageIQ — Network Outage Impact Prioritization Dashboard
Team: The NOC Squad Owner: Bhawana Kumari Karan Devgan Date: 27 July 2026

1. Problem Statement
A telecom provider receives three separate streams of operational signal every day:
Network outage alerts (from monitoring/NOC systems)
Customer complaint logs (from call centers, app, web, social)
Region-level usage metrics (subscriber counts, data/voice traffic, revenue tier by region)
These streams live in silos. There is no workflow that fuses them to tell the operations team which of the outages happening right now matters most. Engineers currently triage outages using severity codes or gut feel — not the actual business and customer impact. This causes:
High-impact outages (large subscriber base, high complaint velocity, premium regions) sometimes sitting behind low-impact ones in the queue.
SLA breaches and preventable churn in high-value regions.
No single view for leadership to understand "what's on fire and why it matters."
2. Product Vision
OutageIQ is a data product that ingests outage alerts, complaint logs, and usage metrics, computes a unified Impact Score per outage, and surfaces a prioritized, explainable, real-time queue so NOC teams and leadership always know what to act on first.
3. Goals & Objectives
Goal
Description
G1 — Unify signal
Merge outage, complaint, and usage data into one dataset per outage event
G2 — Quantify impact
Produce a defensible, transparent Impact Score (not just severity)
G3 — Prioritize action
Rank open outages so the highest-impact issue is always visible first
G4 — Reduce time-to-triage
Cut the time between an outage firing and the right team acting on it
G5 — Enable reporting
Give leadership an exec-level view of impact trends by region/time

4. Target Users & Personas
Persona
Needs
NOC Engineer ("Rahul")
Wants a ranked list of active outages, filterable by region/severity, so he knows what to fix next
Regional Ops Manager ("Priya")
Wants to see impact concentrated in her region, complaint spikes, and resolution SLAs
Customer Experience Lead ("Farah")
Wants to correlate complaint volume with outages to justify customer credits/comms
Leadership / Director ("Vikram")
Wants a weekly exec view: top 5 outages by impact, trend over time, revenue at risk

5. Scope
In Scope (v1)
Ingest 3 datasets: outage alerts, complaint logs, region usage metrics (CSV/JSON)
Data cleaning, validation, and merge pipeline
Impact Score calculation engine
Streamlit dashboard: KPI summary, prioritized outage table, region view, trend charts, outage detail drill-down
Filters: region, severity, status, date range
Exportable report (CSV/PDF) of top outages
Out of Scope (v1)
Real-time streaming ingestion (v1 is batch/near-real-time refresh)
Automated ticket creation / integration with ITSM tools (e.g., ServiceNow)
SMS/email auto-alerting to field engineers (planned v2 — see 2.57 Insight Sharing & Email Report Integration)
Predictive outage forecasting (candidate for v2)
6. Data Sources
Source
Key Fields (expected)
Grain
Network Outage Alerts
outage_id, region_id, tower/node_id, start_time, end_time, severity, status, affected_services, root_cause_code
1 row per outage event
Customer Complaint Logs
complaint_id, customer_id, region_id, timestamp, channel, category, linked_outage_id (if tagged), sentiment/priority
1 row per complaint
Region Usage Metrics
region_id, region_name, subscriber_count, avg_daily_traffic, revenue_tier, plan_mix, prior_month_ARPU
1 row per region (periodic snapshot)

Join key: region_id (all three), and outage_id where complaints are explicitly linked; complaints without a linked outage are matched to the nearest active outage in the same region within a time window during preprocessing.
7. Impact Scoring Methodology
A composite, weighted Impact Score (0–100) per outage, computed from four normalized sub-scores:
Component
Weight
Signal
Customer Reach
35%
subscribers affected in region ÷ total subscriber base
Complaint Pressure
30%
complaint count + complaint velocity (complaints/hour) during outage window
Revenue Exposure
20%
region revenue tier × estimated outage duration
Duration & Severity
15%
outage severity code × time since outage start (open, unresolved outages escalate)


Impact Score = 0.35·Reach_norm + 0.30·Complaints_norm + 0.20·Revenue_norm + 0.15·Duration_norm
All sub-scores are min-max normalized (0–1) across currently active outages before weighting, so the score is always relative and explainable. Each outage's detail view shows the four sub-scores so the ranking is never a "black box."

8. Functional Requirements
8.1 Data Ingestion & Preparation
FR1: Upload/point to CSV or JSON for the three source datasets
FR2: Validate schema, flag missing/malformed fields, show data quality summary
FR3: Standardize types (timestamps, IDs, categorical severity/status), deduplicate records
FR4: Merge datasets on region_id / outage_id with a documented join/validation step
8.2 Impact Scoring Engine
FR5: Compute the four sub-scores and composite Impact Score per active outage
FR6: Recompute scores on each data refresh (outages re-rank as new complaints/usage data arrive)
FR7: Assign priority tier and store score history for trend tracking
8.3 Dashboard & Visualization
FR8: KPI summary bar — active outages, critical count, customers impacted, avg resolution time
FR9: Prioritized outage queue (sortable/filterable table) ranked by Impact Score
FR10: Outage detail panel — sub-score breakdown, affected region map/stat, linked complaints, timeline
FR11: Region view — impact heatmap/ranking by region
FR12: Trend charts — outage volume & impact score over time (rolling window)
FR13: Filters — region, severity, status (open/resolved), date range, priority tier
8.4 Reporting & Export
FR14: Export current prioritized list (CSV) and a summary report (PDF) of top N outages
FR15: "Executive view" toggle — condensed KPI + top 5 outages, presentation-ready
8.5 Alerts (v1 lightweight)
FR16: In-app threshold banner when a new outage crosses into "Critical" tier
9. Non-Functional Requirements
Category
Requirement
Performance
Dashboard refresh/recompute in under ~5 seconds for datasets up to ~100k rows
Usability
No SQL/code knowledge required to use the dashboard
Transparency
Every score must be explainable via visible sub-score breakdown
Data Quality
Ingestion pipeline must surface (not silently drop) invalid/missing records
Reliability
Dashboard must gracefully handle missing complaint or usage data for a region (partial score with a "confidence" flag)
Extensibility
Scoring weights should be config-driven, not hardcoded, for future tuning

10. Success Metrics (Product KPIs)
Metric
Target
Time-to-triage (outage open → first action)
↓ 30% vs. baseline
% of critical-impact outages resolved within SLA
≥ 90%
NOC adoption (weekly active users among ops staff)
≥ 80% of NOC team
Leadership report usage
Weekly exec view opened every week

11. User Stories (sample)
As a NOC engineer, I want to see outages ranked by Impact Score so I can act on the highest-impact issue first.
As a Regional Ops Manager, I want to filter by my region so I only see what's relevant to me.
As a CX Lead, I want to see complaint volume tied to each outage so I can plan proactive comms.
As a Director, I want a weekly exec summary of the top 5 highest-impact outages and trend so I can report upward.
As any user, I want to click into an outage and see exactly why it scored the way it did.
12. Tech Stack (mapped to build plan)
Layer
Tooling
Data handling & cleaning
Python, Pandas, NumPy
Storage / querying
SQL (aggregation, joins, window functions for ranking)
Scoring & analysis
Pandas GroupBy, NumPy vectorized computation
Visualization
Plotly (trend charts, KPI cards)
App / delivery
Streamlit (multi-page app, filters, session state)
Reporting
Automated export (CSV/PDF)

13. Assumptions & Risks
Assumptions
Outage, complaint, and usage datasets share a consistent region_id.
Complaint logs contain enough timestamp/region info to associate with an outage even without an explicit outage_id.
Scoring weights (35/30/20/15) are a v1 baseline, tunable with stakeholder input.
Risks
Complaint-to-outage matching may be noisy where explicit linkage is missing → mitigate with a time+region matching window and a "confidence" indicator on score.
Static/periodic usage snapshots may lag real subscriber counts → flag data freshness in UI.
Scoring model could be perceived as opaque → mitigated by always showing sub-score breakdown (FR10).
14. Open Questions
Should resolved/historical outages remain visible (for trend analysis) or only active ones?
Is there an existing severity taxonomy from the NOC system we should map into scoring, or do we define our own?
Who owns changing the scoring weights post-launch — product, ops leadership, or data team?


