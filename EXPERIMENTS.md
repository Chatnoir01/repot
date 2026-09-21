# Experimental Program

## E-001 Hostile-host authorization
Goal: test whether a host-controlled Android environment can compel a forbidden cryptographic operation across the isolated policy boundary.

Attack set:
- direct call
- forged IPC
- replay
- rollback
- stale evidence
- caller spoofing
- hooking
- reboot
- clock manipulation
- flood
- malformed messages
- restored snapshots
- policy downgrade

Kill criterion:
If the hostile host obtains an operation forbidden by current policy without satisfying the independent authorization requirements, the corresponding invariant fails.

## E-002 Anti-DoS state transitions
Test whether attacker-triggered authentication failures can force permanent loss or irreversible wipe.

## E-003 Recovery bypass
Test whether recovery mechanisms become an easier bypass than the protected key path.
