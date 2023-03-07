/**
 *
 * Tests for BaseInput
 *
 * Components
 */

import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseInput from '@/components/BaseInput.vue';

describe('BaseInput', () => {
  it('should not log any errors', () => {
    const spy = vi.spyOn(global.console, 'error');
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
    expect(wrapper.emitted().change.length).toBe(2);
  });

  it('should render correctly and match snapshot', () => {
    const testProps = {
      props: {
        size: 'large',
      },
    };
    const wrapper = mount(BaseInput, testProps);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render correctly and match snapshot with label', () => {
    const testProps = {
      props: {
        size: 'large',
        topLabel: 'Top Label',
      },
    };
    const wrapper = mount(BaseInput, testProps);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render correctly and match snapshot when required and provided', () => {
    const testProps = {
      props: {
        size: 'large',
        required: true,
        modelValue: 'Test',
      },
    };
    const wrapper = mount(BaseInput, testProps);
    expect(wrapper.element).toMatchSnapshot();
    wrapper.vm.update({
      target: {
        modelValue: 'Test',
      },
    });
    expect(wrapper.element).toMatchSnapshot();
    expect(wrapper.vm.isInvalid).toBe(false);
  });
});
