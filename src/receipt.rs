use serde::{Deserialize, Serialize};
use sha3::{Digest, Sha3_512};
use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Receipt {
    pub timestamp_utc: String,
    pub commit: String,
    pub environment: String,
    pub test_suite: String,
    pub result: String,
    pub artifact_hashes_sha3_512: BTreeMap<String, String>,
    pub invariants: Vec<String>,
}

pub fn sha3_512_hex(bytes: &[u8]) -> String {
    hex::encode(Sha3_512::digest(bytes))
}
