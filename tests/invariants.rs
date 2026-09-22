use secure_core::*;

fn ev(counter: u64, authenticated: bool) -> Evidence {
    Evidence {
        nonce: [counter as u8; 32],
        counter,
        policy_version: 1,
        authenticated,
        recovery_authorized: false,
    }
}

#[test]
fn i001_lockdown_denies_identity_signature() {
    let mut engine = PolicyEngine::new(1);
    let d = engine.authorize(Request {
        operation: Operation::IdentitySign,
        state: SecurityState::Lockdown,
        evidence: ev(1, true),
    }).unwrap();
    assert_eq!(d, Decision::Deny);
}

#[test]
fn i002_quarantine_cannot_deescalate_from_host_alone() {
    assert_eq!(
        SecurityState::Quarantine.transition(SecurityState::Normal, false),
        Err(TransitionError::UnauthorizedDeescalation)
    );
}

#[test]
fn i003_stale_counter_is_rejected() {
    let mut engine = PolicyEngine::new(1);
    engine.authorize(Request {
        operation: Operation::Encrypt,
        state: SecurityState::Normal,
        evidence: ev(2, true),
    }).unwrap();
    let r = engine.authorize(Request {
        operation: Operation::Encrypt,
        state: SecurityState::Normal,
        evidence: ev(1, true),
    });
    assert_eq!(r, Err(EvidenceError::StaleCounter));
}

#[test]
fn i004_policy_rollback_is_rejected() {
    let mut engine = PolicyEngine::new(2);
    let mut evidence = ev(1, true);
    evidence.policy_version = 1;
    let r = engine.authorize(Request {
        operation: Operation::Encrypt,
        state: SecurityState::Normal,
        evidence,
    });
    assert_eq!(r, Err(EvidenceError::PolicyRollback));
}

#[test]
fn i006_pin_failures_do_not_exist_as_a_destructive_transition() {
    let state = SecurityState::Restricted;
    assert_eq!(state.transition(SecurityState::Lockdown, false).unwrap(), SecurityState::Lockdown);
}

#[test]
fn export_is_denied_in_every_state() {
    for (i, state) in [
        SecurityState::Normal, SecurityState::Elevated, SecurityState::Restricted,
        SecurityState::Quarantine, SecurityState::Lockdown
    ].into_iter().enumerate() {
        let mut engine = PolicyEngine::new(1);
        let d = engine.authorize(Request {
            operation: Operation::Export,
            state,
            evidence: ev((i + 1) as u64, true),
        }).unwrap();
        assert_eq!(d, Decision::Deny);
    }
}
