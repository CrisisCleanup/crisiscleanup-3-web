import { mount } from '@vue/test-utils';
import { Store } from 'vuex-mock-store';
import User from '@/models/User';
import InviteUsers from '../InviteUsers.vue';

jest.mock('@/models/User');
jest.mock('@/models/Organization');

const store = new Store({
  state: {
    incident: {
      currentIncidentId: 99,
    },
    enums: {
      statuses: [],
    },
    auth: {
      user: {
        id: 1,
        first_name: 'First',
        last_name: 'Last',
        organization: {
          id: 1,
          name: 'Test Organization',
        },
      },
    },
  },
});

const mocks = {
  $t: (key) => key,
  $toasted: {
    error: jest.fn(),
  },
  $store: store,
};

const mountWithOptions = ({ props, data, ...opts } = {}) =>
  mount(InviteUsers, {
    stubs: ['base-button', 'tag-input', 'modal'],
    propsData: {
      admin: false,
      ...props,
    },
    data() {
      return {
        ...data,
      };
    },
    mocks,
    ...opts,
  });

describe('InviteUsers', () => {
  beforeEach(() => User.api().inviteUser.mockClear());

  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should convert emails to tags on submit', async () => {
    const wrapper = mountWithOptions({
      data: { showInviteModal: true, emails: 'example@example.com' },
    });
    await wrapper.vm.inviteUsers();
    expect(User.api().inviteUser.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "example@example.com",
          null,
        ],
      ]
    `);
  });

  it('should invite all tags', async () => {
    const wrapper = mountWithOptions({
      data: {
        showInviteModal: true,
        usersToInvite: [{ text: 'one@email.com' }, { text: 'two@email.com' }],
        emails: '',
      },
    });
    await wrapper.vm.inviteUsers();
    expect(User.api().inviteUser.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "one@email.com",
          null,
        ],
        Array [
          "two@email.com",
          null,
        ],
      ]
    `);
  });

  it('should combine untagged emails with tags', async () => {
    const wrapper = mountWithOptions({
      data: {
        showInviteModal: true,
        usersToInvite: [{ text: 'one@email.com' }, { text: 'two@email.com' }],
        emails: 'three@email.com',
      },
    });
    await wrapper.vm.inviteUsers();
    expect(User.api().inviteUser.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "one@email.com",
          null,
        ],
        Array [
          "two@email.com",
          null,
        ],
        Array [
          "three@email.com",
          null,
        ],
      ]
    `);
  });

  it('should not combine invalid emails with tags', async () => {
    const wrapper = mountWithOptions({
      data: {
        showInviteModal: true,
        usersToInvite: [{ text: 'one@email.com' }, { text: 'two@email.com' }],
        emails: 'three',
      },
    });
    await wrapper.vm.inviteUsers();
    expect(User.api().inviteUser.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "one@email.com",
          null,
        ],
        Array [
          "two@email.com",
          null,
        ],
      ]
    `);
  });

  it('should show error without any emails', async () => {
    const wrapper = mountWithOptions({
      data: {
        showInviteModal: true,
        usersToInvite: [],
        emails: '',
      },
    });
    await wrapper.vm.inviteUsers();
    expect(User.api().inviteUser).not.toHaveBeenCalled();
    expect(wrapper.vm.$toasted.error).toHaveBeenCalled();
  });
});
