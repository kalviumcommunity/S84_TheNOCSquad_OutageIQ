#!/usr/bin/env python3
"""
Root entrypoint for OutageIQ Unified Single Server
"""
import os
import sys
import argparse

backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from server import run_server

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OutageIQ Unified Python Single Server")
    parser.add_argument("--host", type=str, default=None, help="Host address to bind")
    parser.add_argument("--port", type=int, default=None, help="Port to listen on")
    parser.add_argument("--db-path", type=str, default=None, help="SQLite database path")
    args = parser.parse_args()

    run_server(host=args.host, port=args.port, db_path=args.db_path)
