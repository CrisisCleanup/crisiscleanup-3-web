/**
 * Use Toggle Hook Tests
 */

import useToggle from '../useToggle';

describe('useToggle', () => {
  it('sets defaults correctly', () => {
    const { state } = useToggle();
    expect(state.value).toBe(false);
  });
  it('allows default override', () => {
    const { state } = useToggle({ state: true });
    expect(state.value).toBe(true);
  });
  it('toggles successfully', () => {
    const { state, toggle } = useToggle();
    toggle();
    expect(state.value).toBe(true);
    toggle();
    expect(state.value).toBe(false);
  });
  it('allows toggle override', () => {
    const { state, toggle } = useToggle();
    toggle(false);
    expect(state.value).toBe(false);
  });
});
