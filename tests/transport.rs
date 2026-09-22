use secure_core::transport::{decode_request, encode_request, TransportError, MAX_PAYLOAD_BYTES};
use secure_core::{ExternalRequest, Operation, SecurityState};

fn request() -> ExternalRequest {
    ExternalRequest {
        operation: Operation::Encrypt,
        state: SecurityState::Normal,
        key_id: Some("transport-key".into()),
        caller: "host".into(),
        context: "ipc".into(),
        nonce: [7u8; 32],
        counter: 1,
        policy_version: 1,
        auth_ticket: None,
        recovery_ticket: None,
    }
}

#[test]
fn transport_round_trip_preserves_request() {
    let original = request();
    let frame = encode_request(&original).unwrap();
    let decoded = decode_request(&frame).unwrap();
    assert_eq!(decoded, original);
}

#[test]
fn short_frame_is_rejected() {
    assert_eq!(
        decode_request(&[0, 0, 0]),
        Err(TransportError::FrameTooShort)
    );
}

#[test]
fn declared_length_mismatch_is_rejected() {
    let mut frame = encode_request(&request()).unwrap();
    frame.push(0);
    assert_eq!(decode_request(&frame), Err(TransportError::LengthMismatch));
}

#[test]
fn oversized_declared_payload_is_rejected_before_deserialization() {
    let declared = u32::try_from(MAX_PAYLOAD_BYTES + 1).unwrap();
    let frame = declared.to_be_bytes();
    assert_eq!(decode_request(&frame), Err(TransportError::PayloadTooLarge));
}

#[test]
fn malformed_json_is_rejected() {
    let payload = b"{not-json";
    let mut frame = Vec::new();
    frame.extend_from_slice(&(payload.len() as u32).to_be_bytes());
    frame.extend_from_slice(payload);
    assert_eq!(
        decode_request(&frame),
        Err(TransportError::MalformedPayload)
    );
}
