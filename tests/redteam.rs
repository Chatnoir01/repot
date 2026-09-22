use secure_core::*;

fn evidence(counter: u64, source: Option<EvidenceSource>) -> Evidence {
    Evidence {
        nonce: [counter as u8; 32],
        counter,
        policy_version: 1,
        auth_source: source,
        recovery_source: None,
    }
}

fn request(operation: Operation, state: SecurityState, counter: u64, source: Option<EvidenceSource>) -> Request {
    Request {
        operation,
        state,
        key_id: Some("unused".into()),
        caller: "hostile-host".into(),
        context: "redteam".into(),
        evidence: evidence(counter, source),
    }
}

#[test]
fn hostile_host_cannot_fake_strong_auth_by_declaring_host_source() {
    let mut engine = PolicyEngine::new(1);
    let d = engine.authorize(request(
        Operation::IdentitySign,
        SecurityState::Normal,
        1,
        Some(EvidenceSource::Host),
    )).unwrap();
    assert_eq!(d, Decision::ReauthRequired);
}

#[test]
fn quarantine_blocks_signature_even_with_hardware_user_auth() {
    let mut engine = PolicyEngine::new(1);
    let d = engine.authorize(request(
        Operation::IdentitySign,
        SecurityState::Quarantine,
        1,
        Some(EvidenceSource::HardwareUserAuth),
    )).unwrap();
    assert_eq!(d, Decision::Deny);
}

#[test]
fn replayed_nonce_is_rejected() {
    let mut engine = PolicyEngine::new(1);
    let first = request(Operation::Encrypt, SecurityState::Normal, 1, None);
    engine.authorize(first).unwrap();

    let second = Request {
        operation: Operation::Encrypt,
        state: SecurityState::Normal,
        key_id: Some("unused".into()),
        caller: "hostile-host".into(),
        context: "replay".into(),
        evidence: Evidence {
            nonce: [1u8; 32],
            counter: 2,
            policy_version: 1,
            auth_source: None,
            recovery_source: None,
        },
    };
    assert_eq!(engine.authorize(second), Err(EvidenceError::Replay));
}

#[test]
fn future_policy_version_is_rejected() {
    let mut engine = PolicyEngine::new(1);
    let mut r = request(Operation::Encrypt, SecurityState::Normal, 1, None);
    r.evidence.policy_version = 2;
    assert_eq!(engine.authorize(r), Err(EvidenceError::UnknownPolicyVersion));
}
