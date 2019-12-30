/**
 *
 * Tests for BaseInput
 *
 * Components
 */

import { mount } from '@vue/test-utils';
import BaseInput from '../BaseInput';

describe('BaseInput', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mount(BaseInput);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit value on input', () => {
    const wrapper = mount(BaseInput);
    const el = wrapper.find('input');
    el.setValue('new value');
    expect(wrapper.emitted().input).toMatchSnapshot();
  });

  it('should emit value on change', () => {
    const wrapper = mount(BaseInput);
    const el = wrapper.find('input');
    el.trigger('change');
    el.trigger('change');
    expect(wrapper.emitted().change.length).toBe(2);
  });

  it('should render correctly and match snapshot', () => {
    const testProps = {
      propsData: {
        size: 'large',
      },
    };
    const wrapper = mount(BaseInput, testProps);
    expect(wrapper.element).toMatchSnapshot();
  });
});
