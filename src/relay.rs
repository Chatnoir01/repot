use std::collections::{HashMap, VecDeque};
use thiserror::Error;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RelayEnvelope {
    pub message_id: String,
    pub sender_device: String,
    pub recipient_device: String,
    pub ciphertext: Vec<u8>,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum RelayError {
    #[error("relay envelope exceeds size limit")]
    TooLarge,
    #[error("duplicate message identifier")]
    DuplicateMessage,
}

pub struct RelayStore {
    max_ciphertext_bytes: usize,
    queues: HashMap<String, VecDeque<RelayEnvelope>>,
    ids: std::collections::HashSet<String>,
}

impl RelayStore {
    pub fn new(max_ciphertext_bytes: usize) -> Self {
        Self {
            max_ciphertext_bytes,
            queues: HashMap::new(),
            ids: std::collections::HashSet::new(),
        }
    }

    pub fn push(&mut self, envelope: RelayEnvelope) -> Result<(), RelayError> {
        if envelope.ciphertext.len() > self.max_ciphertext_bytes {
            return Err(RelayError::TooLarge);
        }
        if !self.ids.insert(envelope.message_id.clone()) {
            return Err(RelayError::DuplicateMessage);
        }
        self.queues
            .entry(envelope.recipient_device.clone())
            .or_default()
            .push_back(envelope);
        Ok(())
    }

    pub fn pop(&mut self, recipient_device: &str) -> Option<RelayEnvelope> {
        self.queues.get_mut(recipient_device)?.pop_front()
    }
}
