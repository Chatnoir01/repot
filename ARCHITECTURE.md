# Secure Core Mobile — Architecture

Status: EXPERIMENTAL

## Objective
Test whether cryptographic-use authorization can be enforced from a stronger trust boundary than the mobile app or primary host OS.

## Core domains
- Secure Core API
- Policy Engine
- State Machine
- Evidence Engine
- Key Lifecycle Manager
- OpenPGP subsystem
- Messaging crypto subsystem
- Storage encryption
- Android hardware-backed adapter
- StrongBox/Keystore capability detection
- Attestation adapter
- AVF/pKVM protected-VM experiment
- Recovery/revocation
- Key/device transparency
- Minimal relay/backend
- Audit events
- Red-Team harness
- Fuzzing
- Invariant tests

## Trust boundaries
1. Mobile app: untrusted for critical authorization decisions.
2. Host Android OS: potentially compromised in hostile-host experiments.
3. Isolated policy boundary: experimental target.
4. Hardware-backed key boundary: capability-dependent and never assumed generically.
5. Backend: never trusted with plaintext E2EE secrets.

## Architectural rule
A non-exportable key is not considered sufficient protection if a compromised host can still compel unauthorized cryptographic operations.
