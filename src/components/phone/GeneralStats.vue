<template>
  <div class="flex flex-col">
    <base-text
      class="py-2 px-3"
      variant="h3"
      data-testid="testGeneralStatisticsContent"
    >
      {{ $t('phoneDashboard.general_statistics') }}
    </base-text>
    <base-text
      class="py-2 px-3"
      variant="h4"
      data-testid="testStatsDelayedContent"
    >
      {{ $t('phoneDashboard.stats_delayed') }}
    </base-text>
    <hr />
    <div class="flex flex-col">
      <div
        class="flex p-2 items-center justify-between"
        data-testid="testOnPhoneNowDiv"
      >
        <base-text>{{ $t('phoneDashboard.on_phone_now') }}</base-text>
        {{ stats.active || 0 }}
      </div>
      <div
        class="flex p-2 items-center justify-between"
        data-testid="testRemainingCallbacksDiv"
      >
        <base-text>{{ $t('phoneDashboard.remaining_callbacks') }}</base-text>
        <base-button
          type="link"
          class="text-primary-dark underline"
          data-testid="testShowOutboundsModalButton"
          :text="remainingCallbacks || 0"
          :alt="remainingCallbacks || 0"
          :action="showOutboundsModal"
        ></base-button>
      </div>
      <div
        class="flex p-2 items-center justify-between"
        data-testid="testRemainingCalldownsDiv"
      >
        <base-text>{{ $t('phoneDashboard.remaining_calldowns') }}</base-text>
        <base-button
          type="link"
          class="text-primary-dark underline"
          data-testid="testShowOutboundsModalCalldownButton"
          :text="remainingCalldowns || 0"
          :alt="remainingCalldowns || 0"
          :action="() => showOutboundsModal('calldown')"
        ></base-button>
      </div>
      <div
        class="flex p-2 items-center justify-between"
        data-testid="testAgentsOnlineDiv"
      >
        <base-text>{{ $t('phoneDashboard.agents_online') }}</base-text>
        {{ agentsOnline || 0 }}
      </div>
      <div
        v-for="queue in statsPerQueue"
        :key="queue.queueId"
        :data-testid="`testAgentsOnlineQueue${queue.queueId}Div`"
        class="flex p-2 items-center justify-between"
      >
        <ccu-icon
          with-text
          :alt="$t('phoneDashboard.total_people_waiting')"
          type="phone-plus"
          size="xl"
        >
          <base-text
            >{{ $t('phoneDashboard.total_people_waiting') }}({{
              queue.language
            }})</base-text
          >
        </ccu-icon>
        {{ queue.inQueue || 0 }}
      </div>
    </div>
  </div>
  <PhoneOutboundModal
    v-if="showingOutboundsModal"
    :type="showingOutboundsModalType"
    @close="showingOutboundsModal = false"
  />
</template>

<script lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue';
import PhoneOutbound from '@/models/PhoneOutbound';
import useEmitter from '@/hooks/useEmitter';
import useConnectFirst from '@/hooks/useConnectFirst';
import Language from '@/models/Language';
import PhoneOutboundModal from '@/components/modals/PhoneOutboundModal.vue';

export default defineComponent({
  name: 'GeneralStats',
  components: {
    PhoneOutboundModal,
  },
emits: ['onRemainingCallbacks', 'onRemainingCalldowns'],
  setup(props, context) {
    const { emitter } = useEmitter();

    const remainingCallbacks = ref(0);
    const remainingCalldowns = ref(0);
    const agentsOnline = ref(0);
    const showingOutboundsModal = ref(false);
    const showingOutboundsModalType = ref('callback');

    function showOutboundsModal(type = 'callback') {
      showingOutboundsModal.value = true;
      showingOutboundsModalType.value = type;
    }

    async function updateCallbacks() {
      remainingCallbacks.value =
        await PhoneOutbound.api().getRemainingCallbackCount('');
      remainingCalldowns.value =
        await PhoneOutbound.api().getRemainingCalldownCount('');
      context.emit('onRemainingCallbacks', remainingCallbacks.value);
      context.emit('onRemainingCalldowns', remainingCalldowns.value);
    }

    onBeforeMount(() => {
      setInterval(() => {
        updateCallbacks();
      }, 30_000);
      emitter.on('phone:agents_online', (count: any) => {
        agentsOnline.value = count;
      });
    });

    onMounted(() => {
      updateCallbacks();
    });

    const { gateStats, stats } = useConnectFirst(context);
    const availableQueues = {
      7: import.meta.env.VITE_APP_SPANISH_PHONE_GATEWAY,
      2: import.meta.env.VITE_APP_ENGLISH_PHONE_GATEWAY,
    };

    const statsPerQueue = computed(() => {
      return Object.entries(availableQueues).map(([key, value]) => {
        const statistics = gateStats.value.find(
          (element: Record<string, any>) => {
            return String(value) === String(element.queueId);
          },
        );
        if (statistics) {
          return { ...statistics, language: Language.find(key)?.name_t };
        }

        return { language: Language.find(key)?.name_t };
      });
    });

    return {
      remainingCallbacks,
      remainingCalldowns,
      agentsOnline,
      showOutboundsModal,
      statsPerQueue,
      gateStats,
      stats,
      showingOutboundsModal,
      showingOutboundsModalType,
    };
  },
});
</script>

<style scoped></style>
