/**
 *
 * Tests for BaseIcon
 *
 * Components
 */

import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseIcon from '@/components/BaseIcon.vue';

describe('BaseIcon', () => {
  it('should not log any errors', () => {
    const spy = vi.spyOn(global.console, 'error');
    mount(BaseIcon, {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        'base-button': true,
      },
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render correctly and match snapshot', () => {
    const testProps = {
      mocks: {
        $t: (key: string) => key,
      },
      props: { size: 'small', type: 'dashboard' },
    };
    const wrapper = mount(BaseIcon, testProps);
    expect(wrapper.element).toMatchSnapshot();
  });
});
