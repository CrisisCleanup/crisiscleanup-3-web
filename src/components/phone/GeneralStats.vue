<template>
  <div class="flex flex-col">
    <base-text class="p-3" variant="h3">{{
      $t('phoneDashboard.general_statistics')
    }}</base-text>
    <hr />
    <div class="flex flex-col bg-crisiscleanup-light-grey">
      <div class="flex p-2 items-center justify-between">
        <base-text>{{ $t('~~On Phone Now') }}</base-text>
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

export default {
  name: 'GeneralStats',
  mixins: [ConnectFirstMixin, DialogsMixin],
  data() {
    return {
      remainingCallbacks: 0,
    };
  },
  created() {
    setInterval(() => {
      this.updateCallbacks();
    }, 30000);
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
        props: {
          columns: makeTableColumns([
            ['id', '0.5fr', this.$t('~~ID')],
            ['phone_number', '1fr', this.$t('~~Phone Number')],
            ['number_of_inbound_calls', '0.5fr', this.$t('~~Calls')],
            [
              'location',
              '1fr',
              this.$t('~~Location'),
              {
                transformer: (_, item) => {
                  return `${item.location_name || ''} ${item.state_name}`;
                },
              },
            ],
            [
              'incident_id',
              '1fr',
              this.$t('~~Incident'),
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
              this.$t('~~Last Called At'),
              {
                transformer: (field) => {
                  return this.$moment(field).fromNow();
                },
              },
            ],
          ]),
          url: `${process.env.VUE_APP_API_BASE_URL}/phone_outbound`,
          query: {
            incident_id: this.currentIncidentId,
            completion__lt: 1,
            filter_ani: 1,
            locked_at__isnull: true,
          },
        },
      });
    },

    async updateCallbacks() {
      this.remainingCallbacks =
        await PhoneOutbound.api().getRemainingCallbackCount(
          this.currentIncidentId,
        );
      this.$emit('onRemainingCallbacks', this.remainingCallbacks);
    },
  },
};
</script>

<style scoped></style>
