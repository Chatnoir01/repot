use secure_core::keys::{KeyDescriptor, KeyOrigin, KeyPurpose, KeyStatus};
use secure_core::*;

const AUTH_KEY: [u8; 32] = [42u8; 32];

fn core() -> SecureCore {
    let mut core = SecureCore::with_ticket_verifier(1, TicketVerifier::new(AUTH_KEY));
    core.keys_mut()
        .register(KeyDescriptor {
            id: "id-key".into(),
            purpose: KeyPurpose::Authorization,
            origin: KeyOrigin::Software,
            status: KeyStatus::Active,
            exportable: false,
            algorithm: "test-only".into(),
        })
        .unwrap();
    core
}

fn request(operation: Operation, state: SecurityState, counter: u64) -> ExternalRequest {
    ExternalRequest {
        operation,
        state,
        key_id: Some("id-key".into()),
        caller: "hostile-host".into(),
        context: "redteam".into(),
        nonce: [counter as u8; 32],
        counter,
        policy_version: 1,
        auth_ticket: None,
        recovery_ticket: None,
    }
}

fn auth_ticket(request: &ExternalRequest, source: EvidenceSource) -> AuthTicket {
    TicketIssuer::new(AUTH_KEY)
        .issue(TicketClaims {
            kind: TicketKind::StrongAuth,
            source,
            operation: request.operation,
            key_id: request.key_id.clone(),
            caller: request.caller.clone(),
            context: request.context.clone(),
            nonce: request.nonce,
            counter: request.counter,
            policy_version: request.policy_version,
        })
        .unwrap()
}

#[test]
fn hostile_host_without_ticket_cannot_get_identity_signature() {
    let mut core = core();
    let d = core
        .authorize_external(request(
            Operation::IdentitySign,
            SecurityState::Normal,
            1,
        ))
        .unwrap();
    assert_eq!(d, Decision::ReauthRequired);
}

#[test]
fn valid_operation_bound_hardware_auth_ticket_allows_normal_signature() {
    let mut core = core();
    let mut r = request(Operation::IdentitySign, SecurityState::Normal, 1);
    r.auth_ticket = Some(auth_ticket(&r, EvidenceSource::HardwareUserAuth));
    assert_eq!(core.authorize_external(r).unwrap(), Decision::Allow);
}

#[test]
fn modified_ticket_is_rejected() {
    let mut core = core();
    let mut r = request(Operation::IdentitySign, SecurityState::Normal, 1);
    let mut ticket = auth_ticket(&r, EvidenceSource::HardwareUserAuth);
    ticket.claims.context = "forged-context".into();
    r.auth_ticket = Some(ticket);
    assert_eq!(
        core.authorize_external(r),
        Err(CoreError::Ticket(TicketError::InvalidMac))
    );
}

#[test]
fn ticket_for_one_request_cannot_be_rebound_to_another_operation() {
    let mut core = core();
    let sign = request(Operation::IdentitySign, SecurityState::Normal, 1);
    let ticket = auth_ticket(&sign, EvidenceSource::HardwareUserAuth);

    let mut decrypt = request(Operation::Decrypt, SecurityState::Normal, 1);
    decrypt.auth_ticket = Some(ticket);
    assert_eq!(
        core.authorize_external(decrypt),
        Err(CoreError::TicketContextMismatch)
    );
}

#[test]
fn quarantine_blocks_signature_even_with_valid_ticket() {
    let mut core = core();
    let mut r = request(Operation::IdentitySign, SecurityState::Quarantine, 1);
    r.auth_ticket = Some(auth_ticket(&r, EvidenceSource::HardwareUserAuth));
    assert_eq!(core.authorize_external(r).unwrap(), Decision::Deny);
}

#[test]
fn replayed_nonce_is_rejected() {
    let mut core = core();
    let first = request(Operation::Encrypt, SecurityState::Normal, 1);
    core.authorize_external(first).unwrap();

    let mut second = request(Operation::Encrypt, SecurityState::Normal, 2);
    second.nonce = [1u8; 32];
    assert_eq!(
        core.authorize_external(second),
        Err(CoreError::Evidence(EvidenceError::Replay))
    );
}

#[test]
fn future_policy_version_is_rejected() {
    let mut core = core();
    let mut r = request(Operation::Encrypt, SecurityState::Normal, 1);
    r.policy_version = 2;
    assert_eq!(
        core.authorize_external(r),
        Err(CoreError::Evidence(EvidenceError::UnknownPolicyVersion))
    );
}
