import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Card from '@/components/cards/Card.vue';

describe('Card', () => {
  it('should render', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div>Hello world</div>',
      },
    });
    expect(wrapper.text()).toContain('Hello world');
  });

  it('renders with header slot', () => {
    const wrapper = mount(Card, {
      slots: {
        header: '<div>Header</div>',
      },
    });
    expect(wrapper.text()).toContain('Header');
  });

  it('matches snapshot', () => {
    const wrapper = mount(Card, {
      slots: {
        header: '<div>Header</div>',
        default: '<div>Hello world</div>',
      },
    });
    expect(wrapper.html()).toMatchInlineSnapshot(`
      "<div data-v-cc50f56d=\\"\\" class=\\"shadow-crisiscleanup-card card h-full\\">
        <div data-v-cc50f56d=\\"\\" class=\\"header\\">
          <div data-v-cc50f56d=\\"\\" class=\\"header--inner\\">
            <div>Header</div>
          </div>
        </div>
        <div data-v-cc50f56d=\\"\\" class=\\"body\\">
          <div data-v-cc50f56d=\\"\\" class=\\"body--inner h-full\\" style=\\"\\">
            <div>Hello world</div>
          </div>
        </div>
      </div>"
    `);
  });
});
