# Security Invariants

All invariants begin as PLANNED until tests provide evidence.

## I-001
LOCKDOWN forbids ordinary critical cryptographic operations.

## I-002
QUARANTINE cannot return to NORMAL solely from an unauthenticated host command.

## I-003
Expired or replayed authorization evidence cannot authorize a critical operation.

## I-004
Policy rollback cannot restore an authorization removed by a newer policy.

## I-005
Compromise of relay/backend does not reveal user private keys.

## I-006
PIN failures alone never automatically trigger irreversible destruction.

## I-007
Non-exportable secret material is never serialized into logs, backups, or IPC.

## I-008
An operation denied by policy cannot be obtained through an equivalent uncontrolled cryptographic API.

## Evidence record
Each invariant must track:
- threat
- assumptions
- test
- expected_result
- observed_result
- status
- evidence
