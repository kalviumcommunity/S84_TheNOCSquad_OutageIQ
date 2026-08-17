# OutageIQ

OutageIQ is the NOC Squad's network outage impact prioritization workspace. It brings together outage alerts, customer complaints, and region usage metrics so the team can rank active incidents by business and customer impact instead of relying on severity codes alone.

The product direction comes from [`docs/PRD.md`](docs/PRD.md), which defines the v1 goal: ingest three data streams, clean and merge them, compute a transparent Impact Score, and surface a prioritized queue for engineers and leadership. The full implementation roadmap is documented in [`docs/PLANNER.md`](docs/PLANNER.md).

## What The Project Does

OutageIQ is designed to:

- unify outage, complaint, and usage data into one working dataset per outage event
- calculate an explainable 0 to 100 Impact Score using reach, complaint pressure, revenue exposure, and duration/severity
- rank open outages so the highest-impact issue is visible first
- support filtering by region, severity, status, date range, and priority tier
- produce exportable operational and executive summaries for the NOC squad

## Team Workflow

The intended team workflow follows the PRD and the test coverage:

1. Ingest source data from outage alerts, complaint logs, and region usage snapshots.
2. Validate schemas, clean records, and deduplicate the inputs.
3. Match unlinked complaints to the most relevant outage when an explicit outage ID is missing.
4. Merge the datasets into a single outage-level view.
5. Compute normalized sub-scores and the composite Impact Score.
6. Assign a priority tier and flag confidence when data is incomplete.
7. Filter and review the ranked outage queue in the reporting layer.
8. Export the top outages and executive summary for leadership.

This workflow is implemented and tested around the following behavior:

- ingestion validation, deduplication, complaint matching, and merging
- scoring normalization, weighted Impact Score calculation, priority tier assignment, and confidence flag handling
- reporting filters and executive summary selection

## Repository Layout

```
.
├── docs/                     # Specifications and engineering roadmaps
│   ├── PRD.md                # Product Requirements Document
│   └── PLANNER.md            # 10-Phase Implementation & Test Planner
├── frontend/                 # Next.js 16 Web Application & UI Tests
│   ├── app/                  # App Router pages and layout
│   ├── components/           # UI components (Queue, Simulator, ROI, etc.)
│   ├── e2e/                  # Playwright End-to-End Test Suite
│   └── package.json          # Frontend dependencies and scripts
├── backend/                  # Python Analytics Engine, Ingestion & Data
│   ├── data/                 # Raw and processed datasets
│   ├── output/               # Exported reports and artifacts
│   ├── scripts/              # Ingestion, scoring, and reporting modules
│   ├── tests/                # Unit and integration test suites
│   ├── requirements.txt      # Python dependencies
│   └── package.json          # Backend test scripts
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore configuration
├── package.json              # Root project scripts
├── requirements.txt          # Python dependencies
└── run_tests.sh              # Unified 3-tier test runner
```

## Setup

1. Clone the repository:
	```bash
	git clone https://github.com/kalviumcommunity/S84_TheNOCSquad_OutageIQ.git
	cd S84_TheNOCSquad_OutageIQ
	```
2. Set up Python environment:
	```bash
	python3 -m venv venv
	source venv/bin/activate  # macOS/Linux (or venv\Scripts\activate on Windows)
	pip install -r backend/requirements.txt
	```
3. Set up Frontend dependencies:
	```bash
	cd frontend
	npm install
	cd ..
	```
4. Configure environment:
	```bash
	cp .env.example .env
	```

## Run Tests

Execute the unified test suite across all layers:

```bash
./run_tests.sh
```

Or run individual layer suites:

```bash
# Run backend Python tests
python3 -m unittest discover -s backend/tests

# Run backend test runner
npm --prefix backend test

# Run frontend Next.js build & Playwright E2E tests
npm --prefix frontend test
```

## About The NOC Squad

The NOC Squad is the team behind OutageIQ. The project is focused on helping operations teams move from reactive outage triage to impact-based prioritization, so the busiest and most business-critical incidents rise to the top first.
