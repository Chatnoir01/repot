use secure_core::keys::{KeyDescriptor, KeyOrigin, KeyPurpose, KeyStatus};
use secure_core::rate_limit::FailureTracker;
use secure_core::*;

fn core(policy_version: u64) -> SecureCore {
    let mut core = SecureCore::new(policy_version);
    core.keys_mut()
        .register(KeyDescriptor {
            id: "test-key".into(),
            purpose: KeyPurpose::Authorization,
            origin: KeyOrigin::Software,
            status: KeyStatus::Active,
            exportable: false,
            algorithm: "test-only".into(),
        })
        .unwrap();
    core
}

fn request(
    operation: Operation,
    state: SecurityState,
    counter: u64,
    policy_version: u64,
) -> ExternalRequest {
    ExternalRequest {
        operation,
        state,
        key_id: Some("test-key".into()),
        caller: "invariant-test".into(),
        context: "test".into(),
        nonce: [counter as u8; 32],
        counter,
        policy_version,
        auth_ticket: None,
        recovery_ticket: None,
    }
}

#[test]
fn i001_lockdown_denies_identity_signature() {
    let mut core = core(1);
    let d = core
        .authorize_external(request(
            Operation::IdentitySign,
            SecurityState::Lockdown,
            1,
            1,
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
    let mut core = core(1);
    core.authorize_external(request(Operation::Encrypt, SecurityState::Normal, 2, 1))
        .unwrap();

    let r = core.authorize_external(request(Operation::Encrypt, SecurityState::Normal, 1, 1));
    assert_eq!(r, Err(CoreError::Evidence(EvidenceError::StaleCounter)));
}

#[test]
fn i004_policy_rollback_is_rejected() {
    let mut core = core(2);
    let r = core.authorize_external(request(Operation::Encrypt, SecurityState::Normal, 1, 1));
    assert_eq!(r, Err(CoreError::Evidence(EvidenceError::PolicyRollback)));
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
        let mut core = core(1);
        let d = core
            .authorize_external(request(Operation::Export, state, (i + 1) as u64, 1))
            .unwrap();
        assert_eq!(d, Decision::Deny);
    }
}
