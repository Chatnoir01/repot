#![forbid(unsafe_code)]

pub mod api;
pub mod attestation;
pub mod audit;
pub mod authority;
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

pub use api::{CoreError, ExternalRequest, SecureCore};
pub use authority::{AuthTicket, TicketClaims, TicketError, TicketIssuer, TicketKind, TicketVerifier};
pub use evidence::{Evidence, EvidenceError, EvidenceSource};
pub use policy::{Decision, Operation, PolicyEngine, Request};
pub use state::{SecurityState, TransitionError};
