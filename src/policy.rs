use crate::{Evidence, EvidenceError, SecurityState};
use std::collections::HashSet;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Operation {
    IdentitySign,
    Decrypt,
    Encrypt,
    SessionCreate,
    SessionContinue,
    DeviceAdd,
    Rotate,
    Revoke,
    Recover,
    PolicyModify,
    Export,
    Admin,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Decision {
    Allow,
    Deny,
    ReauthRequired,
    RecoveryRequired,
    Quarantine,
}

pub struct Request {
    pub operation: Operation,
    pub state: SecurityState,
    pub evidence: Evidence,
}

pub struct PolicyEngine {
    policy_version: u64,
    highest_counter: u64,
    consumed_nonces: HashSet<[u8; 32]>,
}

impl PolicyEngine {
    pub fn new(policy_version: u64) -> Self {
        Self { policy_version, highest_counter: 0, consumed_nonces: HashSet::new() }
    }

    pub fn authorize(&mut self, request: Request) -> Result<Decision, EvidenceError> {
        if request.evidence.policy_version < self.policy_version {
            return Err(EvidenceError::PolicyRollback);
        }
        if request.evidence.counter <= self.highest_counter {
            return Err(EvidenceError::StaleCounter);
        }
        if !self.consumed_nonces.insert(request.evidence.nonce) {
            return Err(EvidenceError::Replay);
        }
        self.highest_counter = request.evidence.counter;

        use Decision::*;
        use Operation::*;
        use SecurityState::*;

        let decision = match request.state {
            Lockdown => match request.operation {
                Recover | Revoke => RecoveryRequired,
                _ => Deny,
            },
            Quarantine => match request.operation {
                Recover => RecoveryRequired,
                Revoke => Allow,
                _ => Deny,
            },
            Restricted => match request.operation {
                Encrypt | Revoke => Allow,
                Recover => RecoveryRequired,
                _ => Deny,
            },
            Elevated => match request.operation {
                IdentitySign | Decrypt | SessionCreate | Recover => {
                    if request.evidence.authenticated { Allow } else { ReauthRequired }
                }
                DeviceAdd | Rotate | PolicyModify | Export | Admin => Deny,
                _ => Allow,
            },
            Normal => match request.operation {
                Export => Deny,
                IdentitySign | Decrypt | SessionCreate | DeviceAdd | Rotate | PolicyModify | Admin => {
                    if request.evidence.authenticated { Allow } else { ReauthRequired }
                }
                Recover => if request.evidence.recovery_authorized { Allow } else { RecoveryRequired },
                _ => Allow,
            },
        };
        Ok(decision)
    }
}
