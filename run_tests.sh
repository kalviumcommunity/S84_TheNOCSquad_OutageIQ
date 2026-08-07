#!/usr/bin/env bash
set -e

echo "=========================================="
echo " Running OutageIQ Unified Test Suite"
echo "=========================================="

echo "[1/3] Running Python Analytics & Intake Script Tests..."
if [ -f "./venv/bin/python3" ]; then
  ./venv/bin/python3 -m unittest discover -s tests
else
  python3 -m unittest discover -s tests
fi

echo "[2/3] Running Backend API Unit & Integration Tests..."
npm --prefix backend test

echo "[3/3] Running Frontend Component & Client Unit Tests..."
npm --prefix frontend test

echo "=========================================="
echo " ALL TEST SUITES PASSED SUCCESSFULLY!"
echo "=========================================="
