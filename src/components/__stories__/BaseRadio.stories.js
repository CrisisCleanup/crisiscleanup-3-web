import BaseRadio from '@/components/BaseRadio';

export default {
  title: 'Basics/BaseRadio',
  component: BaseRadio,
};

export const withBasics = () => ({
  data() {
    return {
      radioValue: '',
    };
  },
  template: `<base-radio name="My Radio" label="radio1" :value="radioValue" @change="radioValue = $event"/>`,
});
