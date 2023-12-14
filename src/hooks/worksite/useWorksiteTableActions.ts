import type { Ref } from 'vue';
import useDialogs from '@/hooks/useDialogs';
import UnclaimCases from '@/components/UnclaimCases.vue';
import { i18n } from '@/main';
import Worksite from '@/models/Worksite';

export default (
  selectedTableItems: Ref<Set<number>>,
  onComplete: () => void,
) => ({
  async showUnclaimModal() {
    const { component } = useDialogs();

    let options: Record<string, boolean> | undefined = {};
    const response = await component({
      title: i18n.global.t('actions.unclaim_cases'),
      component: UnclaimCases,
      classes: 'w-full h-48 overflow-auto p-3',
      modalClasses: 'bg-white max-w-3xl shadow',
      props: {
        selectedTableItems,
      },
      listeners: {
        onUnclaimSelect(payload: Record<string, boolean>) {
          options = payload;
        },
      },
    });

    if (response === 'ok' && options) {
      const promises = [] as Array<Promise<never>>;
      for (const id of selectedTableItems.value) {
        promises.push(
          Worksite.api().unclaimWorksite(
            id,
            [],
            options?.updateStatusOnUnclaim ? 'open_unassigned' : null,
          ),
        );
      }

      await Promise.allSettled(promises);
    }

    onComplete();
  },
});
