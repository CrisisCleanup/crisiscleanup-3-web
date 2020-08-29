import BaseInput from '@/components/BaseInput.vue';

export default {
  title: 'Basics/BaseInput',
  component: BaseInput,
};

export const withSizes = () => ({
  data() {
    return {
      sizes: ['base', 'large'],
    };
  },
  template: `
    <div>
      <div class="m-4" v-for="s in sizes">
        <base-input disabled :size="s" :key="s" :value='s'></base-input>
      </div>
    </div>
  `,
});

export const simple = () =>
  "<base-input  size='large' value='text'></base-input>";

export const disabled = () =>
  "<base-input  disabled size='large' value='text'></base-input>";

export const disabledBreakGlass = () =>
  "<base-input  break-glass size='large' value='text'></base-input>";

export const withIcon = () =>
  "<base-input  icon='map' size='large' value='text'></base-input>";

export const withTooltip = () =>
  "<base-input  tooltip='Some help text' size='large' value='text'></base-input>";

export const withPlaceholder = () =>
  "<base-input  placeholder='Some placeholder' size='large'></base-input>";
