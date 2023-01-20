import { openDialog } from 'vue3-promise-dialog';

import type { DefineComponent } from 'vue';
import ComponentDialog from '../components/dialogs/ComponentDialog.vue';
import MessageBox from '../components/dialogs/MessageBox.vue';
import MessageResponseDialog from '../components/dialogs/MessageResponseDialog.vue';
import SelectionDialog from '../components/dialogs/SelectionDialog.vue';
import OrganizationApprovalDialog from '../components/dialogs/OrganizationApprovalDialog.vue';

async function component(props: Record<string, any>) {
  return openDialog(ComponentDialog, props);
}

async function confirm(props: Record<string, any>) {
  return openDialog(MessageBox, props);
}

async function prompt(props: Record<string, any>): Promise<{key: string; response: string}> {
  return openDialog(MessageResponseDialog, props);
}

async function selection(props: Record<string, any>) {
  return openDialog(SelectionDialog, props);
}

async function organizationApproval(props: Record<string, any>) {
  return openDialog(OrganizationApprovalDialog, props);
}

/**
 * For backwards compatibility with vue-modal-dialogs
 * @see https://www.npmjs.com/package/vue-modal-dialogs#modaldialogscreate
 * @deprecated Use useDialogs instead
 */
function create<C extends DefineComponent>(
  component: C,
  ...props: string[]
): (...args: any[]) => Promise<ReturnType<typeof openDialog>> {
  return async (_props: InstanceType<C>['$props'] | unknown[]) => {
    if (Array.isArray(_props)) {
      const propsAsObj = props.reduce<Record<string, any>>((acc, prop, i) => {
        acc[prop] = (_props as unknown[])[i];
        return acc;
      }, {});
      _props = propsAsObj as InstanceType<C>['$props'];
    }

    return openDialog(component, _props);
  };
}

export default () => {
  return {
    confirm,
    prompt,
    selection,
    component,
    organizationApproval,
    create,
  };
};
