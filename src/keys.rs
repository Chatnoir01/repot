use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum KeyPurpose {
    Authorization,
    StorageKek,
    StorageDek,
    OpenPgpIdentity,
    OpenPgpEncryption,
    MessagingIdentity,
    Handshake,
    Ratchet,
    Recovery,
    Revocation,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum KeyOrigin {
    Software,
    HardwareBacked,
    WrappedByHardware,
    RemoteRecoveryShare,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum KeyStatus {
    Active,
    Rotating,
    Revoked,
    Destroyed,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KeyDescriptor {
    pub id: String,
    pub purpose: KeyPurpose,
    pub origin: KeyOrigin,
    pub status: KeyStatus,
    pub exportable: bool,
    pub algorithm: String,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum KeyRegistryError {
    #[error("duplicate key identifier")]
    Duplicate,
    #[error("unknown key")]
    Unknown,
    #[error("revoked or destroyed key cannot be activated")]
    InvalidActivation,
}

#[derive(Debug, Default)]
pub struct KeyRegistry {
    keys: BTreeMap<String, KeyDescriptor>,
}

impl KeyRegistry {
    pub fn register(&mut self, key: KeyDescriptor) -> Result<(), KeyRegistryError> {
        if self.keys.contains_key(&key.id) {
            return Err(KeyRegistryError::Duplicate);
        }
        self.keys.insert(key.id.clone(), key);
        Ok(())
    }

    pub fn get(&self, id: &str) -> Option<&KeyDescriptor> {
        self.keys.get(id)
    }

    pub fn revoke(&mut self, id: &str) -> Result<(), KeyRegistryError> {
        let key = self.keys.get_mut(id).ok_or(KeyRegistryError::Unknown)?;
        key.status = KeyStatus::Revoked;
        Ok(())
    }

    pub fn destroy_metadata(&mut self, id: &str) -> Result<(), KeyRegistryError> {
        let key = self.keys.get_mut(id).ok_or(KeyRegistryError::Unknown)?;
        key.status = KeyStatus::Destroyed;
        Ok(())
    }

    pub fn begin_rotation(&mut self, id: &str) -> Result<(), KeyRegistryError> {
        let key = self.keys.get_mut(id).ok_or(KeyRegistryError::Unknown)?;
        match key.status {
            KeyStatus::Active => {
                key.status = KeyStatus::Rotating;
                Ok(())
            }
            _ => Err(KeyRegistryError::InvalidActivation),
        }
    }

    pub fn descriptors(&self) -> impl Iterator<Item = &KeyDescriptor> {
        self.keys.values()
    }
}
