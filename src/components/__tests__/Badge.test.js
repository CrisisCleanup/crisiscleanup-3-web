/**
 *
 * Tests for Badge
 *
 * Components
 */

import { mount } from '@vue/test-utils';
import Badge from '../Badge';

describe('Badge', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mount(Badge);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mount(Badge);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should match snapshot with props', () => {
    const wrapper = mount(Badge, {
      propsData: { color: 'red', width: '20px', height: '20px' },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
