#![no_main]

use libfuzzer_sys::fuzz_target;
use secure_core::transport::decode_request;

fuzz_target!(|data: &[u8]| {
    let _ = decode_request(data);
});
