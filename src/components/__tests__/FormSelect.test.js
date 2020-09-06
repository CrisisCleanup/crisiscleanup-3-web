/**
 *
 * Tests for FormSelect
 *
 * Components
 */

import { mount, createLocalVue } from '@vue/test-utils';
import vSelect from 'vue-select';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import BaseIcon from '@/components/BaseIcon';
import CompositionApi from '@vue/composition-api';
import FormSelect from '../FormSelect';
library.add(fas);

const localVue = createLocalVue();
localVue.use(CompositionApi);

const mountWithOptions = (options) =>
  mount(FormSelect, {
    stubs: {
      'v-select': vSelect,
      'font-awesome-icon': FontAwesomeIcon,
      'ccu-icon': BaseIcon,
      'resize-observer': true,
    },
    propsData: {
      searchable: true,
      placeholder: 'Some Value',
    },
    mocks: {
      $t: (key) => key,
    },
    ...options,
  });

describe('FormSelect', () => {
  it('should render correctly and match snapshot', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should match snapshot with props', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.element).toMatchSnapshot();
  });
});
