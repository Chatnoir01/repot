use crate::ExternalRequest;
use thiserror::Error;

const LENGTH_PREFIX_BYTES: usize = 4;
pub const MAX_PAYLOAD_BYTES: usize = 64 * 1024;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum TransportError {
    #[error("transport payload exceeds the configured maximum")]
    PayloadTooLarge,
    #[error("transport frame is shorter than its length prefix")]
    FrameTooShort,
    #[error("transport frame length does not match its declared payload length")]
    LengthMismatch,
    #[error("transport payload is malformed")]
    MalformedPayload,
}

pub fn encode_request(request: &ExternalRequest) -> Result<Vec<u8>, TransportError> {
    let payload = serde_json::to_vec(request).map_err(|_| TransportError::MalformedPayload)?;
    if payload.len() > MAX_PAYLOAD_BYTES {
        return Err(TransportError::PayloadTooLarge);
    }

    let length = u32::try_from(payload.len()).map_err(|_| TransportError::PayloadTooLarge)?;
    let mut frame = Vec::with_capacity(LENGTH_PREFIX_BYTES + payload.len());
    frame.extend_from_slice(&length.to_be_bytes());
    frame.extend_from_slice(&payload);
    Ok(frame)
}

pub fn decode_request(frame: &[u8]) -> Result<ExternalRequest, TransportError> {
    if frame.len() < LENGTH_PREFIX_BYTES {
        return Err(TransportError::FrameTooShort);
    }

    let declared = u32::from_be_bytes(
        frame[..LENGTH_PREFIX_BYTES]
            .try_into()
            .map_err(|_| TransportError::FrameTooShort)?,
    ) as usize;

    if declared > MAX_PAYLOAD_BYTES {
        return Err(TransportError::PayloadTooLarge);
    }
    if frame.len() != LENGTH_PREFIX_BYTES + declared {
        return Err(TransportError::LengthMismatch);
    }

    serde_json::from_slice(&frame[LENGTH_PREFIX_BYTES..])
        .map_err(|_| TransportError::MalformedPayload)
}
