#!/usr/bin/env python3
import json
import pathlib
import sys
import uuid

metadata_path = pathlib.Path(sys.argv[1])
out_path = pathlib.Path(sys.argv[2])
metadata = json.loads(metadata_path.read_text("utf-8"))
packages = []
for pkg in sorted(metadata.get("packages", []), key=lambda p: p["id"]):
    packages.append({
        "SPDXID": "SPDXRef-" + str(abs(hash(pkg["id"]))),
        "name": pkg["name"],
        "versionInfo": pkg["version"],
        "downloadLocation": "NOASSERTION",
        "filesAnalyzed": False,
        "licenseConcluded": "NOASSERTION",
        "licenseDeclared": pkg.get("license") or "NOASSERTION",
    })
doc = {
    "spdxVersion": "SPDX-2.3",
    "dataLicense": "CC0-1.0",
    "SPDXID": "SPDXRef-DOCUMENT",
    "name": "secure-core-sbom",
    "documentNamespace": "https://secure-core.invalid/spdx/" + str(uuid.uuid4()),
    "creationInfo": {
        "created": "1970-01-01T00:00:00Z",
        "creators": ["Tool: secure-core/scripts/sbom.py"],
    },
    "packages": packages,
}
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(doc, indent=2, sort_keys=True) + "\n", "utf-8")
print(out_path)
