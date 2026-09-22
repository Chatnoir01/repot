use crate::SecurityState;
use serde::{Deserialize, Serialize};
use sha3::{Digest, Sha3_512};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub event_type: String,
    pub policy_version: u64,
    pub state_before: SecurityState,
    pub state_after: SecurityState,
    pub reason: String,
    pub counter: u64,
    pub evidence_hash: String,
}

pub fn digest_evidence(bytes: &[u8]) -> String {
    hex::encode(Sha3_512::digest(bytes))
}
