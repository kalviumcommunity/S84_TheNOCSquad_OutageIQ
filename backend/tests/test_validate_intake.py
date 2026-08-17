import unittest
import sys
import os
import tempfile
import json
import pandas as pd

# Add root directory to sys.path so scripts can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scripts.validate_intake import (
    validate_file_exists,
    validate_file_format,
    validate_schema,
    detect_encoding,
    capture_dataset_stats,
    generate_intake_report,
)


class TestValidateIntake(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.valid_csv_path = os.path.join(self.temp_dir.name, "sample.csv")
        self.empty_file_path = os.path.join(self.temp_dir.name, "empty.csv")
        self.unsupported_file_path = os.path.join(self.temp_dir.name, "data.txt")

        # Create valid CSV
        self.sample_df = pd.DataFrame({
            'customer_id': ['C001', 'C002'],
            'customer_name': ['Alice', 'Bob'],
            'transaction_amount': [150.0, 200.5],
            'transaction_date': ['2026-08-01', '2026-08-02']
        })
        self.sample_df.to_csv(self.valid_csv_path, index=False)

        # Create empty file
        open(self.empty_file_path, 'w').close()

        # Create unsupported format file
        with open(self.unsupported_file_path, 'w') as f:
            f.write("text content")

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_validate_file_exists(self):
        """Test validate_file_exists for non-existent, empty, and valid files."""
        exists, msg = validate_file_exists("non_existent_file.csv")
        self.assertFalse(exists)
        self.assertIn("File does not exist", msg)

        exists, msg = validate_file_exists(self.empty_file_path)
        self.assertFalse(exists)
        self.assertIn("File is empty", msg)

        exists, msg = validate_file_exists(self.valid_csv_path)
        self.assertTrue(exists)
        self.assertIn("File exists", msg)

    def test_validate_file_format(self):
        """Test validate_file_format for supported and unsupported extensions."""
        valid, msg = validate_file_format(self.valid_csv_path)
        self.assertTrue(valid)
        self.assertIn("Format valid", msg)

        valid, msg = validate_file_format(self.unsupported_file_path)
        self.assertFalse(valid)
        self.assertIn("Unsupported format", msg)

    def test_validate_schema(self):
        """Test validate_schema for complete, missing, and extra columns."""
        expected = ["customer_id", "customer_name", "transaction_amount", "transaction_date"]
        
        valid, msg = validate_schema(self.sample_df, expected)
        self.assertTrue(valid)
        self.assertIn("Schema valid", msg)

        # Missing column
        valid, msg = validate_schema(self.sample_df, expected + ["missing_col"])
        self.assertFalse(valid)
        self.assertIn("Missing columns", msg)

        # Extra column
        extra_df = self.sample_df.copy()
        extra_df["extra_col"] = 123
        valid, msg = validate_schema(extra_df, expected)
        self.assertFalse(valid)
        self.assertIn("Unexpected columns", msg)

    def test_detect_encoding(self):
        """Test detect_encoding returns an encoding and status string."""
        encoding, msg = detect_encoding(self.valid_csv_path)
        self.assertIsNotNone(encoding)
        self.assertIn("Detected:", msg)

    def test_capture_dataset_stats(self):
        """Test capture_dataset_stats returns accurate row and column metrics."""
        stats = capture_dataset_stats(self.valid_csv_path, self.sample_df)
        self.assertEqual(stats["rows"], 2)
        self.assertEqual(stats["columns"], 4)
        self.assertGreater(stats["bytes"], 0)

    def test_generate_intake_report(self):
        """Test complete report generation and JSON output."""
        output_report_path = os.path.join(self.temp_dir.name, "report.json")
        expected = ["customer_id", "customer_name", "transaction_amount", "transaction_date"]

        report = generate_intake_report(
            self.valid_csv_path,
            expected,
            output_path=output_report_path
        )

        self.assertIn("timestamp", report)
        self.assertEqual(report["filepath"], self.valid_csv_path)
        self.assertTrue(report["validations"]["file_exists"]["passed"])
        self.assertTrue(report["validations"]["format"]["passed"])
        self.assertTrue(report["validations"]["schema"]["passed"])
        self.assertEqual(report["statistics"]["rows"], 2)

        # Verify output file written to disk
        self.assertTrue(os.path.exists(output_report_path))
        with open(output_report_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.assertEqual(data["filepath"], self.valid_csv_path)


if __name__ == '__main__':
    unittest.main()
