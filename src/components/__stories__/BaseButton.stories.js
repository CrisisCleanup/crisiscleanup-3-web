export default { title: 'Basics|BaseButton' };

export const withText = () =>
  "<base-button variant='solid' text='Button' ></base-button>";

export const withIcon = () =>
  "<base-button type='solid' text='Button' icon='file'></base-button>";

export const withCustomIcon = () =>
  "<base-button variant='solid' text='Button' ccu-icon='trash'></base-button>";

export const withSizes = () => ({
  data() {
    return {
      sizes: ['small', 'medium', 'large'],
    };
  },
  template: `
    <div>
      <div class="m-4" v-for="s in sizes">
        <base-button :size="s" :key="s" :type="primary">{{s}}</base-button>
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
    '<base-button type="primary" :action="doAsync">Load for 1 second</base-button>',
  methods: {
    async doAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
});
