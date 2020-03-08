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

  <div class="flex flex-wrap">
    <div v-for="icon in icons" class="flex flex-col border-2 text-center">
      <ccu-icon class="m-8 align-self-center" :key="icon" :type="icon" size="xl" />
      <p>{{icon}}</p>
    </div>
  </div>

  `,
});
