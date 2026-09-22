use serde::{Deserialize, Serialize};
use sha3::{Digest, Sha3_512};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TransparencyEntry {
    pub subject: String,
    pub device_id: String,
    pub key_fingerprint: String,
    pub sequence: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Checkpoint {
    pub size: u64,
    pub root_hash: String,
}

#[derive(Debug)]
pub struct TransparencyLog {
    entries: Vec<TransparencyEntry>,
    root: [u8; 64],
}

impl Default for TransparencyLog {
    fn default() -> Self {
        Self {
            entries: Vec::new(),
            root: [0u8; 64],
        }
    }
}

impl TransparencyLog {
    pub fn append(&mut self, entry: TransparencyEntry) -> Checkpoint {
        let mut hasher = Sha3_512::new();
        hasher.update(self.root);
        hasher.update(entry.subject.as_bytes());
        hasher.update([0]);
        hasher.update(entry.device_id.as_bytes());
        hasher.update([0]);
        hasher.update(entry.key_fingerprint.as_bytes());
        hasher.update(entry.sequence.to_be_bytes());
        self.root.copy_from_slice(&hasher.finalize());
        self.entries.push(entry);
        self.checkpoint()
    }

    pub fn checkpoint(&self) -> Checkpoint {
        Checkpoint {
            size: self.entries.len() as u64,
            root_hash: hex::encode(self.root),
        }
    }

    pub fn entries(&self) -> &[TransparencyEntry] {
        &self.entries
    }
}

pub fn detect_equivocation(a: &Checkpoint, b: &Checkpoint) -> bool {
    a.size == b.size && a.root_hash != b.root_hash
}
