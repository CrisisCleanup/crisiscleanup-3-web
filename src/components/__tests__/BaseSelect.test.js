/**
 *
 * Tests for BaseSelect
 *
 * Components
 */

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { shallowMount } from "@vue/test-utils";
import BaseSelect from "../BaseSelect";
library.add(fas);

describe("BaseSelect", () => {
  it("should render correctly and match snapshot", () => {
    const testData = {
      propsData: {
        placeholder: "Select Something",
        icon: "caret-down",
        class: "incident-select"
      },
      slots: {
        options: "<div>option</div>"
      },
      stubs: {
        "font-awesome-icon": FontAwesomeIcon
      }
    };
    const wrapper = shallowMount(BaseSelect, testData);
    expect(wrapper).toMatchSnapshot();
  });
});
