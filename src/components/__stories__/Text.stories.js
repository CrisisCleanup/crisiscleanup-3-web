import BaseText, { VARIANTS as TextVariants } from '@/components/BaseText';

export default {
  title: 'Basics|BaseText',
  component: BaseText,
};

export const withDefaults = () => `<base-text>Sample Text</base-text>`;

export const withVariants = () => ({
  data() {
    return {
      // h1, h2, h3, h4, body, bodysm
      variants: TextVariants,
    };
  },
  template: `
    <div>
      <div class="m-4" v-for="v in variants">
        <base-text :variant="v">Sample Text - ({{v}})</base-text>
      </div>
    </div>
  `,
});

export const withFonts = () => ({
  data() {
    return {
      // Nunito Sans, Montserrat
      fonts: ['sans', 'display'],
    };
  },
  template: `
    <div>
      <div v-for="f in fonts" class="m-4">
        <base-text :font="f" variant="h1" >Sample Text - ({{f}})</base-text>
      </div>
    </div>
  `,
});

export const withCustomStyles = () =>
  `<base-text variant="h1" class="text-white bg-black" >Sample Text</base-text>`;
