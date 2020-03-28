/**
 *
 * Tests for WorksiteSearchInput
 *
 * Components
 */

import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import { MockWorksites } from '@/utils/testing';
import WorksiteSearchInput from '../WorksiteSearchInput';

const localVue = createLocalVue();
localVue.use(Vuex);

jest.mock('@/models/Worksite');
jest.mock('@/models/User');

const mocks = {
  $t: (key) => key,
};

const mountWithOptions = (store) =>
  shallowMount(WorksiteSearchInput, {
    stubs: ['vue-autosuggest', 'font-awesome-icon'],
    propsData: {
      suggestions: [{ name: 'worksites', data: [], key: 'name' }],
    },
    localVue,
    store,
    mocks,
  });

describe('WorksiteSearchInput', () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store();
  });
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions(store);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should retrieve current user', () => {
    const wrapper = mountWithOptions(store);
    expect(wrapper.vm.currentUser).toMatchSnapshot();
  });

  it('should determine if it should render suggestions', () => {
    const wrapper = mountWithOptions(store);
    expect(wrapper.vm.shouldRenderSuggestions(0, false)).toBe(false);
    expect(wrapper.vm.shouldRenderSuggestions(0, true)).toBe(false);
    expect(wrapper.vm.shouldRenderSuggestions(1, true)).toBe(false);
    expect(wrapper.vm.shouldRenderSuggestions(1, false)).toBe(true);
  });

  it('should render geocoder suggestion', () => {
    const wrapper = mountWithOptions(store);
    const suggestion = wrapper.vm.renderSuggestion({
      name: 'geocoder',
      item: {
        description: 'mock description',
      },
    });
    expect(suggestion.children[0].context.$el.outerHTML).toMatchSnapshot();
  });

  it('should render suggestion', () => {
    const wrapper = mountWithOptions(store);
    const suggestion = wrapper.vm.renderSuggestion({
      name: 'notgeocoder',
      item: {
        description: 'mock description',
        ...MockWorksites[0],
      },
    });
    expect(suggestion.children[0].context.$el.outerHTML).toMatchSnapshot();
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mountWithOptions(store);
    expect(wrapper.element).toMatchSnapshot();
  });
});
