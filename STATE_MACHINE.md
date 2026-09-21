# Security State Machine

States:
NORMAL -> ELEVATED -> RESTRICTED -> QUARANTINE -> LOCKDOWN

## Principles
- Deterministic transitions.
- Versioned policy.
- Auditable transition records.
- Replay/rollback resistance where platform support exists.
- Host cannot directly force transition back to NORMAL.

## Minimum operation classes
identity_sign
decrypt
encrypt
session_create
session_continue
device_add
rotate
revoke
recover
policy_modify
export
admin

## Preliminary policy
| Operation | NORMAL | ELEVATED | RESTRICTED | QUARANTINE | LOCKDOWN |
|---|---|---|---|---|---|
| identity_sign | ALLOW | REAUTH | DENY | DENY | DENY |
| decrypt | ALLOW | REAUTH | POLICY_LIMITED | DENY | DENY |
| encrypt | ALLOW | ALLOW | ALLOW_LIMITED | DENY | DENY |
| session_create | ALLOW | REAUTH | DENY | DENY | DENY |
| session_continue | ALLOW | ALLOW | POLICY_LIMITED | DENY | DENY |
| device_add | REAUTH | DENY | DENY | DENY | DENY |
| rotate | REAUTH | DENY | DENY | DENY | DENY |
| revoke | ALLOW | ALLOW | ALLOW | ALLOW | SPECIAL |
| recover | REAUTH | RECOVERY_REQUIRED | RECOVERY_REQUIRED | RECOVERY_REQUIRED | RECOVERY_REQUIRED |
| policy_modify | REAUTH | DENY | DENY | DENY | DENY |
| export | DENY | DENY | DENY | DENY | DENY |
| admin | REAUTH | DENY | DENY | DENY | DENY |

This table is a candidate specification, not a verified security guarantee.
