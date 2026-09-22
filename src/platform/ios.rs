use super::{CryptoAlgorithm, PlatformCapabilities};
use std::collections::BTreeSet;

#[derive(Debug, Clone, Default)]
pub struct IosCapabilityProbe {
    pub hardware_backed_keystore: bool,
    pub secure_enclave_observed: bool,
    pub secure_user_auth: bool,
    pub device_attestation_observed: bool,
    pub monotonic_counter_observed: bool,
    pub observed_algorithms: BTreeSet<CryptoAlgorithm>,
}

pub fn detect_from_probe(probe: IosCapabilityProbe) -> PlatformCapabilities {
    PlatformCapabilities {
        hardware_backed_keystore: probe.hardware_backed_keystore,
        dedicated_secure_hardware: probe.secure_enclave_observed,
        secure_user_auth: probe.secure_user_auth,
        remote_attestation: probe.device_attestation_observed,
        protected_vm: false,
        monotonic_counter: probe.monotonic_counter_observed,
        algorithms: probe.observed_algorithms,
    }
}
