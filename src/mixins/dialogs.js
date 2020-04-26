import { create } from 'vue-modal-dialogs';
import MessageBox from '@/components/dialogs/MessageBox';
const confirm = create(MessageBox);

export const DialogsMixin = {
  created() {
    this.$confirm = confirm;
  },
};
