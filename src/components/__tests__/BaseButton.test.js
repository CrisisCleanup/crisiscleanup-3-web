/**
 *
 * Tests for BaseButton
 *
 * Components
 */

import { mount } from '@vue/test-utils';
import BaseButton from '../BaseButton';

const mountWithOptions = ({ props } = {}) =>
  mount(BaseButton, {
    stubs: ['font-awesome-icon'],
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
    const mockAction = () => true;
    const props = { action: mockAction };
    const wrapper = mountWithOptions(BaseButton, { props });
    wrapper.vm.loading = true;
    await wrapper.vm.performAction();
    expect(wrapper.vm.loading).toBe(false);
  });

  it('should perform action', async () => {
    expect.assertions(1);
    const mockAction = () => {
      throw new Error();
    };
    const props = { action: mockAction };
    const wrapper = mountWithOptions(BaseButton, { props });
    wrapper.vm.loading = true;
    await wrapper.vm.performAction();
    expect(wrapper.vm.loading).toBe(false);
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.element).toMatchSnapshot();
  });
});
