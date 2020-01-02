/**
 *
 * Tests for WorksiteFilters
 *
 * Components
 */

import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import BaseButton from '@/components/BaseButton';
import { snakeToTitleCase } from '@/filters';
import WorksiteFilters from '../WorksiteFilters';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.filter('getWorkTypeName', () => 'workType.ash');
localVue.filter('snakeToTitleCase', snakeToTitleCase);

jest.mock('@/models/Worksite');

const MockFilters = {
  fields: {
    muck_out: true,
  },
  statuses: {
    open: true,
    closed: false,
  },
  sub_fields: {},
};

const mocks = {
  $t: key => key,
};

const mountWithOptions = () =>
  shallowMount(WorksiteFilters, {
    stubs: {
      'base-button': BaseButton,
      'base-checkbox': true,
      modal: true,
      tag: true,
    },
    propsData: {
      currentFilters: MockFilters,
    },
    localVue,
    mocks,
  });

describe('WorksiteFilters', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should set status open/closed', () => {
    const wrapper = mountWithOptions();
    wrapper.vm.setOpenClosed(true, 'open');
    expect(wrapper.vm.filters).toMatchSnapshot();
    wrapper.vm.setOpenClosed();
    expect(wrapper.vm.filters).toMatchSnapshot();
  });

  it('should remove field', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.vm.filters).toMatchSnapshot(MockFilters);
    wrapper.vm.removeField('muck_out');
    expect(wrapper.vm.filters).toMatchSnapshot({
      ...MockFilters,
      fields: {},
    });
  });

  it('should remove status', () => {
    const wrapper = mountWithOptions();
    wrapper.vm.removeStatus('open');
    expect(wrapper.vm.filters).toMatchSnapshot({
      ...MockFilters,
      statuses: {
        closed: false,
      },
    });
  });

  it('should update filters', () => {
    const wrapper = mountWithOptions();
    wrapper.vm.updateFilters();
    const expectFilters = MockFilters;
    delete expectFilters.sub_fields;
    expect(wrapper.emitted().updatedFilters[0][0]).toMatchSnapshot(
      expectFilters,
    );
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.element).toMatchSnapshot();
  });
});
