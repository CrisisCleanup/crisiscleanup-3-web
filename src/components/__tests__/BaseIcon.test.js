/**
 *
 * Tests for BaseIcon
 *
 * Components
 */

import { mount } from '@vue/test-utils';
import BaseIcon from '../BaseIcon';

describe('BaseIcon', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mount(BaseIcon, {
      mocks: {
        $t: (key) => key,
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
        $t: (key) => key,
      },
      propsData: { size: 'small', type: 'dashboard' },
    };
    const wrapper = mount(BaseIcon, testProps);
    expect(wrapper.element).toMatchSnapshot();
  });
});
