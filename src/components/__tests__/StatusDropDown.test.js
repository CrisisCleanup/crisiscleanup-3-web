/**
 *
 * Tests for StatusDropDown
 *
 * Components
 */

import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import StatusDropDown from '../StatusDropDown';
const statuses = [
  {
    id: 1,
    status_name_t: 'status.open_unassigned',
    substatus_name_t: 'substatus.unassigned',
    description_t: 'statusDescription.open_unassigned',
    status: 'open_unassigned',
    primary_state: 'open',
    substatus: 'unassigned',
    claimed_class: 'open-unassigned-claimed',
    unclaimed_class: 'open-unassigned-unclaimed',
    completed_by_anybody: '0.00',
    completed_by_ccu: '0.00',
    completed_db: '0.00',
  },
  {
    id: 2,
    status_name_t: 'status.open_assigned',
    substatus_name_t: 'substatus.assigned',
    description_t: 'statusDescription.open_assigned',
    status: 'open_assigned',
    primary_state: 'open',
    substatus: 'assigned',
    claimed_class: 'open-assigned-claimed',
    unclaimed_class: 'open-assigned-unclaimed',
    completed_by_anybody: '0.25',
    completed_by_ccu: '0.25',
    completed_db: '0.25',
  },
];

const localVue = createLocalVue();

localVue.use(Vuex);
// mock filter
localVue.filter(
  'getStatusName',
  jest.fn(() => 'status.open_unassigned'),
);

const mockWorkType = {
  id: 1,
  name_t: 'workType.ash',
  description_t: 'workTypeDescription.ash',
  key: 'ash',
  file_prefix: 'Ash',
};

const mountWithOptions = (store, props = {}) =>
  shallowMount(StatusDropDown, {
    stubs: {
      'font-awesome-icon': true,
      'a-select': "<input type='select'>",
      'v-popover': true,
      badge: true,
    },
    propsData: {
      currentWorkType: mockWorkType,
      ...props,
    },
    localVue,
    store,
  });

describe('StatusDropDown', () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        enums: {
          namespaced: true,
          state: {
            statuses,
          },
        },
      },
    });
  });

  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions(store);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should change current item on keypress', () => {
    const wrapper = mountWithOptions(store);
    // mock sanity check
    expect(wrapper.vm.statuses.length).toBe(2);
    expect(wrapper.vm.currentItem).toBe(1);
    wrapper.vm.nextItem({ keyCode: 40 });
    expect(wrapper.vm.currentItem).toBe(2);
    wrapper.vm.nextItem({ keyCode: 40 });
    expect(wrapper.vm.currentItem).toBe(2);
    wrapper.vm.nextItem({ keyCode: 38 });
    expect(wrapper.vm.currentItem).toBe(1);
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mountWithOptions(store);
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render correctly and match snapshot when using icons', () => {
    const wrapper = mountWithOptions(store, { useIcon: true });
    expect(wrapper.element).toMatchSnapshot();
  });
});
