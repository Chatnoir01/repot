use secure_core::*;
use secure_core::rate_limit::FailureTracker;

fn ev(counter: u64, source: Option<EvidenceSource>) -> Evidence {
    Evidence {
        nonce: [counter as u8; 32],
        counter,
        policy_version: 1,
        auth_source: source,
        recovery_source: None,
    }
}

fn req(operation: Operation, state: SecurityState, evidence: Evidence) -> Request {
    Request {
        operation,
        state,
        key_id: Some("test-key".into()),
        caller: "invariant-test".into(),
        context: "test".into(),
        evidence,
    }
}

#[test]
fn i001_lockdown_denies_identity_signature() {
    let mut engine = PolicyEngine::new(1);
    let d = engine
        .authorize(req(
            Operation::IdentitySign,
            SecurityState::Lockdown,
            ev(1, Some(EvidenceSource::HardwareUserAuth)),
        ))
        .unwrap();
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
    engine
        .authorize(req(
            Operation::Encrypt,
            SecurityState::Normal,
            ev(2, None),
        ))
        .unwrap();
    let r = engine.authorize(req(
        Operation::Encrypt,
        SecurityState::Normal,
        ev(1, None),
    ));
    assert_eq!(r, Err(EvidenceError::StaleCounter));
}

#[test]
fn i004_policy_rollback_is_rejected() {
    let mut engine = PolicyEngine::new(2);
    let mut evidence = ev(1, Some(EvidenceSource::HardwareUserAuth));
    evidence.policy_version = 1;
    let r = engine.authorize(req(
        Operation::Encrypt,
        SecurityState::Normal,
        evidence,
    ));
    assert_eq!(r, Err(EvidenceError::PolicyRollback));
}

#[test]
fn i006_pin_failures_do_not_trigger_irreversible_destruction() {
    let mut tracker = FailureTracker::default();
    for _ in 0..100 {
        tracker.record_failure();
    }
    assert_eq!(tracker.recommended_state(), SecurityState::Quarantine);
}

#[test]
fn i008_export_is_denied_in_every_state() {
    for (i, state) in [
        SecurityState::Normal,
        SecurityState::Elevated,
        SecurityState::Restricted,
        SecurityState::Quarantine,
        SecurityState::Lockdown,
    ]
    .into_iter()
    .enumerate()
    {
        let mut engine = PolicyEngine::new(1);
        let d = engine
            .authorize(req(
                Operation::Export,
                state,
                ev((i + 1) as u64, Some(EvidenceSource::HardwareUserAuth)),
            ))
            .unwrap();
        assert_eq!(d, Decision::Deny);
    }
}
