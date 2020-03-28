/**
 *
 * Tests for WorkTypeRequestModal
 *
 * Components
 */

import BaseButton from '@/components/BaseButton';
import BaseCheckbox from '@/components/BaseCheckbox';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import { Store } from 'vuex-mock-store';
import WorkTypeRequestModal from '../WorkTypeRequestModal';

jest.mock('@/models/User');
jest.mock('@/models/Worksite');
jest.mock('@/models/Incident');
jest.mock('@/models/Organization');
jest.mock('@/models/WorksiteRequest');

const localVue = createLocalVue();
localVue.filter('getWorkTypeName', () => 'workType.ash');
localVue.use(Vuex);

const mocks = {
  $t: (key) => key,
  $store: new Store({}),
};

const mountWithOptions = (props) =>
  shallowMount(WorkTypeRequestModal, {
    stubs: {
      'base-button': BaseButton,
      'base-checkbox': BaseCheckbox,
      modal: true,
    },
    propsData: {
      workTypes: [],
      initialSelection: [],
      ...props,
    },
    store: mocks.$store,
    localVue,
    mocks,
  });

describe('WorkTypeRequestModal', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions({});
    expect(spy).not.toHaveBeenCalled();
  });

  it('show modal with options', () => {
    const wrapper = mountWithOptions({});
    expect(wrapper.element).toMatchSnapshot();
  });

  it('show modal with options', () => {
    const wrapper = mountWithOptions({
      workTypes: ['muck_out'],
    });
    expect(wrapper.vm.requestedWorkTypes).toMatchSnapshot();
  });

  it('show modal with options and initial selection', () => {
    const wrapper = mountWithOptions({
      workTypes: ['muck_out'],
      initialSelection: ['muck_out'],
    });
    expect(wrapper.vm.requestedWorkTypes).toMatchSnapshot();
  });

  it('show modal with options and multi initial selection', () => {
    const wrapper = mountWithOptions({
      workTypes: ['muck_out', 'ash', 'tarp'],
      initialSelection: ['muck_out', 'tarp'],
    });
    expect(wrapper.vm.requestedWorkTypes).toMatchSnapshot();
  });
});
