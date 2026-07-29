import json
import os
from datetime import datetime

import chardet
import pandas as pd


ALLOWED_FORMATS = ["csv", "json", "xlsx"]
DEFAULT_OUTPUT_PATH = os.path.join("output", "intake_report.json")


def validate_file_exists(filepath):
    """Check if file exists and is non-empty."""
    if not os.path.exists(filepath):
        return False, f"File does not exist: {filepath}"

    if os.path.getsize(filepath) == 0:
        return False, f"File is empty: {filepath}"

    return True, "File exists and has content"


def validate_file_format(filepath, allowed_formats=None):
    """Check if file extension is supported."""
    allowed_formats = allowed_formats or ALLOWED_FORMATS
    extension = filepath.split(".")[-1].lower()

    if extension not in allowed_formats:
        return False, f"Unsupported format: {extension}. Allowed: {allowed_formats}"

    return True, f"Format valid: {extension}"


def validate_schema(df, expected_columns):
    """Validate that DataFrame has all expected columns."""
    missing = set(expected_columns) - set(df.columns)
    extra = set(df.columns) - set(expected_columns)

    issues = []
    if missing:
        issues.append(f"Missing columns: {sorted(missing)}")
    if extra:
        issues.append(f"Unexpected columns: {sorted(extra)}")

    if not issues:
        return True, f"Schema valid: {len(df.columns)} columns present"
    return False, " | ".join(issues)


def detect_encoding(filepath):
    """Detect file encoding with confidence."""
    with open(filepath, "rb") as file_handle:
        result = chardet.detect(file_handle.read(10000))

    encoding = result.get("encoding", "utf-8")
    confidence = result.get("confidence", 0)
    return encoding, f"Detected: {encoding} (confidence: {confidence:.1%})"


def capture_dataset_stats(filepath, df):
    """Log row count and file size."""
    file_size_bytes = os.path.getsize(filepath)
    file_size_mb = file_size_bytes / (1024 * 1024)

    return {
        "rows": len(df),
        "columns": len(df.columns),
        "file_size_mb": round(file_size_mb, 5),
        "bytes": file_size_bytes,
    }


def _load_dataframe(filepath):
    extension = filepath.split(".")[-1].lower()

    if extension == "csv":
        return pd.read_csv(filepath)
    if extension == "json":
        return pd.read_json(filepath)
    if extension == "xlsx":
        return pd.read_excel(filepath)

    raise ValueError(f"Unsupported format: {extension}")


def _validation_status(message, passed):
    return {
        "passed": passed,
        "message": message,
    }


def generate_intake_report(filepath, expected_columns, output_path=DEFAULT_OUTPUT_PATH):
    """Generate complete intake validation report."""
    report = {
        "timestamp": datetime.now().isoformat(),
        "filepath": filepath,
        "validations": {},
    }

    file_exists, message = validate_file_exists(filepath)
    report["validations"]["file_exists"] = _validation_status(message, file_exists)
    if not file_exists:
        return report

    format_valid, message = validate_file_format(filepath)
    report["validations"]["format"] = _validation_status(message, format_valid)
    if not format_valid:
        return report

    encoding, encoding_message = detect_encoding(filepath)
    report["validations"]["encoding"] = _validation_status(encoding_message, True)
    report["validations"]["encoding"]["detected_encoding"] = encoding

    df = _load_dataframe(filepath)

    schema_valid, message = validate_schema(df, expected_columns)
    report["validations"]["schema"] = _validation_status(message, schema_valid)

    report["statistics"] = capture_dataset_stats(filepath, df)

    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as file_handle:
        json.dump(report, file_handle, indent=2, default=str)

    return report


def main():
    sample_path = os.path.join("data", "raw", "sample.csv")
    expected_columns = [
        "customer_id",
        "customer_name",
        "transaction_amount",
        "transaction_date",
    ]

    report = generate_intake_report(sample_path, expected_columns)
    print(json.dumps(report, indent=2, default=str))


if __name__ == "__main__":
    main()