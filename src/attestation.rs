use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum VerifiedBootState {
    Verified,
    SelfSigned,
    Unverified,
    Failed,
    Unknown,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AttestationEvidence {
    pub challenge: Vec<u8>,
    pub app_identity_digest: Vec<u8>,
    pub boot_state: VerifiedBootState,
    pub hardware_backed: bool,
    pub security_level: String,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum AttestationError {
    #[error("attestation challenge mismatch")]
    ChallengeMismatch,
    #[error("verified boot requirement not satisfied")]
    BootStateRejected,
    #[error("hardware-backed attestation required")]
    HardwareRequired,
}

pub fn validate_binding(
    evidence: &AttestationEvidence,
    expected_challenge: &[u8],
    require_verified_boot: bool,
    require_hardware: bool,
) -> Result<(), AttestationError> {
    if evidence.challenge != expected_challenge {
        return Err(AttestationError::ChallengeMismatch);
    }
    if require_verified_boot && evidence.boot_state != VerifiedBootState::Verified {
        return Err(AttestationError::BootStateRejected);
    }
    if require_hardware && !evidence.hardware_backed {
        return Err(AttestationError::HardwareRequired);
    }
    Ok(())
}

// Certificate-chain parsing and platform-root validation intentionally live outside
// this pure core module. A caller must not label evidence VERIFIED merely because
// this binding check succeeds.
