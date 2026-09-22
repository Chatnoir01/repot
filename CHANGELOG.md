# Changelog

## Unreleased
- Initialized Secure Core Mobile R&D foundation.
- Added architecture, threat model, state machine, key lifecycle, invariants, assumptions and experiments.
- Added executable Rust policy/evidence/state core.
- Added key lifecycle registry without secret material storage.
- Added XChaCha20-Poly1305 authenticated storage primitive through RustCrypto.
- Added Android capability model and attestation binding boundary.
- Added recovery quorum orchestration, ciphertext relay and transparency checkpointing.
- Added OpenPGP and messaging provider boundaries without inventing custom cryptographic protocols.
- Added anti-bruteforce escalation without automatic destructive wipe.
- Added Red-Team and property-based tests.
- Added secret scanning, source policy checks, SPDX SBOM generation and machine-readable receipts to CI.
- Added fuzzing scaffold for policy requests.
