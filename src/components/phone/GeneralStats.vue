<template>
  <div class="flex flex-col">
    <base-text
      class="py-2 px-3"
      variant="h3"
      data-testid="testGeneralStatisticsContent"
    >
      {{$t('phoneDashboard.general_statistics')}}
    </base-text>
    <base-text
      class="py-2 px-3"
      variant="h4"
      data-testid="testStatsDelayedContent"
    >
      {{$t('phoneDashboard.stats_delayed')}}
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
        :data-testid="`testAgentsOnlineQueue${queue.queueId}Div`"
        :key="queue.queueId"
        class="flex p-2 items-center justify-between"
      >
        <ccu-icon with-text type="phone-plus" size="xl">
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
</template>

<script lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import PhoneOutbound from '../../models/PhoneOutbound';
import { makeTableColumns } from '../../utils/table';
import Incident from '../../models/Incident';
import useEmitter from '../../hooks/useEmitter';
import { formatNationalNumber } from '../../filters';
import useConnectFirst from '../../hooks/useConnectFirst';
import useDialogs from '../../hooks/useDialogs';
import AjaxTable from '../AjaxTable.vue';
import Language from '@/models/Language';

export default defineComponent({
  name: 'GeneralStats',
  setup(props, context) {
    const { component } = useDialogs();
    const { emitter } = useEmitter();

    const remainingCallbacks = ref(0);
    const remainingCalldowns = ref(0);
    const agentsOnline = ref(0);

    const { t } = useI18n();

    async function showOutboundsModal(type = 'callback') {
      await component({
        title: t(`phoneDashboard.remaining_outbounds`),
        component: AjaxTable,
        classes: 'w-full h-96',
        modalClasses: 'bg-white max-w-3xl shadow',
        id: 'outbound_list',
        listeners: {
          rowClick(payload: Record<string, any>) {
            emitter.emit('phone_component:close');
            emitter.emit('modal_component:close', 'outbound_list');
            emitter.emit('phone_component:open', 'dialer');
            emitter.emit(
              'dialer:set_phone_number',
              formatNationalNumber(payload.phone_number),
            );
          },
        },
        props: {
          columns: makeTableColumns([
            ['id', '0.5fr', t('phoneDashboard.id')],
            ['phone_number', '1fr', t('phoneDashboard.phone_number')],
            ['number_of_inbound_calls', '0.5fr', t('phoneDashboard.calls')],
            [
              'location',
              '1fr',
              t('phoneDashboard.location'),
              {
                transformer: (_: string, item: PhoneOutbound) =>
                  `${item.location_name || ''} ${item.state_name}`,
              },
            ],
            [
              'incident_id',
              '1fr',
              t('phoneDashboard.incident'),
              {
                transformer(field: any) {
                  const incident = Incident.find(field[0]);
                  if (incident) {
                    return `${incident.name}`;
                  }

                  return '';
                },
              },
            ],
            [
              'updated_at',
              '1fr',
              t('phoneDashboard.last_called_at'),
              {
                transformer(field: any) {
                  return moment(field).fromNow();
                },
              },
            ],
          ]),
          url: `${import.meta.env.VITE_APP_API_BASE_URL}/phone_outbound`,
          query: {
            completion__lt: 1,
            filter_ani: 1,
            locked_at__isnull: true,
            call_type: type,
          },
        },
      });
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
    };
  },
});
</script>

<style scoped></style>
