/**
 *
 * Tests for Tag
 *
 * Components
 */

import { mount } from '@vue/test-utils';
import Tag from '../Tag';

describe('Tag', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mount(Tag);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit event on closed', () => {
    const wrapper = mount(Tag, { propsData: { closeable: true } });
    wrapper.vm.onClose();
    expect(wrapper.emitted().closed.length).toBe(1);
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mount(Tag);
    expect(wrapper.element).toMatchSnapshot();
  });
});
