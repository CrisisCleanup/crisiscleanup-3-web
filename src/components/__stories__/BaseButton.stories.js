export default { title: 'Basics|BaseButton' };

export const withText = () =>
  "<base-button type='primary' text='Button' ></base-button>";

export const withNoStyling = () => "<base-button text='Button' ></base-button>";

export const withIcon = () =>
  "<base-button type='primary' text='Button' icon='file'></base-button>";

export const withCustomIcon = () =>
  "<base-button type='primary' text='Button' ccu-icon='trash'></base-button>";

export const withAsyncAction = () => ({
  template:
    '<base-button type="primary" :action="doAsync">Load for 1 second</base-button>',
  methods: {
    async doAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
});
