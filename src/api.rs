use crate::keys::{KeyRegistry, KeyStatus};
use crate::policy::{Decision, Operation, PolicyEngine, Request};
use crate::EvidenceError;
use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum CoreError {
    #[error(transparent)]
    Evidence(#[from] EvidenceError),
    #[error("requested key is unknown")]
    UnknownKey,
    #[error("requested key is not active")]
    InactiveKey,
}

pub struct SecureCore {
    policy: PolicyEngine,
    keys: KeyRegistry,
}

impl SecureCore {
    pub fn new(policy_version: u64) -> Self {
        Self {
            policy: PolicyEngine::new(policy_version),
            keys: KeyRegistry::default(),
        }
    }

    pub fn keys_mut(&mut self) -> &mut KeyRegistry {
        &mut self.keys
    }

    pub fn authorize(&mut self, request: Request) -> Result<Decision, CoreError> {
        if operation_requires_key(request.operation) {
            let id = request.key_id.as_deref().ok_or(CoreError::UnknownKey)?;
            let key = self.keys.get(id).ok_or(CoreError::UnknownKey)?;
            if key.status != KeyStatus::Active {
                return Err(CoreError::InactiveKey);
            }
        }
        Ok(self.policy.authorize(request)?)
    }
}

fn operation_requires_key(operation: Operation) -> bool {
    matches!(
        operation,
        Operation::IdentitySign
            | Operation::Decrypt
            | Operation::Encrypt
            | Operation::SessionCreate
            | Operation::SessionContinue
            | Operation::Rotate
            | Operation::Export
    )
}
