import { describe, expect, it } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { commonComponentStubs } from '../../helpers';
import { makeTableColumns } from '../../../src/utils/table';
import AjaxTable from '@/components/AjaxTable.vue';

describe('AjaxTable', () => {
  it('should render', async () => {
    const wrapper = mount(AjaxTable, {
      props: {
        columns: makeTableColumns([
          ['id', '1fr', 'ID'],
          ['name', '1fr', 'Name'],
        ]),
        url: `${import.meta.env.VITE_APP_API_BASE_URL}/table`,
        query: {},
      },
      global: {
        stubs: {
          ...commonComponentStubs,
        },
      },
    });
    await flushPromises();
    expect(wrapper.html()).toContain('Name from table data');
    expect(wrapper.html()).toContain('id_from_table_data');
    expect(wrapper.html()).not.toContain('info.search_items');
  });
  it('should render with search', async () => {
    const wrapper = mount(AjaxTable, {
      props: {
        enableSearch: true,
        columns: makeTableColumns([
          ['id', '1fr', 'ID'],
          ['name', '1fr', 'Name'],
        ]),
        url: `${import.meta.env.VITE_APP_API_BASE_URL}/table`,
        query: {},
      },
      global: {
        stubs: {
          ...commonComponentStubs,
        },
      },
    });
    await flushPromises();
    expect(wrapper.html()).toContain('info.search_items');
  });
});
