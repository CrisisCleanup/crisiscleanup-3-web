/**
 *
 * Tests for Dashboard
 *
 * Components
 */

import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import { Store } from 'vuex-mock-store';
import Table from '@/components/Table';
import Dashboard from '../Dashboard';

jest.mock('@/models/User');
jest.mock('@/models/Status');
jest.mock('@/models/Worksite');
jest.mock('@/models/Incident');
jest.mock('@/models/Organization');
jest.mock('@/models/WorksiteRequest');

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.filter('numeral', (n) => n);
localVue.filter('getColorForWorkType', () => '#ffffff');
localVue.directive('can', () => false);

const $route = {
  path: '/incident/99/dashboard',
  params: {
    incident_id: 99,
  },
};

const store = new Store({
  state: {
    incident: {
      currentIncidentId: 99,
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
  $route,
  $store: store,
  $can: () => true,
  $http: {
    get: () => {
      return {
        data: {
          count: 2,
          results: [],
        },
      };
    },
  },
  $t: (key) => key,
};

const mountWithOptions = () =>
  shallowMount(Dashboard, {
    stubs: {
      'base-button': true,
      'base-input': true,
      'ccu-icon': true,
      badge: true,
      spinner: true,
      'router-link': true,
      table: Table,
    },
    mocks,
    localVue,
  });

describe('Dashboard', () => {
  afterEach(() => store.reset());
  it('should not log any errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    mountWithOptions();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render correctly and match snapshot', () => {
    const wrapper = mountWithOptions();
    expect(wrapper.element).toMatchSnapshot();
  });
});
