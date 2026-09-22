# Key Lifecycle

Never use a universal master key.

Separate:
- device/root protection
- authorization key
- storage KEK/DEK
- OpenPGP signing identity
- OpenPGP encryption/subkeys
- messaging device identity
- handshake material
- ratchet/session secrets
- recovery material
- revocation material

## Platform truth rule
No algorithm is labelled hardware-backed until the exact platform API and device capability prove it.

If a desired OpenPGP key type cannot live directly in hardware, use an explicit wrapping/sealing construction with documented assumptions instead of claiming direct non-exportability.
