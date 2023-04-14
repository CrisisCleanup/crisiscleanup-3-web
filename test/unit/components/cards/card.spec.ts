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
      "<div data-v-inspector-file=\\"/Users/tobi/code/crisiscleanup-4-web/src/components/cards/Card.vue\\" data-v-inspector-line=\\"2\\" data-v-inspector-column=\\"3\\" data-v-inspector-title=\\"Card.vue\\" class=\\"shadow-crisiscleanup-card card h-full\\" data-v-cc50f56d=\\"\\">
        <div data-v-inspector-file=\\"/Users/tobi/code/crisiscleanup-4-web/src/components/cards/Card.vue\\" data-v-inspector-line=\\"3\\" data-v-inspector-column=\\"5\\" data-v-inspector-title=\\"Card.vue\\" class=\\"header\\" data-v-cc50f56d=\\"\\">
          <div data-v-inspector-file=\\"/Users/tobi/code/crisiscleanup-4-web/src/components/cards/Card.vue\\" data-v-inspector-line=\\"4\\" data-v-inspector-column=\\"7\\" data-v-inspector-title=\\"Card.vue\\" class=\\"header--inner\\" data-v-cc50f56d=\\"\\">
            <div>Header</div>
          </div>
        </div>
        <div data-v-inspector-file=\\"/Users/tobi/code/crisiscleanup-4-web/src/components/cards/Card.vue\\" data-v-inspector-line=\\"8\\" data-v-inspector-column=\\"5\\" data-v-inspector-title=\\"Card.vue\\" class=\\"body\\" data-v-cc50f56d=\\"\\">
          <div data-v-inspector-file=\\"/Users/tobi/code/crisiscleanup-4-web/src/components/cards/Card.vue\\" data-v-inspector-line=\\"9\\" data-v-inspector-column=\\"7\\" data-v-inspector-title=\\"Card.vue\\" class=\\"body--inner h-full\\" style=\\"\\" data-v-cc50f56d=\\"\\">
            <div>Hello world</div>
          </div>
        </div>
      </div>"
    `);
  });
});
