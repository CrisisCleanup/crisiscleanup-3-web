import { text, withKnobs } from '@storybook/addon-knobs';
import Spinner from '@/components/Spinner.vue';

export default {
  title: 'Elements/Spinner',
  component: Spinner,
  decorators: [withKnobs],
};

export const withDefaults = () => `<spinner/>`;

export const withDynamicProps = () => ({
  props: {
    message: {
      default: text('Message', 'Loading'),
    },
    color: {
      default: text('Color', '#000'),
    },
    height: {
      default: text('Height', '40px'),
    },
    width: {
      default: text('Width', '40px'),
    },
  },
  template: `<spinner :message="message" :color="color" :height="height" :width="width" />`,
});
