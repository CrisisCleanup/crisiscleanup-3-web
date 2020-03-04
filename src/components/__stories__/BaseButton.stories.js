import BaseButton from '@/components/BaseButton.vue';

export default {
  title: 'Basics|BaseButton',
  component: BaseButton,
};

export const withText = () =>
  "<base-button variant='solid' size='large' text='Button' ></base-button>";

export const withIcon = () =>
  "<base-button variant='solid' size='large' text='Button' icon='file'></base-button>";

export const withCustomIcon = () =>
  "<base-button text='Button' size='large' variant='outline' ccu-icon='trash'></base-button>";

export const withSizes = () => ({
  data() {
    return {
      sizes: ['small', 'medium', 'large'],
    };
  },
  template: `
    <div>
      <div class="m-4" v-for="s in sizes">
        <base-button :size="s" :key="s" variant="solid">{{s}}</base-button>
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
        <base-button size="large" :variant="v" />
      </div>
    </div>
  `,
});

export const withAsyncAction = () => ({
  template:
    '<base-button variant="solid" :action="doAsync">Load for 1 second</base-button>',
  methods: {
    async doAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
});
