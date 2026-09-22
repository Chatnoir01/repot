#!/usr/bin/env python3
import hashlib
import json
import os
import pathlib
import sys
from datetime import datetime, timezone

root = pathlib.Path(__file__).resolve().parents[1]
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else root / "evidence" / "receipt.json")
targets = ["Cargo.toml", "ARCHITECTURE.md", "INVARIANTS.md", "STATE_MACHINE.md", "THREAT_MODEL.md"]
hashes = {}
for rel in targets:
    p = root / rel
    if p.exists():
        hashes[rel] = hashlib.sha3_512(p.read_bytes()).hexdigest()
receipt = {
    "timestamp_utc": datetime.now(timezone.utc).isoformat(),
    "commit": os.getenv("GITHUB_SHA", "LOCAL_OR_UNKNOWN"),
    "environment": os.getenv("RUNNER_OS", "unknown"),
    "test_suite": "cargo test --all-targets --all-features",
    "result": os.getenv("SECURE_CORE_TEST_RESULT", "UNKNOWN"),
    "artifact_hashes_sha3_512": hashes,
    "invariants": ["I-001", "I-002", "I-003", "I-004", "I-006", "I-007", "I-008"],
}
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", "utf-8")
print(out)
