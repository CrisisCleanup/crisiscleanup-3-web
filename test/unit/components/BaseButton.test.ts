import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import BaseButton from '@/components/BaseButton.vue';

const mountWithOptions = (extraProps = {}) =>
  mount(BaseButton, {
    props: {
      text: 'button',
      alt: 'alt-text',
      title: 'btntitle',
      type: 'primary',
      icon: 'dashboard',
      suffixIcon: 'dashboard',
      ...extraProps,
    },
  });
describe('BaseButton', () => {
  it('should not log any errors', () => {
    const spy = vi.spyOn(global.console, 'error');
    mountWithOptions();
    expect(spy).not.toHaveBeenCalled();
  });

  it('click action works properly', async () => {
    expect.assertions(1);
    const mockAction = vi.fn();

    const wrapper = mountWithOptions({ action: mockAction });
    await wrapper.find('button').trigger('click');
    await flushPromises();
    expect(mockAction).toHaveBeenCalled();
  });

  it('should raise error', async () => {
    expect.assertions(1);
    const mockAction = () => {
      throw new Error('Exception!');
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
