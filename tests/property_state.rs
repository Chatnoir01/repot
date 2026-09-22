use proptest::prelude::*;
use secure_core::*;

proptest! {
    #[test]
    fn deescalation_requires_independent_recovery(
        from in 1u8..5,
        to in 0u8..4
    ) {
        let states = [
            SecurityState::Normal,
            SecurityState::Elevated,
            SecurityState::Restricted,
            SecurityState::Quarantine,
            SecurityState::Lockdown,
        ];
        let from_state = states[from as usize];
        let to_state = states[to as usize];
        if to_state < from_state {
            prop_assert_eq!(
                from_state.transition(to_state, false),
                Err(TransitionError::UnauthorizedDeescalation)
            );
        }
    }
}
