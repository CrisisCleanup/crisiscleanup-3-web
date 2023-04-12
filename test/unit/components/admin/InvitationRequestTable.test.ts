import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import InvitationRequestTable from '@/components/admin/InvitationRequestTable.vue';

describe('InvitationRequestTable', () => {
  it('renders correctly', async () => {
    const requests = [
      {
        id: 1,
        email: 'jane.doe@example.com',
        first_name: 'Jane',
        last_name: 'Doe',
        mobile: '1234567890',
        requested_to: 'John Smith',
        requested_to_organization: 'Example Organization',
      },
      {
        id: 2,
        email: 'jane.doe2@example.com',
        first_name: 'Jane',
        last_name: 'Doe',
        mobile: '1234567890',
        requested_to: 'John Smith 2',
        requested_to_organization: 'Example Organization 2',
      },
    ];

    const meta = {
      pagination: {
        total: requests.length,
        per_page: 10,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: requests.length,
      },
    };

    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {},
      },
    });

    const wrapper = mount(InvitationRequestTable, {
      props: {
        requests,
        meta,
        loading: false,
      },
      global: {
        plugins: [i18n],
        mocks: {
          $t: (key: string) => key,
          $toasted: {
            success: () => {},
          },
        },
      },
    });

    // Wait for component to render
    await wrapper.vm.$nextTick();

    // Check that the component has rendered the correct number of rows
    const rows = wrapper.findAll('.js-table-row');
    expect(rows.length).toBe(requests.length);
  });
});
