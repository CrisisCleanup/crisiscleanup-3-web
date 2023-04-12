import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import GhostUsersTable from '@/components/admin/GhostUsersTable.vue';

describe('GhostUsersTable', () => {
  it('renders correctly', async () => {
    const users = [
      {
        id: 1,
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        mobile: '1234567890',
        organization_name: 'Example Organization',
        associated_user: 'Jane Smith',
      },
      {
        id: 1,
        email: 'john.doe2@example.com',
        first_name: 'John',
        last_name: 'Doe',
        mobile: '1234567890',
        organization_name: 'Example Organization 2',
        associated_user: 'Jane Smith 2',
      },
    ];

    const meta = {
      pagination: {
        total: users.length,
        per_page: 10,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: users.length,
      },
    };

    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {},
      },
    });

    const wrapper = mount(GhostUsersTable, {
      props: {
        users,
        meta,
        loading: false,
      },
      global: {
        plugins: [i18n],
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          'base-link': true,
        },
      },
    });

    // Wait for component to render
    await wrapper.vm.$nextTick();

    // Check that the component has rendered the correct number of rows
    const rows = wrapper.findAll('.js-table-row');
    expect(rows.length).toBe(users.length);
  });
});
