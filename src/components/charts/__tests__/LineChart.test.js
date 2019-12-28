/**
 *
 * Tests for LineChart
 *
 * Components
 */

import { mount } from "@vue/test-utils";
import LineChart from "../LineChart";

describe("LineChart", () => {
  it("should not log any errors", () => {
    const spy = jest.spyOn(global.console, "error");
    mount(LineChart);
    expect(spy).not.toHaveBeenCalled();
  });

  it("should render correctly and match snapshot", () => {
    const wrapper = mount(LineChart);
    expect(wrapper.element).toMatchSnapshot();
  });

  it("should match snapshot with props", () => {
    const wrapper = mount(LineChart, {
      propsData: { color: "red", width: "20px", height: "20px" }
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
