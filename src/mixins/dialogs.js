import { create } from 'vue-modal-dialogs';
import MessageBox from '@/components/dialogs/MessageBox';
import MessageResponseDialog from '@/components/dialogs/MessageResponseDialog';
import SelectionDialog from '@/components/dialogs/SelectionDialog';
import ComponentDialog from '@/components/dialogs/ComponentDialog';
const confirm = create(MessageBox);
const prompt = create(MessageResponseDialog);
const selection = create(SelectionDialog);
const component = create(ComponentDialog);

export const DialogsMixin = {
  created() {
    this.$confirm = confirm;
    this.$component = component;
    this.$prompt = prompt;
    this.$selection = selection;
  },
};
