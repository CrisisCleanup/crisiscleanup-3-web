import { create } from 'vue-modal-dialogs';
import MessageBox from '@/components/dialogs/MessageBox.vue';
import MessageResponseDialog from '@/components/dialogs/MessageResponseDialog.vue';
import SelectionDialog from '@/components/dialogs/SelectionDialog.vue';
import ComponentDialog from '@/components/dialogs/ComponentDialog.vue';
const confirm = create(MessageBox as any);
const prompt = create(MessageResponseDialog as any);
const selection = create(SelectionDialog as any);
const component = create(ComponentDialog as any);

export default () => {
  return {
    confirm,
    prompt,
    selection,
    component,
  };
};
