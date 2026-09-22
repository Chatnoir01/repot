# Project Status

## Foundation
- Architecture: IMPLEMENTED
- Threat model: IMPLEMENTED
- Five-state machine specification: IMPLEMENTED
- Invariant registry: IMPLEMENTED
- Key lifecycle specification: IMPLEMENTED
- Hostile-host experiment plan: IMPLEMENTED

## Executable core
- Rust Secure Core library: IMPLEMENTED
- Policy Engine: IMPLEMENTED
- Evidence provenance model: IMPLEMENTED
- Anti-replay nonce tracking: IMPLEMENTED
- Counter freshness checks: IMPLEMENTED
- Policy rollback/future-version rejection: IMPLEMENTED
- Key metadata lifecycle registry: IMPLEMENTED
- XChaCha20-Poly1305 storage primitive: IMPLEMENTED
- Progressive anti-bruteforce state escalation: IMPLEMENTED
- Recovery quorum orchestration: IMPLEMENTED
- Ciphertext-only relay store: IMPLEMENTED
- Transparency checkpoint/equivocation detector: IMPLEMENTED
- Attestation challenge-binding validator: IMPLEMENTED
- Android capability model: IMPLEMENTED
- OpenPGP provider boundary: IMPLEMENTED
- Messaging provider boundary: IMPLEMENTED
- Receipt/SHA3-512 tooling: IMPLEMENTED
- Secret/source-policy scanners: IMPLEMENTED
- CI pipeline: IMPLEMENTED
- SPDX SBOM generation script: IMPLEMENTED
- Red-Team tests: IMPLEMENTED
- Property-based tests: IMPLEMENTED
- Fuzz target scaffold: IMPLEMENTED

## Requires real platform/device work
- Android Keystore/StrongBox native adapter: BLOCKED pending compatible Android build/device
- Hardware attestation certificate-chain/root validation: BLOCKED pending platform adapter and trust roots
- AVF/pKVM protected VM transport: EXPERIMENTAL/BLOCKED pending compatible device
- iOS Keychain/Secure Enclave native adapter: PLANNED
- RFC 9580 OpenPGP provider selection/integration: PLANNED
- Modern audited messaging protocol provider integration: PLANNED
- Transparency gossip/witness deployment: PLANNED
- Threshold cryptography for recovery: PLANNED research; quorum orchestration is not threshold crypto

## Verification truth
No hardware security property is VERIFIED.
A passing repository test proves only the tested software invariant in its documented scope.
