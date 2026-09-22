use crate::authority::{AuthTicket, TicketError, TicketKind, TicketVerifier};
use crate::keys::{KeyRegistry, KeyStatus};
use crate::policy::{Decision, Operation, PolicyEngine, Request};
use crate::{Evidence, EvidenceError, EvidenceSource, SecurityState};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ExternalRequest {
    pub operation: Operation,
    pub state: SecurityState,
    pub key_id: Option<String>,
    pub caller: String,
    pub context: String,
    pub nonce: [u8; 32],
    pub counter: u64,
    pub policy_version: u64,
    pub auth_ticket: Option<AuthTicket>,
    pub recovery_ticket: Option<AuthTicket>,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum CoreError {
    #[error(transparent)]
    Evidence(#[from] EvidenceError),
    #[error(transparent)]
    Ticket(#[from] TicketError),
    #[error("ticket verifier is unavailable")]
    AuthorityUnavailable,
    #[error("ticket is not bound to this request")]
    TicketContextMismatch,
    #[error("requested key is unknown")]
    UnknownKey,
    #[error("requested key is not active")]
    InactiveKey,
}

pub struct SecureCore {
    policy: PolicyEngine,
    keys: KeyRegistry,
    verifier: Option<TicketVerifier>,
}

impl SecureCore {
    pub fn new(policy_version: u64) -> Self {
        Self {
            policy: PolicyEngine::new(policy_version),
            keys: KeyRegistry::default(),
            verifier: None,
        }
    }

    pub fn with_ticket_verifier(policy_version: u64, verifier: TicketVerifier) -> Self {
        Self {
            policy: PolicyEngine::new(policy_version),
            keys: KeyRegistry::default(),
            verifier: Some(verifier),
        }
    }

    pub fn keys_mut(&mut self) -> &mut KeyRegistry {
        &mut self.keys
    }

    pub fn authorize_external(&mut self, external: ExternalRequest) -> Result<Decision, CoreError> {
        let auth_source = self.verify_optional_ticket(
            external.auth_ticket.as_ref(),
            &external,
            TicketKind::StrongAuth,
        )?;
        let recovery_source = self.verify_optional_ticket(
            external.recovery_ticket.as_ref(),
            &external,
            TicketKind::Recovery,
        )?;

        let request = Request {
            operation: external.operation,
            state: external.state,
            key_id: external.key_id,
            caller: external.caller,
            context: external.context,
            evidence: Evidence {
                nonce: external.nonce,
                counter: external.counter,
                policy_version: external.policy_version,
                auth_source,
                recovery_source,
            },
        };

        self.authorize_verified(request)
    }

    fn verify_optional_ticket(
        &self,
        ticket: Option<&AuthTicket>,
        request: &ExternalRequest,
        expected_kind: TicketKind,
    ) -> Result<Option<EvidenceSource>, CoreError> {
        let Some(ticket) = ticket else {
            return Ok(None);
        };
        let verifier = self
            .verifier
            .as_ref()
            .ok_or(CoreError::AuthorityUnavailable)?;
        verifier.verify(ticket)?;

        if ticket.claims.kind != expected_kind
            || ticket.claims.operation != request.operation
            || ticket.claims.key_id != request.key_id
            || ticket.claims.caller != request.caller
            || ticket.claims.context != request.context
            || ticket.claims.nonce != request.nonce
            || ticket.claims.counter != request.counter
            || ticket.claims.policy_version != request.policy_version
        {
            return Err(CoreError::TicketContextMismatch);
        }

        Ok(Some(ticket.claims.source))
    }

    fn authorize_verified(&mut self, request: Request) -> Result<Decision, CoreError> {
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
