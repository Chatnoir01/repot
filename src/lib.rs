#![forbid(unsafe_code)]

pub mod api;
pub mod attestation;
pub mod audit;
pub mod evidence;
pub mod isolation;
pub mod keys;
pub mod messaging;
pub mod openpgp;
pub mod platform;
pub mod policy;
pub mod rate_limit;
pub mod receipt;
pub mod recovery;
pub mod relay;
pub mod state;
pub mod storage;
pub mod transparency;

pub use api::{CoreError, SecureCore};
pub use evidence::{Evidence, EvidenceError, EvidenceSource};
pub use policy::{Decision, Operation, PolicyEngine, Request};
pub use state::{SecurityState, TransitionError};
