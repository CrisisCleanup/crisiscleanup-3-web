import { describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import BaseSelect from '@/components/BaseSelect.vue';

vi.mock('vue-i18n');
vi.mock('axios');

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
        async options() {
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_BASE_URL}/table`,
          );
          return response.data.results;
        },
      },
    });
    expect(spy).not.toHaveBeenCalled();
  });
  it('should be able to select and clear item', async () => {
    const options = ['tobi', 'aaron', 'deep'];
    const wrapper = mount(BaseSelect, {
      props: {
        options,
      },
    });
    await flushPromises();
    await wrapper.find('.multiselect-options').trigger('click');
    await wrapper.find('.multiselect-option').trigger('click');
    const selected = wrapper.find('.multiselect-single-label-text').text();
    expect(selected).toEqual(options[0]);
    await wrapper.find('.multiselect-clear').trigger('click');
    const selectedAfterClear = wrapper.find('.multiselect-single-label-text');
    expect(selectedAfterClear.exists()).toBeFalsy();
    expect(wrapper.vm.isInvalid).to.equal(false);
  });

  it('should be able to select and clear item but invalid when required', async () => {
    const options = ['tobi', 'aaron', 'deep'];
    const wrapper = mount(BaseSelect, {
      props: {
        options,
        required: true,
      },
    });
    await flushPromises();
    await wrapper.find('.multiselect-options').trigger('click');
    await wrapper.find('.multiselect-option').trigger('click');
    const selected = wrapper.find('.multiselect-single-label-text').text();
    expect(selected).toEqual(options[0]);
    await wrapper.find('.multiselect-clear').trigger('click');
    const selectedAfterClear = wrapper.find('.multiselect-single-label-text');
    expect(selectedAfterClear.exists()).toBeFalsy();
    expect(wrapper.vm.isInvalid).to.equal(true);
  });
});
