use crate::{EvidenceSource, Operation};
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha3::Sha3_512;
use thiserror::Error;

type HmacSha3_512 = Hmac<Sha3_512>;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TicketKind {
    StrongAuth,
    Recovery,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TicketClaims {
    pub kind: TicketKind,
    pub source: EvidenceSource,
    pub operation: Operation,
    pub key_id: Option<String>,
    pub caller: String,
    pub context: String,
    pub nonce: [u8; 32],
    pub counter: u64,
    pub policy_version: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AuthTicket {
    pub claims: TicketClaims,
    pub mac: Vec<u8>,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum TicketError {
    #[error("ticket source is invalid for its purpose")]
    InvalidSource,
    #[error("ticket MAC is invalid")]
    InvalidMac,
}

pub struct TicketIssuer {
    key: [u8; 32],
}

pub struct TicketVerifier {
    key: [u8; 32],
}

impl TicketIssuer {
    pub fn new(key: [u8; 32]) -> Self {
        Self { key }
    }

    pub fn issue(&self, claims: TicketClaims) -> Result<AuthTicket, TicketError> {
        validate_source(claims.kind, claims.source)?;
        let mut mac = HmacSha3_512::new_from_slice(&self.key).expect("fixed-size HMAC key");
        mac.update(&claims_bytes(&claims));
        Ok(AuthTicket {
            claims,
            mac: mac.finalize().into_bytes().to_vec(),
        })
    }
}

impl TicketVerifier {
    pub fn new(key: [u8; 32]) -> Self {
        Self { key }
    }

    pub fn verify(&self, ticket: &AuthTicket) -> Result<(), TicketError> {
        validate_source(ticket.claims.kind, ticket.claims.source)?;
        let mut mac = HmacSha3_512::new_from_slice(&self.key).expect("fixed-size HMAC key");
        mac.update(&claims_bytes(&ticket.claims));
        mac.verify_slice(&ticket.mac).map_err(|_| TicketError::InvalidMac)
    }
}

fn validate_source(kind: TicketKind, source: EvidenceSource) -> Result<(), TicketError> {
    let valid = match kind {
        TicketKind::StrongAuth => matches!(
            source,
            EvidenceSource::HardwareUserAuth | EvidenceSource::IsolatedCore
        ),
        TicketKind::Recovery => matches!(
            source,
            EvidenceSource::RecoveryQuorum | EvidenceSource::IsolatedCore
        ),
    };
    if valid {
        Ok(())
    } else {
        Err(TicketError::InvalidSource)
    }
}

fn claims_bytes(claims: &TicketClaims) -> Vec<u8> {
    let mut out = Vec::with_capacity(256);
    out.push(match claims.kind {
        TicketKind::StrongAuth => 1,
        TicketKind::Recovery => 2,
    });
    out.push(source_code(claims.source));
    out.push(operation_code(claims.operation));
    push_optional_str(&mut out, claims.key_id.as_deref());
    push_str(&mut out, &claims.caller);
    push_str(&mut out, &claims.context);
    out.extend_from_slice(&claims.nonce);
    out.extend_from_slice(&claims.counter.to_be_bytes());
    out.extend_from_slice(&claims.policy_version.to_be_bytes());
    out
}

fn push_optional_str(out: &mut Vec<u8>, value: Option<&str>) {
    match value {
        Some(value) => {
            out.push(1);
            push_str(out, value);
        }
        None => out.push(0),
    }
}

fn push_str(out: &mut Vec<u8>, value: &str) {
    let bytes = value.as_bytes();
    out.extend_from_slice(&(bytes.len() as u64).to_be_bytes());
    out.extend_from_slice(bytes);
}

fn source_code(source: EvidenceSource) -> u8 {
    match source {
        EvidenceSource::Host => 0,
        EvidenceSource::HardwareUserAuth => 1,
        EvidenceSource::Attestation => 2,
        EvidenceSource::RecoveryQuorum => 3,
        EvidenceSource::IsolatedCore => 4,
    }
}

fn operation_code(operation: Operation) -> u8 {
    match operation {
        Operation::IdentitySign => 1,
        Operation::Decrypt => 2,
        Operation::Encrypt => 3,
        Operation::SessionCreate => 4,
        Operation::SessionContinue => 5,
        Operation::DeviceAdd => 6,
        Operation::Rotate => 7,
        Operation::Revoke => 8,
        Operation::Recover => 9,
        Operation::PolicyModify => 10,
        Operation::Export => 11,
        Operation::Admin => 12,
    }
}
