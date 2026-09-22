use std::collections::BTreeSet;
use thiserror::Error;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RecoveryPolicy {
    pub threshold: usize,
    pub total_factors: usize,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum RecoveryError {
    #[error("invalid threshold recovery policy")]
    InvalidPolicy,
    #[error("duplicate recovery factor approval")]
    DuplicateFactor,
    #[error("recovery threshold not reached")]
    ThresholdNotReached,
}

impl RecoveryPolicy {
    pub fn new(threshold: usize, total_factors: usize) -> Result<Self, RecoveryError> {
        if threshold == 0 || total_factors == 0 || threshold > total_factors {
            return Err(RecoveryError::InvalidPolicy);
        }
        Ok(Self { threshold, total_factors })
    }
}

#[derive(Debug)]
pub struct RecoverySession {
    policy: RecoveryPolicy,
    approvals: BTreeSet<String>,
}

impl RecoverySession {
    pub fn new(policy: RecoveryPolicy) -> Self {
        Self { policy, approvals: BTreeSet::new() }
    }

    pub fn approve(&mut self, factor_id: impl Into<String>) -> Result<(), RecoveryError> {
        if !self.approvals.insert(factor_id.into()) {
            return Err(RecoveryError::DuplicateFactor);
        }
        Ok(())
    }

    pub fn ready(&self) -> bool {
        self.approvals.len() >= self.policy.threshold
    }

    pub fn authorize(&self) -> Result<(), RecoveryError> {
        if self.ready() {
            Ok(())
        } else {
            Err(RecoveryError::ThresholdNotReached)
        }
    }
}
