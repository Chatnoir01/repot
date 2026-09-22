use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EvidenceSource {
    Host,
    HardwareUserAuth,
    Attestation,
    RecoveryQuorum,
    IsolatedCore,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Evidence {
    pub nonce: [u8; 32],
    pub counter: u64,
    pub policy_version: u64,
    pub auth_source: Option<EvidenceSource>,
    pub recovery_source: Option<EvidenceSource>,
}

impl Evidence {
    pub fn has_strong_auth(&self) -> bool {
        matches!(
            self.auth_source,
            Some(EvidenceSource::HardwareUserAuth | EvidenceSource::IsolatedCore)
        )
    }

    pub fn has_independent_recovery(&self) -> bool {
        matches!(
            self.recovery_source,
            Some(EvidenceSource::RecoveryQuorum | EvidenceSource::IsolatedCore)
        )
    }
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum EvidenceError {
    #[error("evidence nonce has already been consumed")]
    Replay,
    #[error("evidence counter is stale")]
    StaleCounter,
    #[error("policy version is stale")]
    PolicyRollback,
    #[error("evidence references an unknown future policy version")]
    UnknownPolicyVersion,
}
