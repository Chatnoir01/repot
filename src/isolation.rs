use crate::{CoreError, Decision, ExternalRequest};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum IsolationAssurance {
    Simulated,
    Experimental,
    HardwareObserved,
}

pub trait IsolatedPolicyBoundary {
    fn assurance(&self) -> IsolationAssurance;
    fn authorize_external(&mut self, request: ExternalRequest) -> Result<Decision, CoreError>;
}

// Actual AVF/pKVM transport belongs in a platform adapter and must only report
// HardwareObserved after a device-backed experiment proves the boundary used.
