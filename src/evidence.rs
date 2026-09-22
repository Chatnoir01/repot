use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Evidence {
    pub nonce: [u8; 32],
    pub counter: u64,
    pub policy_version: u64,
    pub authenticated: bool,
    pub recovery_authorized: bool,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum EvidenceError {
    #[error("evidence nonce has already been consumed")]
    Replay,
    #[error("evidence counter is stale")]
    StaleCounter,
    #[error("policy version is stale")]
    PolicyRollback,
}
