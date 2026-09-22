#![no_main]

use libfuzzer_sys::fuzz_target;
use secure_core::keys::{KeyDescriptor, KeyOrigin, KeyPurpose, KeyStatus};
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

    let mut core = SecureCore::new(1);
    let _ = core.keys_mut().register(KeyDescriptor {
        id: "fuzz".into(),
        purpose: KeyPurpose::Authorization,
        origin: KeyOrigin::Software,
        status: KeyStatus::Active,
        exportable: false,
        algorithm: "robustness-only".into(),
    });

    let _ = core.authorize_external(ExternalRequest {
        operation: operations[(data[1] as usize) % operations.len()],
        state: states[(data[0] as usize) % states.len()],
        key_id: Some("fuzz".into()),
        caller: "robustness-harness".into(),
        context: "public-boundary".into(),
        nonce: [data[3]; 32],
        counter: u64::from(data[2]).saturating_add(1),
        policy_version: 1,
        auth_ticket: None,
        recovery_ticket: None,
    });
});
