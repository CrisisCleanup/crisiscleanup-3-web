import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import InvitationTable from '@/components/admin/InvitationTable.vue';

describe('InvitationTable', () => {
  it('renders correctly', async () => {
    const invitations = [
      {
        id: '1',
        invitee_email: 'example1@example.com',
        invited_by: { email: 'user1@example.com' },
        invitation_token: 'token1',
        organization: 'Example Organization 1',
        expires_at: '2022-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        invitee_email: 'example2@example.com',
        invited_by: { email: 'user2@example.com' },
        invitation_token: 'token2',
        organization: 'Example Organization 2',
        expires_at: '2022-02-01T00:00:00.000Z',
      },
    ];

    const meta = {
      pagination: {
        total: invitations.length,
        per_page: 10,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: invitations.length,
      },
    };

    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {},
      },
    });

    const wrapper = mount(InvitationTable, {
      props: {
        invitations,
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
          'base-button': true,
        },
      },
    });

    // Wait for component to render
    await wrapper.vm.$nextTick();

    // Check that the component has rendered the correct number of rows
    const rows = wrapper.findAll('.js-table-row');
    expect(rows.length).toBe(invitations.length);
  });
});
