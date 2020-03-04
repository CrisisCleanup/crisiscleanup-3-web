import BaseIcon, { ICONS, ICON_SIZES } from '@/components/BaseIcon';

export default {
  title: 'Basics|BaseIcon',
  component: BaseIcon,
};

export const simpleIcon = () => '<ccu-icon type="edit" />';

export const allIconSizes = () => ({
  data() {
    return {
      sizes: ICON_SIZES,
      icons: ICONS,
    };
  },
  template: `
  <div class="flex flex-wrap mx-96">
    <ccu-icon v-for="size in sizes" :key="size" :size="size" :type="icons.trash"/>
  </div>
  `,
});

export const allIcons = () => ({
  data() {
    return {
      icons: Object.values(ICONS),
    };
  },
  template: `

  <div class="flex flex-wrap mx-96">
    <ccu-icon class="m-4 w-16" v-for="icon in icons" :key="icon" :type="icon" size="xl" />
  </div>

  `,
});
