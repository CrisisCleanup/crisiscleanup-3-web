import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import OrganizationApprovalTable from '@/components/admin/OrganizationApprovalTable.vue';

describe('OrganizationApprovalTable', () => {
  it('renders correctly', async () => {
    const organizations = [
      {
        id: '1',
        name: 'Example Organization 1',
        profile_completed: true,
        is_verified: true,
        is_active: false,
        url: 'https://example1.com',
        admin_notes: 'Example notes 1',
        incidents: [
          {
            id: '1',
            name: 'Example Incident 1',
          },
        ],
        created_at: '2022-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        name: 'Example Organization 2',
        profile_completed: false,
        is_verified: false,
        is_active: true,
        url: 'https://example2.com',
        admin_notes: 'Example notes 2',
        incidents: [],
        created_at: '2022-02-01T00:00:00.000Z',
      },
    ];

    const meta = {
      pagination: {
        total: organizations.length,
        per_page: 10,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: organizations.length,
      },
    };

    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {},
      },
    });

    const wrapper = mount(OrganizationApprovalTable, {
      props: {
        organizations,
        meta,
        loading: false,
      },
      global: {
        plugins: [i18n],
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          'font-awesome-icon': true,
          badge: true,
          'base-button': true,
          'base-link': true,
        },
      },
    });

    // Wait for component to render
    await wrapper.vm.$nextTick();

    // Check that the component has rendered the correct number of rows
    const rows = wrapper.findAll('.js-table-row');
    expect(rows.length).toBe(organizations.length);
  });
});
