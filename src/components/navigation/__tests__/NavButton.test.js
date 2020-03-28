/**
 *
 * Tests for NavButton
 *
 * Components/Navigation
 */

import { mount } from '@vue/test-utils';
import NavButton from '../NavButton';

const $route = {
  path: '/mockroute',
  name: 'nav.mockroute',
  params: {
    incident_id: 99,
  },
};

const mocks = {
  $t: key => key,
  $route,
};

const mountWithOptions = ({ props } = {}) =>
  mount(NavButton, {
    stubs: ['ccu-icon', 'router-link'],
    propsData: {
      route: {
        to: '/mockroute',
        key: 'mockroute',
        icon: 'mock',
        iconSize: 'sm',
        ...props,
      },
    },
    mocks,
  });

describe('NavButton', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should have active class if name in route', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.element.classList).toContain('router-link-active');
  });

  it('should not be active if name not in route', () => {
    const wrapper = mountWithOptions({
      props: {
        key: 'randomkey',
      },
    });
    expect(wrapper.element.classList).not.toContain('router-link-active');
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.element).toMatchSnapshot();
  });
});
