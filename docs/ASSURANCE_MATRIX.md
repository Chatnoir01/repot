# Assurance Matrix

| Component / property | Classification | Current status |
|---|---|---|
| Rust policy engine | APP_ONLY | IMPLEMENTED |
| Five-state transition logic | APP_ONLY | IMPLEMENTED; test status depends on CI |
| XChaCha20-Poly1305 storage | APP_ONLY | IMPLEMENTED using RustCrypto |
| Secret-free relay data model | APP_ONLY | IMPLEMENTED |
| Recovery quorum orchestration | APP_ONLY | IMPLEMENTED; not threshold cryptography |
| Transparency checkpoint/equivocation detector | APP_ONLY | IMPLEMENTED; gossip/witness deployment pending |
| Android capability probe boundary | REQUIRES_HARDWARE | IMPLEMENTED interface/model |
| StrongBox-backed operation | REQUIRES_HARDWARE | BLOCKED pending native adapter/device |
| Hardware attestation chain validation | REQUIRES_HARDWARE | BLOCKED pending native adapter/trust roots |
| AVF/pKVM protected policy boundary | REQUIRES_OS + REQUIRES_HARDWARE | EXPERIMENTAL/BLOCKED |
| iOS Secure Enclave adapter | REQUIRES_HARDWARE | PLANNED |
| OpenPGP provider | APP_ONLY or hardware-dependent | Boundary implemented; provider pending |
| Modern messaging provider | APP_ONLY or hardware-dependent | Boundary implemented; audited provider pending |

No hardware security property is VERIFIED.
