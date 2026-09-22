#![no_main]

use libfuzzer_sys::fuzz_target;
use secure_core::*;

fuzz_target!(|data: &[u8]| {
    if data.len() < 4 {
        return;
    }

    let states = [
        SecurityState::Normal,
        SecurityState::Elevated,
        SecurityState::Restricted,
        SecurityState::Quarantine,
        SecurityState::Lockdown,
    ];
    let operations = [
        Operation::IdentitySign,
        Operation::Decrypt,
        Operation::Encrypt,
        Operation::SessionCreate,
        Operation::SessionContinue,
        Operation::DeviceAdd,
        Operation::Rotate,
        Operation::Revoke,
        Operation::Recover,
        Operation::PolicyModify,
        Operation::Export,
        Operation::Admin,
    ];

    let source = match data[2] % 5 {
        0 => Some(EvidenceSource::Host),
        1 => Some(EvidenceSource::HardwareUserAuth),
        2 => Some(EvidenceSource::Attestation),
        3 => Some(EvidenceSource::RecoveryQuorum),
        _ => Some(EvidenceSource::IsolatedCore),
    };

    let mut engine = PolicyEngine::new(1);
    let _ = engine.authorize(Request {
        operation: operations[(data[1] as usize) % operations.len()],
        state: states[(data[0] as usize) % states.len()],
        key_id: Some("fuzz".into()),
        caller: "fuzzer".into(),
        context: "malformed-boundary".into(),
        evidence: Evidence {
            nonce: [data[3]; 32],
            counter: 1,
            policy_version: 1,
            auth_source: source,
            recovery_source: None,
        },
    });
});
