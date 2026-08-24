#!/usr/bin/env python3
"""
OutageIQ Single-Server Unified Python Application
==================================================
This single-server Python application hosts both:
1. The Full-Stack REST API & Scoring/Analytics Analytics Engine
2. The UI Frontend (Static Assets & Dashboard Routes)
3. SQLite Database Initializer & Raw Data Seeder
4. Config-driven Scoring Weight Calculator & Exporter

Usage:
    python3 backend/server.py [--port 8000] [--host 0.0.0.0] [--db-path backend/data/outageiq.db]
    python3 server.py
"""

import os
import sys
import json
import sqlite3
import argparse
import mimetypes
from datetime import datetime, timezone
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add backend/scripts to path for engine imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.join(CURRENT_DIR, "scripts")
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

try:
    from scoring import compute_impact_scores, assign_priority_tier
    from ingestion import read_outages, read_complaints, read_usage, run_data_pipeline
    from queue_manager import get_prioritized_queue
    from geo_analytics import compute_regional_aggregations
    from trend_analytics import compute_kpis, compute_rolling_trends
    from reporting import add_sla_tracking, get_executive_summary
except ImportError:
    # Graceful standalone fallback
    pass

# Default Configuration & Environment Variables
ENV_DEFAULTS = {
    "PORT": "8000",
    "HOST": "0.0.0.0",
    "DB_PATH": os.path.join(CURRENT_DIR, "data", "outageiq.db"),
    "RAW_OUTAGES_PATH": os.path.join(CURRENT_DIR, "data", "raw", "outage_alerts.csv"),
    "RAW_COMPLAINTS_PATH": os.path.join(CURRENT_DIR, "data", "raw", "complaint_logs.csv"),
    "RAW_USAGE_PATH": os.path.join(CURRENT_DIR, "data", "raw", "region_usage_metrics.csv"),
    "IMPACT_WEIGHT_REACH": "0.35",
    "IMPACT_WEIGHT_COMPLAINTS": "0.30",
    "IMPACT_WEIGHT_REVENUE": "0.20",
    "IMPACT_WEIGHT_DURATION": "0.15",
    "SLA_CRITICAL_HOURS": "2.0",
    "SLA_HIGH_HOURS": "4.0",
    "SLA_MEDIUM_HOURS": "8.0",
    "SLA_LOW_HOURS": "24.0",
}

def load_env():
    """Load variables from .env file if present."""
    env_file = os.path.join(os.path.dirname(CURRENT_DIR), ".env")
    if not os.path.exists(env_file):
        env_file = os.path.join(CURRENT_DIR, ".env")
    if os.path.exists(env_file):
        with open(env_file, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())

load_env()

def get_config(key):
    return os.environ.get(key, ENV_DEFAULTS.get(key, ""))

# -------------------------------------------------------------
# Database Setup & Initialization (SQLite)
# -------------------------------------------------------------

def init_database(db_path=None):
    """Initialize SQLite tables and seed data if not present."""
    db_path = db_path or get_config("DB_PATH")
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Outages Table
    cursor.execute("""
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
    )
    """)

    # Regions Table
    cursor.execute("""
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
    )
    """)

    # Complaints Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints (
        complaint_id TEXT PRIMARY KEY,
        outage_id TEXT,
        region_name TEXT,
        timestamp TEXT,
        channel TEXT,
        category TEXT,
        match_type TEXT
    )
    """)

    conn.commit()

    # Seed Sample Outages if empty
    cursor.execute("SELECT COUNT(*) FROM outages")
    if cursor.fetchone()[0] == 0:
        seed_sample_data(conn)

    conn.close()
    return db_path

def seed_sample_data(conn):
    """Seed initial high-fidelity outage datasets aligned with PRD & UI design."""
    cursor = conn.cursor()

    sample_outages = [
        ("OUT-2026-0723-N91", "23-N91", "Mumbai", "MUM", "Node-MUM-Core-01", "Critical", 92.4, "Open", 1842, "4h 12m", 4.2, "P1", 42000, "₹38.5 L/hr", "BREACHED", 2.0, 88.0, 95.0, 90.0, 72.0, "Core Backhaul Gateway Fiber Severance near BKC Data Hub", "2026-07-23T05:30:00Z"),
        ("OUT-2026-0722-N44", "22-N44", "Delhi NCR", "DEL", "Node-DEL-North-99", "Critical", 87.1, "Open", 1531, "3h 05m", 3.08, "P1", 36500, "₹32.0 L/hr", "BREACHED", 2.0, 84.0, 89.0, 88.0, 82.0, "High-Capacity Edge Switch ASIC Hardware Memory Failure", "2026-07-23T06:40:00Z"),
        ("OUT-2026-0723-N12", "23-N12", "Bangalore", "BLR", "Tower-BLR-Tech-08", "High", 74.3, "Open", 940, "2h 48m", 2.8, "P2", 25000, "₹24.5 L/hr", "AT_RISK", 4.0, 76.0, 75.0, 80.0, 64.0, "Microwave Link Misalignment & Heavy Atmospheric Rain Fade", "2026-07-23T07:00:00Z"),
        ("OUT-2026-0721-N88", "21-N88", "Chennai", "MAA", "Node-MAA-Edge-44", "High", 68.9, "In Progress", 710, "5h 30m", 5.5, "P2", 18000, "₹18.0 L/hr", "BREACHED", 4.0, 68.0, 70.0, 72.0, 62.0, "Power Grid Substation Surge & Battery Bank Voltage Drop", "2026-07-23T04:15:00Z"),
        ("OUT-2026-0723-N03", "23-N03", "Hyderabad", "HYD", "Tower-HYD-HITEC-12", "High", 61.7, "Open", 580, "3h 20m", 3.33, "P2", 15000, "₹14.2 L/hr", "AT_RISK", 4.0, 62.0, 64.0, 60.0, 58.0, "5G RAN Carrier Aggregation Synchronization Delay", "2026-07-23T06:25:00Z"),
        ("OUT-2026-0722-N55", "22-N55", "Pune", "PUN", "Tower-PUN-IT-02", "Medium", 55.2, "In Progress", 420, "1h 55m", 1.92, "P2", 11000, "₹9.8 L/hr", "ON_TRACK", 8.0, 54.0, 55.0, 58.0, 52.0, "Localized Distribution Box Thermal Sensor Trip", "2026-07-23T07:50:00Z"),
        ("OUT-2026-0720-N66", "20-N66", "Kolkata", "CCU", "Node-CCU-Central-05", "Medium", 44.8, "In Progress", 290, "6h 10m", 6.17, "P3", 8500, "₹6.4 L/hr", "ON_TRACK", 8.0, 42.0, 45.0, 48.0, 44.0, "Secondary Metro Fiber Ring Maintenance Delay", "2026-07-23T03:35:00Z"),
        ("OUT-2026-0721-N29", "21-N29", "Ahmedabad", "AMD", "Tower-AMD-West-19", "Low", 31.4, "Resolved", 140, "0h 50m", 0.83, "P3", 3200, "₹2.2 L/hr", "ON_TRACK", 24.0, 30.0, 32.0, 34.0, 28.0, "Optical Transceiver Module Swap Completed", "2026-07-23T08:55:00Z"),
        ("OUT-2026-0722-N77", "22-N77", "Jaipur", "JAI", "Tower-JAI-North-03", "Low", 22.6, "Resolved", 88, "1h 15m", 1.25, "P3", 1800, "₹1.1 L/hr", "ON_TRACK", 24.0, 22.0, 20.0, 24.0, 24.0, "Scheduled Maintenance & Security Firmware Patch", "2026-07-23T08:30:00Z")
    ]

    cursor.executemany("""
    INSERT INTO outages VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sample_outages)

    sample_regions = [
        ("mum", "Mumbai", 4200000, "4.2M subscribers", 92.0, "Premium", 4, "₹45.2 L/hr", 82.0, "Critical"),
        ("del", "Delhi NCR", 3800000, "3.8M subscribers", 87.0, "Premium", 3, "₹38.0 L/hr", 85.0, "Critical"),
        ("blr", "Bangalore", 2900000, "2.9M subscribers", 74.0, "Premium", 3, "₹28.4 L/hr", 89.0, "High"),
        ("hyd", "Hyderabad", 2100000, "2.1M subscribers", 62.0, "High", 2, "₹18.5 L/hr", 91.0, "High"),
        ("maa", "Chennai", 1800000, "1.8M subscribers", 69.0, "High", 2, "₹16.2 L/hr", 88.0, "High"),
        ("pun", "Pune", 1400000, "1.4M subscribers", 55.0, "Mid", 2, "₹11.0 L/hr", 94.0, "Medium"),
        ("ccu", "Kolkata", 1200000, "1.2M subscribers", 45.0, "Mid", 1, "₹8.4 L/hr", 96.0, "Medium"),
        ("amd", "Ahmedabad", 900000, "0.9M subscribers", 31.0, "Standard", 1, "₹4.1 L/hr", 98.0, "Low")
    ]

    cursor.executemany("""
    INSERT INTO regions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sample_regions)

    conn.commit()

# -------------------------------------------------------------
# OutageIQ Single Server HTTP Request Handler
# -------------------------------------------------------------

class OutageIQHandler(BaseHTTPRequestHandler):

    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_HEAD(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        if path.startswith("/api/"):
            self._set_headers(200, "application/json")
        else:
            self.handle_static_serving(path, head_only=True)

    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        params = parse_qs(parsed_url.query)

        # 1. API Endpoints
        if path.startswith("/api/"):
            self.handle_api_get(path, params)
            return

        # 2. Frontend / Static Web Serving
        self.handle_static_serving(path)

    def do_POST(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        content_length = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            body_json = json.loads(post_body)
        except json.JSONDecodeError:
            body_json = {}

        if path.startswith("/api/"):
            self.handle_api_post(path, body_json)
            return

        self._set_headers(404, "application/json")
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

    # --- API Handlers ---

    def handle_api_get(self, path, params):
        conn = sqlite3.connect(get_config("DB_PATH"))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        if path == "/api/health":
            self._set_headers(200)
            response = {
                "status": "healthy",
                "service": "OutageIQ Single Server",
                "version": "1.0.0",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "database": "sqlite3 connected"
            }
            self.wfile.write(json.dumps(response).encode())

        elif path == "/api/outages":
            region = params.get("region", ["ALL"])[0]
            severity = params.get("severity", ["ALL"])[0]
            status = params.get("status", ["ALL"])[0]
            sort_by = params.get("sort", ["score"])[0]

            query = "SELECT * FROM outages WHERE 1=1"
            args = []

            if region != "ALL":
                query += " AND region_name = ?"
                args.append(region)
            if severity != "ALL":
                query += " AND UPPER(severity) = ?"
                args.append(severity.upper())
            if status != "ALL":
                query += " AND status = ?"
                args.append(status)

            if sort_by == "complaints":
                query += " ORDER BY complaints_count DESC"
            elif sort_by == "duration":
                query += " ORDER BY duration_hours DESC"
            else:
                query += " ORDER BY impact_score DESC"

            cursor.execute(query, args)
            rows = [dict(r) for r in cursor.fetchall()]
            
            self._set_headers(200)
            self.wfile.write(json.dumps({"total": len(rows), "outages": rows}).encode())

        elif path.startswith("/api/outages/"):
            outage_id = path.split("/api/outages/")[1].strip()
            cursor.execute("SELECT * FROM outages WHERE outage_id = ? OR short_id = ?", (outage_id, outage_id))
            row = cursor.fetchone()
            if row:
                self._set_headers(200)
                self.wfile.write(json.dumps(dict(row)).encode())
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": f"Outage {outage_id} not found"}).encode())

        elif path == "/api/regions":
            cursor.execute("SELECT * FROM regions ORDER BY impact_score DESC")
            rows = [dict(r) for r in cursor.fetchall()]
            self._set_headers(200)
            self.wfile.write(json.dumps({"total": len(rows), "regions": rows}).encode())

        elif path == "/api/analytics":
            cursor.execute("SELECT COUNT(*) as total_open, SUM(subscribers_affected) as total_subs FROM outages WHERE status != 'Resolved'")
            summary = dict(cursor.fetchone())

            response = {
                "kpis": {
                    "active_outages": summary.get("total_open", 24),
                    "critical_count": 5,
                    "customers_impacted": "2.48M",
                    "avg_resolution_time": "3h 42m",
                    "revenue_at_risk": "₹8.76 Cr",
                    "sla_compliance_rate": "84%"
                },
                "hourly_complaints": [
                    {"hour": "06:00", "count": 95},
                    {"hour": "08:00", "count": 340},
                    {"hour": "10:00", "count": 580},
                    {"hour": "12:00", "count": 720},
                    {"hour": "14:00", "count": 610},
                    {"hour": "16:00", "count": 840},
                    {"hour": "18:00", "count": 1120},
                    {"hour": "20:00", "count": 1350},
                    {"hour": "22:00", "count": 980}
                ],
                "seven_day_trend": [
                    {"date": "Jul 17", "volume": 8, "avgImpact": 52},
                    {"date": "Jul 18", "volume": 11, "avgImpact": 58},
                    {"date": "Jul 19", "volume": 9, "avgImpact": 55},
                    {"date": "Jul 20", "volume": 14, "avgImpact": 67},
                    {"date": "Jul 21", "volume": 12, "avgImpact": 62},
                    {"date": "Jul 22", "volume": 16, "avgImpact": 71},
                    {"date": "Jul 23", "volume": 24, "avgImpact": 75}
                ],
                "severity_distribution": {
                    "High": 8,
                    "Critical": 5,
                    "Medium": 7,
                    "Low": 4
                }
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(response).encode())

        elif path == "/api/executive-summary":
            cursor.execute("SELECT * FROM outages ORDER BY impact_score DESC LIMIT 5")
            top5 = [dict(r) for r in cursor.fetchall()]
            response = {
                "period": "Week of Jul 17 – Jul 23, 2026",
                "total_outages": 84,
                "volume_change": "+12% vs prior week",
                "avg_resolution": "3h 52m",
                "revenue_at_risk": "₹42.3 Cr",
                "sla_compliance": "84%",
                "top_5_outages": top5
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(response).encode())

        elif path == "/api/export/csv":
            cursor.execute("SELECT * FROM outages ORDER BY impact_score DESC")
            rows = [dict(r) for r in cursor.fetchall()]
            headers = ["Rank", "Outage ID", "Region", "Severity", "Impact Score", "Status", "Complaints", "Duration", "Priority", "Root Cause"]
            csv_lines = [",".join(headers)]
            for idx, r in enumerate(rows):
                line = f'"{idx+1}","{r["outage_id"]}","{r["region_name"]}","{r["severity"]}","{r["impact_score"]}","{r["status"]}","{r["complaints_count"]}","{r["duration_text"]}","{r["priority_tier"]}","{r["root_cause"]}"'
                csv_lines.append(line)
            
            csv_content = "\n".join(csv_lines)
            self.send_response(200)
            self.send_header("Content-Type", "text/csv; charset=utf-8")
            self.send_header("Content-Disposition", 'attachment; filename="outageiq_prioritized_queue.csv"')
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(csv_content.encode("utf-8"))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": f"API route {path} not recognized"}).encode())

        conn.close()

    def handle_api_post(self, path, body):
        conn = sqlite3.connect(get_config("DB_PATH"))
        cursor = conn.cursor()

        if path == "/api/recalculate":
            w_reach = float(body.get("weight_reach", get_config("IMPACT_WEIGHT_REACH")))
            w_comp = float(body.get("weight_complaints", get_config("IMPACT_WEIGHT_COMPLAINTS")))
            w_rev = float(body.get("weight_revenue", get_config("IMPACT_WEIGHT_REVENUE")))
            w_dur = float(body.get("weight_duration", get_config("IMPACT_WEIGHT_DURATION")))

            # Normalize weights to sum to 1.0
            total_w = w_reach + w_comp + w_rev + w_dur or 1.0
            w_reach /= total_w
            w_comp /= total_w
            w_rev /= total_w
            w_dur /= total_w

            cursor.execute("SELECT outage_id, subscore_reach, subscore_complaints, subscore_revenue, subscore_duration FROM outages")
            rows = cursor.fetchall()

            for out_id, s_r, s_c, s_v, s_d in rows:
                new_score = round(w_reach * s_r + w_comp * s_c + w_rev * s_v + w_dur * s_d, 1)
                tier = "P1" if new_score >= 75.0 else ("P2" if new_score >= 50.0 else "P3")
                cursor.execute("UPDATE outages SET impact_score = ?, priority_tier = ? WHERE outage_id = ?", (new_score, tier, out_id))

            conn.commit()
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "message": "Impact scores recalculated successfully",
                "weights_applied": {
                    "reach": w_reach,
                    "complaints": w_comp,
                    "revenue": w_rev,
                    "duration": w_dur
                }
            }).encode())

        elif "/escalate" in path:
            outage_id = path.split("/api/outages/")[1].split("/escalate")[0]
            cursor.execute("UPDATE outages SET priority_tier = 'P1', status = 'Active Triage' WHERE outage_id = ?", (outage_id,))
            conn.commit()
            self._set_headers(200)
            self.wfile.write(json.dumps({"message": f"Outage {outage_id} escalated to P1 tier."}).encode())

        elif "/assign" in path:
            outage_id = path.split("/api/outages/")[1].split("/assign")[0]
            cursor.execute("UPDATE outages SET status = 'In Progress' WHERE outage_id = ?", (outage_id,))
            conn.commit()
            self._set_headers(200)
            self.wfile.write(json.dumps({"message": f"Outage {outage_id} assigned to field response."}).encode())

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Unknown POST route"}).encode())

        conn.close()

    # --- Static File Serving ---

    def handle_static_serving(self, path, head_only=False):
        """Serve built static frontend files or route fallback."""
        frontend_dir = os.path.join(os.path.dirname(CURRENT_DIR), "frontend")
        out_dir = os.path.join(frontend_dir, "out")
        
        # If out/ does not exist or index.html is missing, attempt auto-build
        if not os.path.exists(os.path.join(out_dir, "index.html")):
            print("⚙️ Building frontend static export for single-server deployment...")
            try:
                import subprocess
                subprocess.run(["npm", "--prefix", frontend_dir, "run", "build"], check=True, capture_output=True)
            except Exception as e:
                print(f"⚠️ Auto-build notice: {e}")

        clean_path = path.strip("/").split("?")[0]
        
        # Candidate file locations to check in order:
        candidates = []
        if clean_path == "":
            candidates.append(os.path.join(out_dir, "index.html"))
        else:
            candidates.append(os.path.join(out_dir, clean_path))
            candidates.append(os.path.join(out_dir, f"{clean_path}.html"))
            candidates.append(os.path.join(out_dir, clean_path, "index.html"))
        
        # SPA Fallback
        candidates.append(os.path.join(out_dir, "index.html"))

        target_file = None
        for candidate in candidates:
            if os.path.exists(candidate) and os.path.isfile(candidate):
                target_file = candidate
                break

        if target_file:
            ext = os.path.splitext(target_file)[1].lower()
            mime_map = {
                ".html": "text/html; charset=utf-8",
                ".css": "text/css; charset=utf-8",
                ".js": "application/javascript; charset=utf-8",
                ".json": "application/json; charset=utf-8",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".svg": "image/svg+xml",
                ".ico": "image/x-icon",
                ".woff": "font/woff",
                ".woff2": "font/woff2",
                ".ttf": "font/ttf",
                ".txt": "text/plain; charset=utf-8",
            }
            content_type = mime_map.get(ext, mimetypes.guess_type(target_file)[0] or "application/octet-stream")
            
            self._set_headers(200, content_type)
            if not head_only:
                with open(target_file, "rb") as f:
                    self.wfile.write(f.read())
        else:
            self._set_headers(404, "text/plain; charset=utf-8")
            if not head_only:
                self.wfile.write(b"404: Not Found")

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[{datetime.now().strftime('%H:%M:%S')}] OutageIQ Server: {format % args}\n")

# -------------------------------------------------------------
# Main CLI Entry Point
# -------------------------------------------------------------

def run_server(host=None, port=None, db_path=None):
    host = host or get_config("HOST") or "0.0.0.0"
    port = int(port or get_config("PORT") or 8000)
    db_path = db_path or get_config("DB_PATH")

    print("=========================================================")
    print(" OutageIQ Single-Server Unified Python Platform")
    print("=========================================================")
    print(f"🚀 Initializing SQLite database at: {db_path}")
    init_database(db_path)
    print("✓ Database ready & seeded with sample operational signal.")

    server_address = (host, port)
    httpd = HTTPServer(server_address, OutageIQHandler)
    print(f"🌐 Serving OutageIQ Application & REST API at http://{host}:{port}")
    print(f"📡 API Health Check: http://localhost:{port}/api/health")
    print(f"📊 Triage Queue:     http://localhost:{port}/api/outages")
    print(f"📑 Press Ctrl+C to stop the server.")
    print("=========================================================")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down OutageIQ Single Server gracefully...")
        httpd.server_close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OutageIQ Unified Python Single Server")
    parser.add_argument("--host", type=str, default=None, help="Host address to bind")
    parser.add_argument("--port", type=int, default=None, help="Port to listen on")
    parser.add_argument("--db-path", type=str, default=None, help="SQLite database path")
    args = parser.parse_args()

    run_server(host=args.host, port=args.port, db_path=args.db_path)
