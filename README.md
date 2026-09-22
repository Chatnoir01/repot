# Secure Core Mobile

Experimental high-assurance mobile security R&D project.

## Central hypothesis
Can cryptographic-use authorization be enforced from a stronger trust boundary than the app or primary mobile OS, so that compromise of the host alone does not necessarily allow forbidden cryptographic operations?

## Current implementation
The repository now contains an executable Rust Secure Core with:
- five-state policy machine;
- evidence provenance and freshness checks;
- replay/policy rollback defenses at the software layer;
- separated key metadata lifecycle;
- authenticated local storage primitive;
- recovery, relay and transparency components;
- platform-capability/attestation boundaries;
- Red-Team/property tests;
- CI, scans, SBOM and evidence receipts.

## Truth labels
PLANNED / IMPLEMENTED / TESTED / ADVERSARIAL_TESTED / VERIFIED / EXPERIMENTAL / SIMULATED / BLOCKED

Hardware-backed Android/iOS and protected-VM claims remain BLOCKED or EXPERIMENTAL until exercised on compatible devices. No such property is claimed VERIFIED.
