/**
 *
 * Tests for Table
 *
 * Components
 */

import { shallowMount } from '@vue/test-utils';
import BaseCheckbox from '../BaseCheckbox';
import Table from '../Table';

const TestColumns = [
  {
    title: 'One',
    dataIndex: 'one_index',
    key: 'one_index',
    width: '0.5fr',
  },
  {
    title: 'Two',
    dataIndex: 'two_index',
    key: 'two_index',
    width: '1.5fr',
  },
];

const TestData = [{ id: 'one_index' }, { id: 'two_index' }];

const mountWithOptions = ({ props } = {}) =>
  shallowMount(Table, {
    stubs: {
      'base-checkbox': BaseCheckbox,
      'base-select': "<input type='select'>",
      'base-button': '<button />',
    },
    propsData: {
      columns: TestColumns,
      data: TestData,
      ...props,
    },
  });

describe('Table', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should update selected items', () => {
    const wrapper = mountWithOptions();
    wrapper.vm.setChecked({ id: 'one_index' }, true);
    expect(wrapper.vm.selectedItems).toMatchSnapshot();
    wrapper.vm.setChecked({ id: 'one_index' });
    wrapper.vm.setChecked({ id: 'one_index' }, false);
    expect(wrapper.vm.selectedItems).toMatchSnapshot();
  });

  it('should select all items', () => {
    const wrapper = mountWithOptions();
    wrapper.vm.setAllChecked(true);
    expect(wrapper.vm.selectedItems).toEqual(
      new Set(['one_index', 'two_index']),
    );
    wrapper.vm.setAllChecked();
    expect(wrapper.vm.selectedItems).toEqual(new Set([]));
  });

  it('should render correctly with selection and pagination', () => {
    const wrapper = mountWithOptions({
      props: {
        enablePagination: true,
        enableSelection: true,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should emit clicked item', () => {
    const wrapper = mountWithOptions();
    wrapper.vm.rowClick({ id: 1 });
    expect(wrapper.emitted().rowClick[0][0]).toEqual({ id: 1 });
  });

  it('should handle page change', () => {
    const wrapper = mountWithOptions({
      props: {
        // TODO: fix prop name typo
        enablePagniation: true,
        enableSelection: true,
        pagination: {
          pageSize: 5,
          page: 1,
          current: 1,
        },
      },
    });
    expect(wrapper.vm.pagination.current).toBe(1);
    wrapper.vm.pageChangeHandle('next');
    expect(wrapper.vm.pagination).toMatchSnapshot();
    wrapper.vm.pageChangeHandle('previous');
    expect(wrapper.vm.pagination).toMatchSnapshot();
    wrapper.vm.pageChangeHandle(10);
    expect(wrapper.vm.pagination).toMatchSnapshot();
  });

  it('should handle page size change', () => {
    const wrapper = mountWithOptions({
      props: {
        // TODO: fix prop name typo
        enablePagniation: true,
        enableSelection: true,
        pagination: {
          pageSize: 5,
          page: 1,
          current: 1,
        },
      },
    });
    wrapper.vm.onSelectPageSize(10);
    expect(wrapper.vm.pagination).toMatchSnapshot();
    wrapper.vm.onSelectPageSize(1000);
    expect(wrapper.vm.pagination).toMatchSnapshot();
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.element).toMatchSnapshot();
  });
});
