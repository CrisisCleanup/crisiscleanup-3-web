import BaseIcon from '@/components/BaseIcon';
import { ICONS, ICON_SIZES } from '@/constants';

export default {
  title: 'Basics/BaseIcon',
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
  <div class="flex flex-wrap">
    <div v-for="size in sizes" class="flex flex-col border-2 text-center justify-end">
      <ccu-icon class="m-6" :key="size" :size="size" :type="icons.trash"/>
      <p>{{ size }}</p>
    </div>
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
