import { describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { useI18n } from 'vue-i18n';
import BaseSelect from '@/components/BaseSelect.vue';
import axios from "axios";

vi.mock('vue3-mq');
vi.mock('vue-i18n');

(useI18n as any).mockReturnValue({
  t: (tKey: string) => tKey,
});

describe('BaseSelect', () => {
  it('should render with basic options', async () => {
    const options = ['tobi', 'aaron', 'deep'];
    const wrapper = mount(BaseSelect, {
      props: {
        options,
      },
    });
    await flushPromises();
    expect(wrapper.findAll('.multiselect-option')).to.have.length(
      options.length,
    );
  });
  it('should render with object options', async () => {
    const options = [
      {
        id: 'id_from_table_data',
        name: 'Name from table data',
      },
    ];
    const wrapper = mount(BaseSelect, {
      props: {
        itemKey: 'id',
        label: 'name',
        options,
      },
    });
    await flushPromises();
    expect(wrapper.findAll('.multiselect-option')).to.have.length(
      options.length,
    );
    expect(wrapper.html()).toContain('Name from table data');
    expect(wrapper.html()).toContain('id_from_table_data');
  });
  it('should render with async options', async () => {
    const spy = vi.spyOn(global.console, 'error');
    mount(BaseSelect, {
      props: {
        itemKey: 'id',
        label: 'name',
        searchable: true,
        options: async () => {
          const response = await axios.get(
            'https://test.crisiscleanup.io/table',
          );
          return response.data.results;
        },
      },
    });
    expect(spy).not.toHaveBeenCalled();
  });
});
