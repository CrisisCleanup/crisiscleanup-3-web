/**
 *
 * Tests for StatusDropDown
 *
 * Components
 */

import { createLocalVue, shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import StatusDropDown from "../StatusDropDown";
jest.mock("@/models/Status");

const localVue = createLocalVue();

localVue.use(Vuex);
// mock filter
localVue.filter(
  "getStatusName",
  jest.fn(() => "status.open_unassigned")
);

const mockWorkType = {
  id: 1,
  name_t: "workType.ash",
  description_t: "workTypeDescription.ash",
  key: "ash",
  file_prefix: "Ash"
};

const mountWithOptions = store =>
  shallowMount(StatusDropDown, {
    stubs: {
      "font-awesome-icon": true,
      "a-select": "<input type='select'>",
      "v-popover": true,
      badge: true
    },
    propsData: {
      currentWorkType: mockWorkType
    },
    localVue,
    store
  });

describe("StatusDropDown", () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store();
  });

  it("should not log any errors", () => {
    const spy = jest.spyOn(global.console, "error");
    mountWithOptions(store);
    expect(spy).not.toHaveBeenCalled();
  });

  it("should change current item on keypress", () => {
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

  it("should render correctly and match snapshot", () => {
    const wrapper = mountWithOptions(store);
    expect(wrapper.element).toMatchSnapshot();
  });
});
