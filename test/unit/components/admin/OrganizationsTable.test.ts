import { mount } from '@vue/test-utils';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createI18n } from 'vue-i18n';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { MockedFunction } from 'vitest';
import OrganizationsTable from '@/components/admin/OrganizationsTable.vue';

vi.mock('axios');

describe('OrganizationsTable', () => {
  type AxiosGet = <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ) => Promise<R>;
  const mockOrganizationRoles = [
    { id: 1, name_t: 'Role 1' },
    { id: 2, name_t: 'Role 2' },
  ];

  beforeEach(async () => {
    (axios.get as MockedFunction<AxiosGet>).mockResolvedValue({
      data: {
        results: mockOrganizationRoles,
      },
    });
  });
  it('renders correctly', async () => {
    const organizations = [
      {
        id: 'org1',
        name: 'Organization 1',
        profile_completed: true,
        is_verified: true,
        is_active: true,
        approved_by: null,
        rejected_by: null,
        approved_roles: [1],
        approved_incidents: [],
      },
      {
        id: 'org2',
        name: 'Organization 2',
        profile_completed: false,
        is_verified: false,
        is_active: false,
        approved_by: null,
        rejected_by: null,
        approved_roles: [2],
        approved_incidents: [],
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

    const wrapper = mount(OrganizationsTable, {
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
          badge: true,
          spinner: true,
          'font-awesome-icon': true,
          'base-text': true,
          'base-checkbox': true,
          'base-button': true,
          'base-link': true,
          'base-input': true,
          'base-select': true,
          'ccu-icon': true,
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
