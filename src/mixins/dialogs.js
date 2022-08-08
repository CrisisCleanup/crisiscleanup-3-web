import useDialogs from '@/use/useDialogs';

export const DialogsMixin = {
  created() {
    const { confirm, component, prompt, selection } = useDialogs();
    this.$confirm = confirm;
    this.$component = component;
    this.$prompt = prompt;
    this.$selection = selection;
  },
};
