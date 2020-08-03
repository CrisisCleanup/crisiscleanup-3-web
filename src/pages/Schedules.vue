<template>
  <div class="p-10">
    <CreateSchedule @reload="loadSchedules" />
    <div v-for="schedule in schedules">
      <div
        class="my-4 mx-2 p-4 bg-white shadow h-auto content-center flex-wrap cursor-pointer w-108"
      >
        <div class="flex items-center justify-between">
          <div class="text-base">{{ schedule.name }}</div>
          <CreateSchedule @reload="loadSchedules" :schedule="schedule">
            <ccu-icon
              slot="trigger"
              :alt="$t('actions.edit')"
              size="sm"
              type="edit"
              class="mr-2"
            />
          </CreateSchedule>
        </div>
        <div>{{ schedule.description }}</div>
        <base-button
          class="my-1 text-primary-dark"
          type="link"
          :text="$t('~~Set Availability')"
          :alt="$t('~~Set Availability')"
          :action="
            () => {
              showAvailabilityModal = true;
              currentSchedule = { ...schedule };
            }
          "
        />
      </div>
    </div>
    <modal
      v-if="showAvailabilityModal"
      modal-classes="bg-white max-w-6xl shadow"
      closeable
      :title="$t('~~Set Availability')"
      @close="
        () => {
          this.showAvailabilityModal = false;
          this.currentSchedule = null;
        }
      "
    >
      <AvailabiltyLegend class="bg-crisiscleanup-light-grey p-2" />
      <Schedule
        :schedule-id="currentSchedule.id"
        class="p-3"
        @cancel="
          () => {
            this.showAvailabilityModal = false;
            this.currentSchedule = null;
          }
        "
        @saved="
          () => {
            showAvailabilityModal = false;
            currentSchedule = null;
          }
        "
      />
      <div slot="footer"></div>
    </modal>
  </div>
</template>

<script>
import Schedule from '../components/Schedule';
import CreateSchedule from '../components/CreateSchedule';
import AvailabiltyLegend from './AvailabiltyLegend';
export default {
  name: 'Schedules',
  components: { AvailabiltyLegend, CreateSchedule, Schedule },
  data() {
    return {
      schedules: [],
      showAvailabilityModal: false,
      currentSchedule: null,
    };
  },
  async mounted() {
    await this.loadSchedules();
  },
  methods: {
    customFormatter(date) {
      return this.$moment(date).format('YYYY-MM-DD');
    },
    async loadSchedules() {
      const schedulesResponse = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/schedules`,
      );
      this.schedules = schedulesResponse.data.results;
    },
  },
};
</script>
