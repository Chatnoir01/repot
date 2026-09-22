use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum SecurityState {
    Normal,
    Elevated,
    Restricted,
    Quarantine,
    Lockdown,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum TransitionError {
    #[error("host cannot lower security state without independent recovery authorization")]
    UnauthorizedDeescalation,
}

impl SecurityState {
    pub fn transition(self, target: Self, recovery_authorized: bool) -> Result<Self, TransitionError> {
        if target < self && !recovery_authorized {
            return Err(TransitionError::UnauthorizedDeescalation);
        }
        Ok(target)
    }
}
