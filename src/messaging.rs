use thiserror::Error;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProtocolDescriptor {
    pub name: String,
    pub version: String,
    pub forward_secrecy: bool,
    pub post_compromise_security: bool,
    pub post_quantum_component: bool,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum MessagingError {
    #[error("messaging provider unavailable")]
    ProviderUnavailable,
    #[error("session operation rejected")]
    Rejected,
}

pub trait MessagingProvider {
    fn descriptor(&self) -> ProtocolDescriptor;
    fn create_session(&mut self, peer_device: &str) -> Result<String, MessagingError>;
    fn encrypt(&mut self, session_id: &str, plaintext: &[u8]) -> Result<Vec<u8>, MessagingError>;
    fn decrypt(&mut self, session_id: &str, ciphertext: &[u8]) -> Result<Vec<u8>, MessagingError>;
}

// Long-term OpenPGP identity keys are deliberately not exposed through this trait.
