#!/usr/bin/env python3
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
roots = [ROOT / "src", ROOT / "tests"]
forbidden = {
    "unsafe block": "unsafe {",
    "plaintext http": "http://",
    "tls verification disabled": "verify=False",
    "python pickle load": "pickle.load(",
    "unsafe yaml load": "yaml.load(",
}
failures = []
for base in roots:
    if not base.exists():
        continue
    for path in base.rglob("*"):
        if not path.is_file():
            continue
        try:
            text = path.read_text("utf-8")
        except UnicodeDecodeError:
            continue
        for name, needle in forbidden.items():
            if needle in text:
                failures.append((str(path.relative_to(ROOT)), name))
if failures:
    for path, reason in failures:
        print("SOURCE_POLICY_FAIL", path, reason)
    sys.exit(1)
print("SOURCE_POLICY_OK")
