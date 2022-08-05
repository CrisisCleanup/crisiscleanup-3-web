import type { Component } from 'vue';
import MessageBox from '@/components/dialogs/MessageBox.vue';
import MessageResponseDialog from '@/components/dialogs/MessageResponseDialog.vue';
import SelectionDialog from '@/components/dialogs/SelectionDialog.vue';
import ComponentDialog from '@/components/dialogs/ComponentDialog.vue';

export interface UseDialogProps {
  component: Component;
  props?: Record<string, unknown>;
}

export interface UseDialogReturn {
  confirm: () => boolean;
  cancel: () => void;
  reveal: (...args) => any;
}

/**
 * NOTE: This hook is stubbed out temporarily. Doesn't work!
 * @param options
 */
export function useDialog(options: UseDialogProps): UseDialogReturn {
  const { component } = options;
  console.log(`useDialog stub for ${component.name}`);
  return {
    confirm: () => true,
    cancel: () => {},
    reveal: (...args) => null,
  };
}

const confirm = useDialog({ component: MessageBox });
const prompt = useDialog({ component: MessageResponseDialog });
const selection = useDialog({ component: SelectionDialog });
const component = useDialog({ component: ComponentDialog });

export default () => {
  return {
    confirm,
    prompt,
    selection,
    component,
  };
};
