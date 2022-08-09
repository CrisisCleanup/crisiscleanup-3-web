/**
 *
 * Tests for DragDrop
 *
 * Components
 */

import { shallowMount } from '@vue/test-utils';
import DragDrop from '@/components/DragDrop.vue';
import Table from '../Table.vue';

const mocks = {
  $t: (key) => key,
};

const mountWithOptions = () =>
  shallowMount(DragDrop, {
    stubs: {
      table: Table,
      'form-select': true,
      'base-button': true,
    },
    mocks,
  });

describe('DragDrop', () => {
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
