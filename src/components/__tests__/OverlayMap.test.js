/**
 *
 * Tests for OverlayMap
 *
 * Components
 */

import { shallowMount } from '@vue/test-utils';
import OverlayMap from '../OverlayMap';

const mountWithOptions = () =>
  shallowMount(OverlayMap, {
    mocks: {
      $log: global.console,
      $t: (key) => key,
    },
  });

describe('OverlayMap', () => {
  jest.mock('leaflet');
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.element).toMatchSnapshot();
  });
});
