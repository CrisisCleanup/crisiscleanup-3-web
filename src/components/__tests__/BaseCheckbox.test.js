/**
 *
 * Tests for BaseCheckbox
 *
 * Components
 */

import { mount } from '@vue/test-utils';
import BaseCheckbox from '../BaseCheckbox';

describe('BaseCheckbox', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mount(BaseCheckbox);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mount(BaseCheckbox);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should match snapshot with props', () => {
    const wrapper = mount(BaseCheckbox, {
      propsData: { value: true },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
