/**
 *
 * Tests for WorkTypeRequestModal
 *
 * Components
 */

import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import User from '@/models/__mocks__/User';
import UserEditModal from '@/pages/organization/UserEditModal';

const localVue = createLocalVue();
localVue.use(Vuex);
jest.mock('@/models/User');
jest.mock('@/models/Role');

const mocks = {
  $t: (key) => key,
  $store: new Vuex.Store(),
};

const mountWithOptions = (props) =>
  shallowMount(UserEditModal, {
    stubs: {
      modal: true,
      'base-input': true,
      'form-select': true,
      'base-button': true,
    },
    propsData: {
      ...props,
    },
    store: mocks.$store,
    localVue,
    mocks,
  });

describe('UserEditModal', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions({});
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit save correctly', () => {
    const wrapper = mountWithOptions({
      user: User.find(1),
    });
    wrapper.vm.saveUser();
    expect(wrapper.emitted().save.length).toBe(1);
  });
});
