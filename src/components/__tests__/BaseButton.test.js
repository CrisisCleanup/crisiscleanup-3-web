/**
 *
 * Tests for BaseButton
 *
 * Components
 */

import { mount } from "@vue/test-utils";
import BaseButton from "../BaseButton";

describe("BaseButton", () => {
  it("should not log any errors", () => {
    const spy = jest.spyOn(global.console, "error");
    mount(BaseButton);
    expect(spy).not.toHaveBeenCalled();
  });

  it("should perform action", () => {
    const mockAction = jest.fn();

    const wrapper = mount(BaseButton, { propsData: { action: mockAction } });
    wrapper.find("button").trigger("click");
    expect(wrapper.vm.loading).toBeTruthy();
    expect(mockAction).toHaveBeenCalled();
  });

  it("should match snapshot with props", () => {
    const testProps = {
      type: "primary",
      text: "Button Text",
      alt: "alternate text",
      size: "large"
    };
    const wrapper = mount(BaseButton, {
      propsData: testProps
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it("should render correctly and match snapshot", () => {
    const wrapper = mount(BaseButton);
    expect(wrapper.element).toMatchSnapshot();
  });
});
