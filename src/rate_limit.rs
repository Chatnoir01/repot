use crate::SecurityState;

#[derive(Debug, Clone)]
pub struct FailureTracker {
    failures: u32,
    elevated_at: u32,
    restricted_at: u32,
    quarantine_at: u32,
}

impl Default for FailureTracker {
    fn default() -> Self {
        Self {
            failures: 0,
            elevated_at: 3,
            restricted_at: 6,
            quarantine_at: 10,
        }
    }
}

impl FailureTracker {
    pub fn record_failure(&mut self) -> SecurityState {
        self.failures = self.failures.saturating_add(1);
        self.recommended_state()
    }

    pub fn record_success(&mut self) {
        self.failures = 0;
    }

    pub fn failures(&self) -> u32 {
        self.failures
    }

    pub fn recommended_state(&self) -> SecurityState {
        if self.failures >= self.quarantine_at {
            SecurityState::Quarantine
        } else if self.failures >= self.restricted_at {
            SecurityState::Restricted
        } else if self.failures >= self.elevated_at {
            SecurityState::Elevated
        } else {
            SecurityState::Normal
        }
    }
}
