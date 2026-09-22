# Security Assumptions

- Hardware roots of trust can fail; they are assumptions, not absolute guarantees.
- Host Android may be malicious in hostile-host experiments.
- Root/jailbreak detection is heuristic and not a security boundary.
- Remote attestation proves only the properties it actually attests.
- Server-side availability is not assumed.
- No server-held master key may bypass E2EE.
- User recovery is treated as a separate attack surface.
- Time from the host is not trusted for critical freshness decisions unless anchored by a stronger source.
