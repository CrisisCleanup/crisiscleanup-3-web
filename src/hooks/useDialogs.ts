import { openDialog } from 'vue3-promise-dialog';

import ComponentDialog from '../components/dialogs/ComponentDialog.vue';
import MessageBox from '../components/dialogs/MessageBox.vue';
import MessageResponseDialog from '../components/dialogs/MessageResponseDialog.vue';
import SelectionDialog from '../components/dialogs/SelectionDialog.vue';

async function component(props: any) {
  return await openDialog(ComponentDialog, props);
}

async function confirm(props: any) {
  return await openDialog(MessageBox, props);
}

async function prompt(props: any) {
  return await openDialog(MessageResponseDialog, props);
}

async function selection(props: any) {
  return await openDialog(SelectionDialog, props);
}

export default () => {
  return {
    confirm,
    prompt,
    selection,
    component,
  };
};
