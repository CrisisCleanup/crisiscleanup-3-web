import BaseButton from '@/components/BaseButton.vue';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Basics|BaseButton',
  component: BaseButton,
};

export const withText = () =>
  "<base-button variant='solid' size='large'>Button</base-button>";

export const withIcon = () =>
  "<base-button variant='solid' size='large' icon='file'>Button</base-button>";

export const withCustomIcon = () =>
  "<base-button icon-size='md' size='large' variant='outline' ccu-icon='trash'>Button</base-button>";

export const withSizes = () => ({
  data() {
    return {
      sizes: ['small', 'medium', 'large'],
    };
  },
  template: `
    <div>
      <div class="m-4" v-for="s in sizes">
        <base-button :size="s" :key="s" variant="solid">{{s.charAt(0).toUpperCase() + s.slice(1)}}</base-button>
      </div>
    </div>
  `,
});

export const withVariants = () => ({
  data() {
    return {
      variants: ['solid', 'outline', 'text'],
    };
  },
  template: `
    <div>
      <div class="m-4" v-for="v in variants">
        <base-button size="large" :variant="v">{{v.charAt(0).toUpperCase() + v.slice(1)}}</base-button>
      </div>
    </div>
  `,
});

export const withAction = () => ({
  data() {
    return {
      action: action('button-click', 'Ah you clicked me!'),
    };
  },
  template: `<base-button size="large" variant="solid" :action="action">Click Me</base-button>`,
});

export const withAsyncAction = () => ({
  template:
    '<base-button size="large" variant="solid" :action="doAsync">Load for 1 Second</base-button>',
  methods: {
    async doAsync() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
});
