/**
 *
 * Tests for NavMenu
 *
 * Components/Navigation
 */

import { shallowMount } from '@vue/test-utils';
import NavMenu from '../NavMenu';

const shallowMountWithOptions = () =>
  shallowMount(NavMenu, {
    stubs: ['NavButton', 'router-link'],
    propsData: {
      routes: [
        {
          to: '/mockroute',
          key: 'mockroute',
          icon: 'mock',
          iconSize: 'sm',
        },
      ],
      logoRoute: {
        to: '/mockroute',
        key: 'mockroute',
        icon: 'mock',
        iconSize: 'sm',
      },
    },
  });

describe('NavMenu', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    shallowMountWithOptions();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = shallowMountWithOptions();
    expect(wrapper.element).toMatchSnapshot();
  });
});
