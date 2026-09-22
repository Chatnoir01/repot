#!/usr/bin/env python3
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
INCLUDE = {".rs", ".toml", ".yml", ".yaml", ".md", ".json", ".kt", ".swift"}
SKIP_PARTS = {".git", "target", "evidence"}
patterns = [
    ("private-key-block", re.compile("BEGIN " + "PRIVATE KEY")),
    ("aws-access-key", re.compile("AKIA" + r"[A-Z0-9]{16}")),
    ("github-token", re.compile("gh" + r"[ps]_[A-Za-z0-9]{20,}")),
    ("generic-secret-assignment", re.compile(r"(?i)(api[_-]?key|secret|token)\s*=\s*['\"][^'\"]{16,}['\"]")),
]
findings = []
for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix not in INCLUDE:
        continue
    if any(part in SKIP_PARTS for part in path.parts):
        continue
    if path.name == pathlib.Path(__file__).name:
        continue
    try:
        text = path.read_text("utf-8")
    except UnicodeDecodeError:
        continue
    for name, pattern in patterns:
        for match in pattern.finditer(text):
            findings.append((str(path.relative_to(ROOT)), name, match.start()))
if findings:
    for item in findings:
        print("SECRET_SCAN_FAIL", *item)
    sys.exit(1)
print("SECRET_SCAN_OK")
