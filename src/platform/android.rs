use super::{CryptoAlgorithm, PlatformCapabilities};
use std::collections::BTreeSet;

#[derive(Debug, Clone, Default)]
pub struct AndroidCapabilityProbe {
    pub hardware_backed_keystore: bool,
    pub strongbox: bool,
    pub secure_user_auth: bool,
    pub remote_attestation: bool,
    pub protected_vm: bool,
    pub monotonic_counter: bool,
    pub observed_algorithms: BTreeSet<CryptoAlgorithm>,
}

pub fn detect_from_probe(probe: AndroidCapabilityProbe) -> PlatformCapabilities {
    PlatformCapabilities {
        hardware_backed_keystore: probe.hardware_backed_keystore,
        dedicated_secure_hardware: probe.strongbox,
        secure_user_auth: probe.secure_user_auth,
        remote_attestation: probe.remote_attestation,
        protected_vm: probe.protected_vm,
        monotonic_counter: probe.monotonic_counter,
        algorithms: probe.observed_algorithms,
    }
}
