/**
 *
 * Tests for BaseButton
 *
 * Components
 */

import { mount } from '@vue/test-utils';
import BaseButton from '../BaseButton.vue';

const mountWithOptions = (props = {}) =>
  mount(BaseButton, {
    stubs: ['font-awesome-icon', 'ccu-icon'],
    propsData: {
      text: 'button',
      alt: 'alt-text',
      title: 'btntitle',
      type: 'primary',
      icon: 'dashboard',
      suffixIcon: 'dashboard',
      ...props,
    },
  });

describe('BaseButton', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should perform action', async () => {
    expect.assertions(1);
    const mockAction = jest.fn();
    const wrapper = mountWithOptions({ action: mockAction });
    await wrapper.find('button').trigger('click');
    expect(mockAction).toHaveBeenCalled();
  });

  it('should raise error', async () => {
    expect.assertions(1);
    const mockAction = () => {
      throw new Error();
    };
    const wrapper = mountWithOptions({ action: mockAction });
    await wrapper.find('button').trigger('click');
    expect(mockAction).toThrow(Error);
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mountWithOptions({ action: () => true });
    expect(wrapper.element).toMatchSnapshot();
  });
});
