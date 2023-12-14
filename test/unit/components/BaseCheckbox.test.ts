/**
 *
 * Tests for BaseCheckbox
 *
 * Components
 */

import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseCheckbox from '@/components/BaseCheckbox.vue';

describe('BaseCheckbox', () => {
  it('should not log any errors', () => {
    const spy = vi.spyOn(global.console, 'error');
    mount(BaseCheckbox);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mount(BaseCheckbox);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should match snapshot with props', () => {
    const wrapper = mount(BaseCheckbox, {
      props: { value: true },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
