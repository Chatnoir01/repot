use secure_core::attestation::*;
use secure_core::keys::*;
use secure_core::rate_limit::FailureTracker;
use secure_core::recovery::*;
use secure_core::relay::*;
use secure_core::storage;
use secure_core::transparency::*;
use secure_core::*;

#[test]
fn storage_round_trip_and_tamper_rejection() {
    let key = [7u8; 32];
    let nonce = [9u8; 24];
    let aad = b"vault:v1";
    let ciphertext = storage::seal(&key, &nonce, b"secret", aad).unwrap();
    assert_eq!(
        storage::open(&key, &nonce, &ciphertext, aad).unwrap(),
        b"secret"
    );

    let mut tampered = ciphertext;
    tampered[0] ^= 1;
    assert!(storage::open(&key, &nonce, &tampered, aad).is_err());
}

#[test]
fn revoked_key_cannot_be_used_by_secure_core() {
    let mut core = SecureCore::new(1);
    core.keys_mut()
        .register(KeyDescriptor {
            id: "id-1".into(),
            purpose: KeyPurpose::OpenPgpIdentity,
            origin: KeyOrigin::Software,
            status: KeyStatus::Active,
            exportable: false,
            algorithm: "provider-defined".into(),
        })
        .unwrap();
    core.keys_mut().revoke("id-1").unwrap();

    let result = core.authorize_external(ExternalRequest {
        operation: Operation::IdentitySign,
        state: SecurityState::Normal,
        key_id: Some("id-1".into()),
        caller: "test".into(),
        context: "unit".into(),
        nonce: [1u8; 32],
        counter: 1,
        policy_version: 1,
        auth_ticket: None,
        recovery_ticket: None,
    });
    assert_eq!(result, Err(CoreError::InactiveKey));
}

#[test]
fn relay_is_ciphertext_only_and_size_bounded() {
    let mut relay = RelayStore::new(4);
    assert_eq!(
        relay.push(RelayEnvelope {
            message_id: "m1".into(),
            sender_device: "a".into(),
            recipient_device: "b".into(),
            ciphertext: vec![1, 2, 3, 4, 5],
        }),
        Err(RelayError::TooLarge)
    );
}

#[test]
fn transparency_detects_split_view_same_size() {
    let a = Checkpoint {
        size: 4,
        root_hash: "aa".into(),
    };
    let b = Checkpoint {
        size: 4,
        root_hash: "bb".into(),
    };
    assert!(detect_equivocation(&a, &b));
}

#[test]
fn recovery_requires_distinct_factors() {
    let mut session = RecoverySession::new(RecoveryPolicy::new(2, 3).unwrap());
    session.approve("factor-a").unwrap();
    assert!(!session.ready());
    assert_eq!(
        session.approve("factor-a"),
        Err(RecoveryError::DuplicateFactor)
    );
    session.approve("factor-b").unwrap();
    assert!(session.authorize().is_ok());
}

#[test]
fn pin_failures_escalate_without_destructive_state() {
    let mut tracker = FailureTracker::default();
    for _ in 0..10 {
        tracker.record_failure();
    }
    assert_eq!(tracker.recommended_state(), SecurityState::Quarantine);
    tracker.record_success();
    assert_eq!(tracker.recommended_state(), SecurityState::Normal);
}

#[test]
fn attestation_binding_rejects_wrong_challenge() {
    let evidence = AttestationEvidence {
        challenge: b"actual".to_vec(),
        app_identity_digest: vec![1; 32],
        boot_state: VerifiedBootState::Verified,
        hardware_backed: true,
        security_level: "observed".into(),
    };
    assert_eq!(
        validate_binding(&evidence, b"wrong", true, true),
        Err(AttestationError::ChallengeMismatch)
    );
}
