import '../src/main';
import { withA11y } from '@storybook/addon-a11y';
import centered from '@storybook/addon-centered/vue';
import { addDecorator, addParameters, configure } from '@storybook/vue';
import VueI18n from 'vue-i18n';

const i18n = new VueI18n({
  locale: 'en-US',
  messages: {},
});

// Decorators
addDecorator(centered);
addDecorator(withA11y);
addDecorator(() => ({
  template: '<story/>',
  i18n,
}));

// Global Params
addParameters({
  backgrounds: [
    { name: 'CrisisCleanup Gray', value: '#f9f9f9', default: true },
    { name: 'White', value: '#fff' },
    { name: 'Dark', value: '#4a4a4a' },
  ],
});

configure(require.context('../src', true, /\.stories\.js$/), module);
