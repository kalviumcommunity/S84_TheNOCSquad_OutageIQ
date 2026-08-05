# OutageIQ

OutageIQ is the NOC Squad's network outage impact prioritization workspace. It brings together outage alerts, customer complaints, and region usage metrics so the team can rank active incidents by business and customer impact instead of relying on severity codes alone.

The product direction comes from [PRD.md](PRD.md), which defines the v1 goal: ingest three data streams, clean and merge them, compute a transparent Impact Score, and surface a prioritized queue for engineers and leadership.

## What The Project Does

OutageIQ is designed to:

- unify outage, complaint, and usage data into one working dataset per outage event
- calculate an explainable 0 to 100 Impact Score using reach, complaint pressure, revenue exposure, and duration/severity
- rank open outages so the highest-impact issue is visible first
- support filtering by region, severity, status, date range, and priority tier
- produce exportable operational and executive summaries for the NOC squad

## Team Workflow

The intended team workflow follows the PRD and the current test coverage:

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

- `PRD.md` is the product definition and source of truth for scope, scoring, and workflow.
- `README.md` is the project overview and contributor entry point.
- `requirements.txt` lists the Python dependencies used by the analytics workflow.
- `analytics-workspace-setup/data/raw/` holds raw outage, complaint, and usage files.
- `analytics-workspace-setup/data/processed/` holds cleaned and merged datasets ready for analysis.
- `analytics-workspace-setup/notebooks/` holds exploratory analysis and dashboard prototypes.
- `analytics-workspace-setup/scripts/` holds the reusable ingestion, scoring, and reporting modules.
- `analytics-workspace-setup/output/` holds exported reports and derived artifacts.
- `tests/` contains the behavior checks that document the expected workflow.

## Setup

1. Clone the repository.
	```bash
	git clone https://github.com/kalviumcommunity/S84_TheNOCSquad_OutageIQ.git
	cd S84_TheNOCSquad_OutageIQ
	```
2. Create a virtual environment.
	```bash
	python -m venv venv
	```
3. Activate the virtual environment.
	```bash
	# Windows
	venv\Scripts\activate

	# macOS/Linux
	source venv/bin/activate
	```
4. Install the project dependencies.
	```bash
	pip install -r requirements.txt
	```
5. Confirm the environment is working.
	```bash
	python -c "import pandas; print(pandas.__version__)"
	```

## Run Tests

The test suite documents the expected behavior of the pipeline.

```bash
python -m unittest discover -s tests
```

## Notes

Copy `.env.example` to `.env` before running local analysis, then fill in your own data paths and scoring values. The project expects environment variables for source data locations, processed output locations, and configurable Impact Score weights; no real secrets should be committed.

If you are extending the project, keep the PRD and tests aligned with the data pipeline so changes to ingestion, scoring, or reporting stay traceable.

## About The NOC Squad

The NOC Squad is the team behind OutageIQ. The project is focused on helping operations teams move from reactive outage triage to impact-based prioritization, so the busiest and most business-critical incidents rise to the top first.

In practice, that means giving the squad one place to review outage signals, complaint pressure, and regional usage data, then turning those inputs into an explainable priority queue and leadership-ready reporting.

The long-term goal is to make outage response faster, clearer, and easier to defend with data.
