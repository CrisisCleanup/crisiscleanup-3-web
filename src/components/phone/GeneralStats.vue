<template>
  <div class="flex flex-col">
    <base-text class="p-3" variant="h3">{{
      $t('phoneDashboard.general_statistics')
    }}</base-text>
    <hr />
    <div class="flex flex-col bg-crisiscleanup-light-grey">
      <div class="flex p-2 items-center justify-between">
        <base-text>{{ $t('phoneDashboard.on_phone_now') }}</base-text>
        {{ stats.active || 0 }}
      </div>
      <div class="flex p-2 items-center justify-between">
        <base-text>{{ $t('phoneDashboard.remaining_callbacks') }}</base-text>
        <base-button
          type="link"
          class="text-primary-dark underline"
          :text="remainingCallbacks || 0"
          :action="showOutboundsModal"
        ></base-button>
      </div>
      <div class="flex p-2 items-center justify-between">
        <base-text>{{ $t('phoneDashboard.remaining_calldowns') }}</base-text>
        0
      </div>
      <div class="flex p-2 items-center justify-between">
        <base-text>{{ $t('phoneDashboard.agents_online') }}</base-text>
        {{ agentsOnline || 0 }}
      </div>
      <div class="flex p-2 items-center justify-between">
        <ccu-icon with-text type="phone-plus" size="xl">
          <base-text>{{ $t('phoneDashboard.total_people_waiting') }}</base-text>
        </ccu-icon>
        {{ stats.inQueue || 0 }}
      </div>
    </div>
  </div>
</template>

<script>
import { ConnectFirstMixin, DialogsMixin } from '@/mixins';
import PhoneOutbound from '@/models/PhoneOutbound';
import { makeTableColumns } from '@/utils/table';
import Incident from '@/models/Incident';
import { EventBus } from '@/event-bus';
import { formatNationalNumber } from '@/filters';

export default {
  name: 'GeneralStats',
  mixins: [ConnectFirstMixin, DialogsMixin],
  data() {
    return {
      remainingCallbacks: 0,
      agentsOnline: 0,
    };
  },
  created() {
    setInterval(() => {
      this.updateCallbacks();
    }, 30000);
    EventBus.$on('phone:agents_online', (count) => {
      this.agentsOnline = count;
    });
  },
  async mounted() {
    await this.updateCallbacks();
  },
  methods: {
    async showOutboundsModal() {
      await this.$component({
        title: this.$t(`phoneDashboard.remaining_outbounds`),
        component: 'AjaxTable',
        classes: 'w-full h-96',
        modalClasses: 'bg-white max-w-3xl shadow',
        id: 'outbound_list',
        listeners: {
          rowClick: (payload) => {
            EventBus.$emit('phone_component:close');
            EventBus.$emit('modal_component:close', 'outbound_list');
            EventBus.$emit('phone_component:open', 'dialer');
            EventBus.$emit(
              'dialer:set_phone_number',
              formatNationalNumber(payload.phone_number),
            );
          },
        },
        props: {
          columns: makeTableColumns([
            ['id', '0.5fr', this.$t('phoneDashboard.id')],
            ['phone_number', '1fr', this.$t('phoneDashboard.phone_number')],
            ['number_of_inbound_calls', '0.5fr', this.$t('phoneDashboard.calls')],
            [
              'location',
              '1fr',
              this.$t('phoneDashboard.location'),
              {
                transformer: (_, item) => {
                  return `${item.location_name || ''} ${item.state_name}`;
                },
              },
            ],
            [
              'incident_id',
              '1fr',
              this.$t('phoneDashboard.incident'),
              {
                transformer: (field) => {
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
              this.$t('phoneDashboard.last_called_at'),
              {
                transformer: (field) => {
                  return this.$moment(field).fromNow();
                },
              },
            ],
          ]),
          url: `${process.env.VUE_APP_API_BASE_URL}/phone_outbound`,
          query: {
            completion__lt: 1,
            filter_ani: 1,
            locked_at__isnull: true,
          },
        },
      });
    },

    async updateCallbacks() {
      this.remainingCallbacks =
        await PhoneOutbound.api().getRemainingCallbackCount('');
      this.$emit('onRemainingCallbacks', this.remainingCallbacks);
    },
  },
};
</script>

<style scoped></style>
