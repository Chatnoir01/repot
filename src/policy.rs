use crate::{Evidence, EvidenceError, SecurityState};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Decision {
    Allow,
    Deny,
    ReauthRequired,
    RecoveryRequired,
    Quarantine,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Request {
    pub operation: Operation,
    pub state: SecurityState,
    pub key_id: Option<String>,
    pub caller: String,
    pub context: String,
    pub evidence: Evidence,
}

pub struct PolicyEngine {
    policy_version: u64,
    highest_counter: u64,
    consumed_nonces: HashSet<[u8; 32]>,
}

impl PolicyEngine {
    pub fn new(policy_version: u64) -> Self {
        Self {
            policy_version,
            highest_counter: 0,
            consumed_nonces: HashSet::new(),
        }
    }

    pub fn policy_version(&self) -> u64 {
        self.policy_version
    }

    pub fn advance_policy_version(&mut self, new_version: u64) -> Result<(), EvidenceError> {
        if new_version < self.policy_version {
            return Err(EvidenceError::PolicyRollback);
        }
        if new_version == self.policy_version {
            return Ok(());
        }
        self.policy_version = new_version;
        self.highest_counter = 0;
        self.consumed_nonces.clear();
        Ok(())
    }

    pub fn authorize(&mut self, request: Request) -> Result<Decision, EvidenceError> {
        if request.evidence.policy_version < self.policy_version {
            return Err(EvidenceError::PolicyRollback);
        }
        if request.evidence.policy_version > self.policy_version {
            return Err(EvidenceError::UnknownPolicyVersion);
        }
        if self.consumed_nonces.contains(&request.evidence.nonce) {
            return Err(EvidenceError::Replay);
        }
        if request.evidence.counter <= self.highest_counter {
            return Err(EvidenceError::StaleCounter);
        }

        self.consumed_nonces.insert(request.evidence.nonce);
        self.highest_counter = request.evidence.counter;

        let strong_auth = request.evidence.has_strong_auth();
        let independent_recovery = request.evidence.has_independent_recovery();

        let decision = match request.state {
            SecurityState::Lockdown => match request.operation {
                Operation::Recover | Operation::Revoke => Decision::RecoveryRequired,
                _ => Decision::Deny,
            },
            SecurityState::Quarantine => match request.operation {
                Operation::Recover => Decision::RecoveryRequired,
                Operation::Revoke => Decision::Allow,
                _ => Decision::Deny,
            },
            SecurityState::Restricted => match request.operation {
                Operation::Encrypt | Operation::Revoke => Decision::Allow,
                Operation::Recover => Decision::RecoveryRequired,
                _ => Decision::Deny,
            },
            SecurityState::Elevated => match request.operation {
                Operation::IdentitySign
                | Operation::Decrypt
                | Operation::SessionCreate
                | Operation::Recover => {
                    if strong_auth {
                        Decision::Allow
                    } else {
                        Decision::ReauthRequired
                    }
                }
                Operation::DeviceAdd
                | Operation::Rotate
                | Operation::PolicyModify
                | Operation::Export
                | Operation::Admin => Decision::Deny,
                _ => Decision::Allow,
            },
            SecurityState::Normal => match request.operation {
                Operation::Export => Decision::Deny,
                Operation::IdentitySign
                | Operation::Decrypt
                | Operation::SessionCreate
                | Operation::DeviceAdd
                | Operation::Rotate
                | Operation::PolicyModify
                | Operation::Admin => {
                    if strong_auth {
                        Decision::Allow
                    } else {
                        Decision::ReauthRequired
                    }
                }
                Operation::Recover => {
                    if independent_recovery {
                        Decision::Allow
                    } else {
                        Decision::RecoveryRequired
                    }
                }
                _ => Decision::Allow,
            },
        };

        Ok(decision)
    }
}
