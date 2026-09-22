pub mod android;
pub mod ios;

use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum CryptoAlgorithm {
    Aes256Gcm,
    P256,
    Ed25519,
    X25519,
    MlKem768,
    MlKem1024,
    MlDsa,
    Unknown(String),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CapabilityAssurance {
    AppOnly,
    RequiresOs,
    RequiresHardware,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlatformCapabilities {
    pub hardware_backed_keystore: bool,
    pub dedicated_secure_hardware: bool,
    pub secure_user_auth: bool,
    pub remote_attestation: bool,
    pub protected_vm: bool,
    pub monotonic_counter: bool,
    pub algorithms: BTreeSet<CryptoAlgorithm>,
}

impl PlatformCapabilities {
    pub fn supports(&self, algorithm: &CryptoAlgorithm) -> bool {
        self.algorithms.contains(algorithm)
    }
}
