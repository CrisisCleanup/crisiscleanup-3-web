<template>
  <div class="p-10">
    <CreateSchedule @reload="loadSchedules" />
    <div v-for="schedule in schedules">
      <div
        class="my-4 mx-2 p-4 bg-white shadow h-auto content-center flex-wrap cursor-pointer w-108"
      >
        <div class="text-base">{{ schedule.name }}</div>
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
      modal-classes="bg-white max-w-4xl shadow"
      closeable
      :title="$t('~~Set Availability')"
      @close="
        () => {
          this.showAvailabilityModal = false;
          this.currentSchedule = null;
        }
      "
    >
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
import 'vue2-timepicker/dist/VueTimepicker.css';
export default {
  name: 'Schedules',
  components: { CreateSchedule, Schedule },
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

<style>
.time-input {
  @apply text-base border border-crisiscleanup-dark-100 outline-none p-2 mb-2 resize-none w-full;
  height: 2.5rem !important;
}
</style>
