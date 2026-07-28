# OutageIQ

OutageIQ is a network outage impact prioritization workspace for the NOC Squad. It combines outage alerts, customer complaints, and region usage metrics so the team can rank active incidents by business and customer impact instead of severity alone.

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
	# macOS/Linux
	source venv/bin/activate

	# Windows
	venv\Scripts\activate
	```
4. Install the project dependencies.
	```bash
	pip install -r requirements.txt
	```
5. Confirm the environment is working.
	```bash
	python -c "import pandas; print(pandas.__version__)"
	```

## Project Structure

- `analytics-workspace-setup/data/raw/` holds the original outage, complaint, and usage source files.
- `analytics-workspace-setup/data/processed/` holds cleaned, validated, and merged datasets ready for analysis.
- `analytics-workspace-setup/notebooks/` holds exploratory notebooks and dashboard prototypes.
- `analytics-workspace-setup/scripts/` holds reusable Python code for ingestion, cleaning, scoring, and exports.
- `analytics-workspace-setup/output/` holds generated reports, charts, and other derived deliverables.

## Notes

Copy `.env.example` to `.env` before running any local analysis, then fill in your own paths and scoring values. The project currently expects environment variables for source data locations, processed output locations, and configurable Impact Score weights; no real secrets should be committed.