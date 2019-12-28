/**
 *
 * Tests for Spinner
 *
 * Components
 */

import { mount } from "@vue/test-utils";
import Spinner from "../Spinner";

describe("Spinner", () => {
  it("should not log any errors", () => {
    const spy = jest.spyOn(global.console, "error");
    mount(Spinner);
    expect(spy).not.toHaveBeenCalled();
  });

  it("should render correctly and match snapshot", () => {
    const wrapper = mount(Spinner);
    expect(wrapper.element).toMatchSnapshot();
  });
});
