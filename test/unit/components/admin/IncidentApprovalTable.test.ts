import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import { commonComponentStubs } from '../../../helpers';
import IncidentApprovalTable from '@/components/admin/IncidentApprovalTable.vue';

describe('IncidentApprovalTable', () => {
  it('renders correctly', async () => {
    const requests = [
      {
        id: '1',
        organization_name: 'Example Organization 1',
        organization_statuses: {
          is_verified: true,
          is_active: false,
          is_auto_request: true,
          organization_profile_completed: false,
        },
        incident_name: 'Example Incident 1',
        created_at: '2022-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        organization_name: 'Example Organization 2',
        organization_statuses: {
          is_verified: false,
          is_active: true,
          is_auto_request: false,
          organization_profile_completed: true,
        },
        incident_name: 'Example Incident 2',
        created_at: '2022-02-01T00:00:00.000Z',
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

    const wrapper = mount(IncidentApprovalTable, {
      props: {
        requests,
        meta,
        loading: false,
      },
      global: {
        plugins: [i18n],
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          ...commonComponentStubs,
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
