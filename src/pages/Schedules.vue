<template>
  <div class="p-10">
    <!--    <Schedule />-->
    <CreateSchedule />
    <div v-for="schedule in schedules">
      <div
        class="my-4 mx-2 p-4 bg-white shadow h-auto content-center flex-wrap cursor-pointer w-108"
      >
        <div class="text-base">{{ schedule.name }}</div>
        <div>{{ schedule.description }}</div>
        <div class="mt-4">{{ $t('~~Shifts:') }}</div>
        <div v-for="shift in schedule.shifts">
          <div class="flex-col flex items-start justify-center">
            <span>{{ shift.name }}</span>
            <span>{{ shift.start_time }} - {{ shift.end_time }}</span>
          </div>
        </div>
        <base-button
          class="my-1 text-primary-dark"
          type="link"
          :text="$t('~~+ Add Shift')"
          :alt="$t('~~+ Add Shift')"
          :action="
            () => {
              showAddShiftModal = true;
              currentSchedule = { ...schedule };
            }
          "
        />
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
            this.showAvailabilityModal = false;
            this.currentSchedule = null;
          }
        "
      />
      <div slot="footer"></div>
    </modal>
    <modal
      v-if="showAddShiftModal"
      modal-classes="bg-white max-w-sm shadow"
      closeable
      :title="$t('~~Add Shift')"
      @close="
        () => {
          this.showAddShiftModal = false;
          this.currentSchedule = null;
          this.shift = {};
        }
      "
    >
      <div class="text-justify flex flex-col p-3 justify-center">
        <div class="mb-2">
          {{ $t('~~Name') }}
        </div>
        <base-input
          v-model="shift.name"
          type="text"
          class="input"
          size="large"
          :placeholder="$t('Name')"
          required
        />

        <div class="my-2">
          {{ $t('~~Time') }}
        </div>
        <div class="flex items-center justify-between">
          <VueTimepicker
            input-class="time-input"
            :minute-interval="30"
            v-model="shift.start_time"
          ></VueTimepicker>
          <div>TO</div>
          <VueTimepicker
            input-class="time-input"
            :minute-interval="30"
            v-model="shift.end_time"
          ></VueTimepicker>
        </div>
      </div>
      <div slot="footer" class="p-3 flex items-center justify-center">
        <base-button
          :action="
            () => {
              this.showAddShiftModal = false;
              this.currentSchedule = null;
              this.shift = {};
            }
          "
          :text="$t('actions.cancel')"
          variant="outline"
          class="ml-2 p-3 px-6 text-xs"
        />
        <base-button
          variant="solid"
          :action="createShift"
          :text="$t('~~Create Shift')"
          class="ml-2 p-3 px-6 text-xs"
        />
      </div>
    </modal>
  </div>
</template>

<script>
import VueTimepicker from 'vue2-timepicker';
import Schedule from '../components/Schedule';
import CreateSchedule from '../components/CreateSchedule';
import 'vue2-timepicker/dist/VueTimepicker.css';
import { getErrorMessage } from '../utils/errors';
export default {
  name: 'Schedules',
  components: { CreateSchedule, Schedule, VueTimepicker },
  data() {
    return {
      schedules: [],
      shifts: [],
      shift: {},
      showAddShiftModal: false,
      showAvailabilityModal: false,
      currentSchedule: null,
    };
  },
  async mounted() {
    await this.loadSchedules();
  },
  methods: {
    async loadSchedules() {
      const schedulesResponse = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/schedules`,
      );
      this.schedules = schedulesResponse.data.results;
    },
    async createShift() {
      try {
        const response = await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/shifts`,
          {
            name: this.shift.name,
            start_time: `${this.shift.start_time.HH}:${this.shift.start_time.mm}`,
            end_time: `${this.shift.end_time.HH}:${this.shift.end_time.mm}`,
          },
        );
        const shift = response.data;
        await this.$http.patch(
          `${process.env.VUE_APP_API_BASE_URL}/schedules/${this.currentSchedule.id}`,
          {
            ...this.currentSchedule,
            shift_ids: [...this.currentSchedule.shift_ids, shift.id],
          },
        );

        this.showAddShiftModal = false;
        this.currentSchedule = null;
        this.shift = {};
        await this.$toasted.success(this.$t('~~Created Shift'));
        await this.loadSchedules();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
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
