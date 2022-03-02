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
        props: {
          columns: makeTableColumns([['id'], ['phone_number'], ['updated_at']]),
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
