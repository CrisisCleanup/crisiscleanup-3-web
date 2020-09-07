import ProgressButton from '@/components/buttons/ProgressButton';

export default {
  title: 'Elements/Buttons/ProgressButton',
  component: ProgressButton,
  args: {
    variant: 'solid',
    size: 'lg',
    reverse: false,
  },
};

const Basic = (args, { argTypes }) => ({
  components: { ProgressButton },
  props: Object.keys(argTypes),
  data() {
    return {
      currentVal: 0,
      dir: 1,
    };
  },
  template: `
    <div>
      <ProgressButton :variant="variant" :size="size" :value="currentVal" :total="total" :reverse="reverse">
        Loading {{currentVal}}%
      </ProgressButton>
    </div>
  `,
  async mounted() {
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (this.currentVal >= 100) {
        this.dir = -1;
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      if (this.currentVal <= 0) {
        this.dir = 1;
      }
      this.currentVal += 10 * this.dir;
    }
  },
});

export const withDynamicProgress = Basic.bind({});
withDynamicProgress.args = {};

export const withTotalAndStep = Basic.bind({});
withTotalAndStep.args = {
  ...Basic.args,
  total: 200,
};

export const withTotalStepReverse = Basic.bind({});
withTotalAndStep.args = {
  reverse: true,
};
