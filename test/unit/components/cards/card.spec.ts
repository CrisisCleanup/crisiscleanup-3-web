import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Card from '@/components/cards/Card.vue';

describe('TheCounter.vue', () => {
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
      "<div class=\\"shadow-crisiscleanup-card card h-full\\" data-v-cc50f56d=\\"\\">
        <div class=\\"header\\" data-v-cc50f56d=\\"\\">
          <div class=\\"header--inner\\" data-v-cc50f56d=\\"\\">
            <div>Header</div>
          </div>
        </div>
        <div class=\\"body\\" data-v-cc50f56d=\\"\\">
          <div class=\\"body--inner h-full\\" style=\\"\\" data-v-cc50f56d=\\"\\">
            <div>Hello world</div>
          </div>
        </div>
      </div>"
    `);
  });
});
