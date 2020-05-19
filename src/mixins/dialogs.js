import { create } from 'vue-modal-dialogs';
import MessageBox from '@/components/dialogs/MessageBox';
import MessageResponseDialog from '@/components/dialogs/MessageResponseDialog';
import SelectionDialog from '@/components/dialogs/SelectionDialog';
const confirm = create(MessageBox);
const prompt = create(MessageResponseDialog);
const selection = create(SelectionDialog);

export const DialogsMixin = {
  created() {
    this.$confirm = confirm;
    this.$prompt = prompt;
    this.$selection = selection;
  },
};
