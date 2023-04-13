import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import UsersTable from '@/components/admin/UsersTable.vue';

describe('UsersTable', () => {
  it('renders correctly', async () => {
    const users = [
      {
        id: 'user1',
        email: 'user1@example.com',
        first_name: 'User',
        last_name: 'One',
        mobile: '1234567890',
        organization: {
          id: 'org1',
          name: 'Organization 1',
        },
        active_roles: [1],
        last_sign_in_at: '2023-01-01T00:00:00.000Z',
        sign_in_count: 1,
      },
      {
        id: 'user2',
        email: 'user2@example.com',
        first_name: 'User',
        last_name: 'Two',
        mobile: '2345678901',
        organization: {
          id: 'org2',
          name: 'Organization 2',
        },
        active_roles: [2],
        last_sign_in_at: '2023-02-01T00:00:00.000Z',
        sign_in_count: 2,
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

    const wrapper = mount(UsersTable, {
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
          'base-button': true,
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
