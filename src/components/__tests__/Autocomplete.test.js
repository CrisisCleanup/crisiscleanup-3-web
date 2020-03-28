/**
 *
 * Tests for Autocomplete
 *
 * Components
 */

import { createLocalVue, shallowMount } from '@vue/test-utils';
import VueAutosuggest from 'vue-autosuggest';
import Autocomplete from '../Autocomplete';

const localVue = createLocalVue();
localVue.use(VueAutosuggest);

const mountWithOptions = (options) =>
  shallowMount(Autocomplete, {
    propsData: {
      suggestions: [{ data: ['One', 'Two'] }],
    },
    ...options,
    localVue,
  });

describe('Autocomplete', () => {
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit option when selected', () => {
    const wrapper = mountWithOptions();
    wrapper.vm.onSelected({ item: 'selected' });
    expect(wrapper.emitted().selected[0][0]).toBe('selected');
  });

  it('should retrieve suggestion value', () => {
    const wrapper = mountWithOptions({
      propsData: {
        displayProperty: 'test',
      },
    });
    const testSuggestion = {
      item: {
        test: 'result',
      },
    };
    expect(wrapper.vm.getSuggestionValue(testSuggestion)).toBe('result');
  });

  it('should emit text on input', () => {
    const wrapper = mountWithOptions();
    wrapper.vm.onInputChange('one');
    expect(wrapper.emitted().search[0][0]).toBe('one');
    wrapper.vm.onInputChange('');
    wrapper.vm.onInputChange(undefined);
    expect(wrapper.emitted().search.length).toBe(1);
  });

  it('should render suggestions', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.vm.shouldRenderSuggestions(1, false)).toBeTruthy();
    expect(wrapper.vm.shouldRenderSuggestions(1, true)).toBeFalsy();
    expect(wrapper.vm.shouldRenderSuggestions(0, true)).toBeFalsy();
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.element).toMatchSnapshot();
  });
});
