use chacha20poly1305::{
    aead::{Aead, KeyInit, Payload},
    XChaCha20Poly1305, XNonce,
};
use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum StorageError {
    #[error("authenticated encryption failed")]
    Encrypt,
    #[error("authenticated decryption failed")]
    Decrypt,
}

pub fn seal(
    key: &[u8; 32],
    nonce: &[u8; 24],
    plaintext: &[u8],
    associated_data: &[u8],
) -> Result<Vec<u8>, StorageError> {
    let cipher = XChaCha20Poly1305::new(key.into());
    cipher
        .encrypt(
            XNonce::from_slice(nonce),
            Payload {
                msg: plaintext,
                aad: associated_data,
            },
        )
        .map_err(|_| StorageError::Encrypt)
}

pub fn open(
    key: &[u8; 32],
    nonce: &[u8; 24],
    ciphertext: &[u8],
    associated_data: &[u8],
) -> Result<Vec<u8>, StorageError> {
    let cipher = XChaCha20Poly1305::new(key.into());
    cipher
        .decrypt(
            XNonce::from_slice(nonce),
            Payload {
                msg: ciphertext,
                aad: associated_data,
            },
        )
        .map_err(|_| StorageError::Decrypt)
}
