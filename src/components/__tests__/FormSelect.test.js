/**
 *
 * Tests for FormSelect
 *
 * Components
 */

import { mount } from '@vue/test-utils';
import vSelect from 'vue-select';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import BaseIcon from '@/components/BaseIcon';
import FormSelect from '../FormSelect';
library.add(fas);

const mountWithOptions = (options) =>
  mount(FormSelect, {
    stubs: {
      'v-select': vSelect,
      'font-awesome-icon': FontAwesomeIcon,
      'ccu-icon': BaseIcon,
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
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should match snapshot with props', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.element).toMatchSnapshot();
  });
});
