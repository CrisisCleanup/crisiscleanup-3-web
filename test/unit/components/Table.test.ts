import { describe, expect, it, vi } from 'vitest';
import { shallowMount, mount } from '@vue/test-utils';
import Table from '@/components/Table.vue';
import BaseCheckbox from '@/components/BaseCheckbox.vue';

describe('Table component', () => {
  it('renders a table', () => {
    const columns = [
      { key: 'name', title: 'Name' },
      { key: 'age', title: 'Age' },
    ];
    const data = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
    ];
    const wrapper = shallowMount(Table, {
      props: {
        columns,
        data,
      },
    });
    const table = wrapper.find('.js-table');
    expect(table.exists()).toBe(true);
  });

  it('emits rowClick event when row is clicked', async () => {
    const columns = [
      { key: 'name', title: 'Name' },
      { key: 'age', title: 'Age' },
    ];
    const data = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
    ];
    const wrapper = shallowMount(Table, {
      props: {
        columns,
        data,
      },
    });
    const rows = wrapper.findAll('.js-table-row');
    const firstRow = rows[0];
    await firstRow.trigger('click');
    expect(wrapper.emitted().rowClick).toBeTruthy();
    expect(wrapper.emitted().rowClick.length).toBe(1);
    expect(wrapper.emitted().rowClick[0]).toEqual([data[0]]);
  });

  it('displays data in table rows', () => {
    const columns = [
      { key: 'name', title: 'Name' },
      { key: 'age', title: 'Age' },
    ];
    const data = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
    ];
    const wrapper = shallowMount(Table, {
      props: {
        columns,
        data,
      },
    });
    const rows = wrapper.findAll('.js-table-row');
    expect(rows.length).toBe(2);
    expect(rows[0].text()).toContain('Alice');
    expect(rows[0].text()).toContain('25');
    expect(rows[1].text()).toContain('Bob');
    expect(rows[1].text()).toContain('30');
  });

  describe('Table - pagination', () => {
    const propsData = {
      columns: [
        { key: 'name', title: 'Name' },
        { key: 'age', title: 'Age' },
      ],
      data: [
        { id: 1, name: 'Alice', age: 25 },
        { id: 2, name: 'Bob', age: 30 },
        { id: 3, name: 'Charlie', age: 35 },
        { id: 4, name: 'Dave', age: 40 },
        { id: 5, name: 'Eve', age: 45 },
        { id: 6, name: 'Frank', age: 50 },
        { id: 7, name: 'Grace', age: 55 },
        { id: 8, name: 'Heidi', age: 60 },
        { id: 9, name: 'Ivan', age: 65 },
        { id: 10, name: 'Julia', age: 70 },
      ],
      pagination: {
        current: 1,
        pageSize: 3,
        total: 10,
      },
      sorter: {
        key: 'name',
        direction: 'asc',
      },
      columnSearch: {},
      enableSelection: false,
      enablePagination: true,
      enableColumnSearch: false,
      hideHeader: false,
      hasRowDetails: false,
      loading: false,
      bodyStyle: {},
      headerStyle: {},
      rowStyle: {},
    } as any;

    it('displays the correct number of pages', async () => {
      const wrapper = shallowMount(Table, { props: propsData });
      const pageCount = wrapper.find('.js-page-triggers');
      expect(pageCount.text()).toBe('1234');
    });

    it('disables the previous button on the first page', async () => {
      const wrapper = shallowMount(Table, { props: propsData });
      const prevButton = wrapper.find('.js-prev');
      expect(prevButton.attributes('disabled')).toBe('true');
    });

    it('disables the next button on the last page', async () => {
      const wrapper = shallowMount(Table, { props: propsData });
      const nextButton = wrapper.find('.js-next');
      expect(nextButton.attributes('disabled')).not.toBe('true');

      await wrapper.setProps({
        pagination: {
          current: 4,
          pageSize: 3,
          total: 10,
        },
      });

      expect(nextButton.attributes('disabled')).toBe('true');
    });

    it('changes page when clicking on a pagination trigger', async () => {
      const wrapper = shallowMount(Table, { props: propsData });
      const paginationTrigger = wrapper.find('.js-pagination-trigger-2');

      expect(wrapper?.vm?.$props?.pagination?.current).toBe(1);

      await paginationTrigger.trigger('click');
      const changeEmitted = wrapper.emitted().change as any;

      expect(changeEmitted).toBeTruthy();
      expect(changeEmitted[0][0].pagination.current).toEqual(2);
    });
  });

  describe('Table - selection', () => {
    it('should emit allSelected when all items are selected', async () => {
      const columns = [
        { title: 'Name', key: 'name' },
        { title: 'Age', key: 'age' },
      ];
      const data = [
        { id: 1, name: 'Alice', age: 25 },
        { id: 2, name: 'Bob', age: 30 },
        { id: 3, name: 'Charlie', age: 35 },
      ];

      const wrapper = mount(Table, {
        props: {
          columns,
          data,
          enableSelection: true,
        },
        components: {
          BaseCheckbox,
        },
      });

      const checkboxAll = wrapper.find('.js-select-all');
      await checkboxAll.find('input').setValue(true);

      const allSelectedEmitted = wrapper.emitted().allSelected as any;
      expect(allSelectedEmitted).toBeTruthy();
      expect(allSelectedEmitted[0][0]).toEqual(new Set([1, 2, 3]));

      const selectionChangedEmitted = wrapper.emitted().selectionChanged as any;
      expect(selectionChangedEmitted).toBeTruthy();
      expect(selectionChangedEmitted[0][0]).toEqual(new Set([1, 2, 3]));
    });

    it('should emit allDeselected when all items are deselected', async () => {
      const columns = [
        { title: 'Name', key: 'name' },
        { title: 'Age', key: 'age' },
      ];
      const data = [
        { id: 1, name: 'Alice', age: 25 },
        { id: 2, name: 'Bob', age: 30 },
        { id: 3, name: 'Charlie', age: 35 },
      ];

      const wrapper = mount(Table, {
        props: {
          columns,
          data,
          enableSelection: true,
        },
        components: {
          BaseCheckbox,
        },
      });

      const checkboxAll = wrapper.find('.js-select-all');
      await checkboxAll.find('input').setValue(true);
      await wrapper.vm.$nextTick();
      await checkboxAll.find('input').setValue(false);
      const allDeselectedEmitted = wrapper.emitted().allDeselected as any;
      const selectionChangedEmitted = wrapper.emitted().selectionChanged as any;
      expect(allDeselectedEmitted[0][0]).toEqual(new Set());
      expect(selectionChangedEmitted[1][0]).toEqual(new Set());
    });

    it('should emit selectionChanged when individual item is selected', async () => {
      const columns = [
        { title: 'Name', key: 'name' },
        { title: 'Age', key: 'age' },
      ];
      const data = [
        { id: 1, name: 'Alice', age: 25 },
        { id: 2, name: 'Bob', age: 30 },
        { id: 3, name: 'Charlie', age: 35 },
      ];

      const wrapper = mount(Table, {
        props: {
          columns,
          data,
          enableSelection: true,
        },
        components: {
          BaseCheckbox,
        },
      });

      const checkbox1 = wrapper.findAll('.js-select-item')[0];
      await checkbox1.find('input').setValue(true);

      const selectionChangedEmitted = wrapper.emitted().selectionChanged as any;
      expect(selectionChangedEmitted[0][0]).toEqual(new Set([1]));
    });

    it('should emit selectionChanged when individual item is deselected', async () => {
      // create test data
      const data = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 3, name: 'Bob' },
      ];

      // shallowMount the component
      const wrapper = mount(Table, {
        props: {
          data,
          enableSelection: true,
        },
        components: {
          BaseCheckbox,
        },
      });

      // select an item
      const checkbox1 = wrapper.findAll('.js-select-item')[0];
      await checkbox1.find('input').setValue(true);
      expect(wrapper.emitted().selectionChanged).toEqual([[new Set([1])]]);
      await wrapper.vm.$nextTick();

      // deselect the item
      await checkbox1.find('input').setValue(false);

      // check if the "selectionChanged" event was emitted with the correct value
      expect(wrapper.emitted().selectionChanged).toEqual([
        [new Set()],
        [new Set()],
      ]);
    });
  });
});
