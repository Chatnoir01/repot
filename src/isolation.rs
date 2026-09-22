use crate::policy::{Decision, Request};
use crate::EvidenceError;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum IsolationAssurance {
    Simulated,
    Experimental,
    HardwareObserved,
}

pub trait IsolatedPolicyBoundary {
    fn assurance(&self) -> IsolationAssurance;
    fn authorize(&mut self, request: Request) -> Result<Decision, EvidenceError>;
}

// Actual AVF/pKVM transport belongs in a platform adapter and must only report
// HardwareObserved after a device-backed experiment proves the boundary used.
