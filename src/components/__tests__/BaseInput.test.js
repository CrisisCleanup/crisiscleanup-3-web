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

  it('should render correctly and match snapshot with label', () => {
    const testProps = {
      propsData: {
        size: 'large',
        topLabel: 'Top Label',
      },
    };
    const wrapper = mount(BaseInput, testProps);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render correctly and match snapshot when required and not provided', () => {
    const testProps = {
      propsData: {
        size: 'large',
        required: true,
      },
    };
    const wrapper = mount(BaseInput, testProps);
    expect(wrapper.element).toMatchSnapshot();
    wrapper.vm.update({
      target: {
        value: '',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
    expect(wrapper.vm.isInvalid).toBe(true);
  });

  it('should render correctly and match snapshot when required and provided', () => {
    const testProps = {
      propsData: {
        size: 'large',
        required: true,
        value: 'Test',
      },
    };
    const wrapper = mount(BaseInput, testProps);
    expect(wrapper.element).toMatchSnapshot();
    wrapper.vm.update({
      target: {
        value: 'Test',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
    expect(wrapper.vm.isInvalid).toBe(false);
  });
});
