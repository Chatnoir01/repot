use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum OpenPgpError {
    #[error("provider unavailable")]
    ProviderUnavailable,
    #[error("operation rejected by provider")]
    Rejected,
    #[error("malformed OpenPGP data")]
    Malformed,
}

pub trait OpenPgpProvider {
    fn provider_name(&self) -> &'static str;
    fn sign_detached(&self, key_id: &str, message: &[u8]) -> Result<Vec<u8>, OpenPgpError>;
    fn decrypt(&self, key_id: &str, packet: &[u8]) -> Result<Vec<u8>, OpenPgpError>;
}

// No bespoke OpenPGP primitive is implemented here. A reviewed RFC 9580-capable
// provider must be integrated behind this boundary.
