/**
 *
 * Tests for DragDrop
 *
 * Components
 */

import { shallowMount } from '@vue/test-utils';
import DragDrop from '@/components/DragDrop';
import Table from '../Table';

const mocks = {
  $t: (key) => key,
};

const mountWithOptions = () =>
  shallowMount(DragDrop, {
    stubs: {
      table: Table,
      'form-select': "<input type='select'>",
      'base-button': '<button></button>',
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
