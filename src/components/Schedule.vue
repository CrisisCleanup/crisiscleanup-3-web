<template>
  <div>
    <div :style="gridStyle" class="grid" v-if="shifts.length">
      <div class="grid-cell">
        <div class="flex items-center justify-start px-5">
          <AvailabilityCheckbox class="mr-3" />
          Available All the time
        </div>
      </div>
      <div class="grid-cell flex-col justify-center" v-for="day in days">
        <div class="flex flex-col items-center justify-center p-2">
          <AvailabilityCheckbox
            :value="getAvailabilityForDay(day)"
            @input="(availablity) => setAvailabilityForDay(day, availablity)"
          />
          <span class="capitalize">{{ day | moment('ddd') }}</span>
        </div>
      </div>

      <template v-for="shift in shifts">
        <div class="grid-cell">
          <div class="flex items-center justify-start px-5">
            <AvailabilityCheckbox
              :value="getAvailabilityForShift(shift)"
              @input="
                (availablity) => setAvailabilityForShift(shift, availablity)
              "
              class="mr-3"
            />
            <div class="flex-col flex items-start justify-center">
              <span>{{ shift.name }}</span>
              <span>{{ shift.start_time }} - {{ shift.end_time }}</span>
            </div>
          </div>
        </div>
        <div
          class="grid-cell flex-col justify-center items-center"
          v-for="day in days"
        >
          <AvailabilityCheckbox
            :value="getAvailability(shift, day)"
            @input="(availablity) => setAvailability(shift, day, availablity)"
          />
        </div>
      </template>
    </div>
    <div slot="footer" class="p-3 flex items-center justify-center">
      <base-button
        :action="
          () => {
            $emit('cancel');
          }
        "
        :text="$t('actions.cancel')"
        variant="outline"
        class="ml-2 p-3 px-6 text-xs"
      />
      <base-button
        variant="solid"
        :action="createSchedule"
        :text="$t('~~Create Schedule')"
        class="ml-2 p-3 px-6 text-xs"
      />
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { UserMixin } from '@/mixins';
import AvailabilityCheckbox from './AvailabilityCheckbox';
import { getQueryString } from '../utils/urls';
require('twix');
export default {
  name: 'Schedule',
  components: { AvailabilityCheckbox },
  mixins: [UserMixin],
  async mounted() {
    const scheduleResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/schedules/${this.scheduleId}`,
    );

    this.shifts = scheduleResponse.data.shifts;

    const weekStart = this.$moment.utc().startOf('week');
    const weekEnd = this.$moment.utc().endOf('week');

    const params = {
      shift_ids: this.shifts.map((shift) => shift.id).join(','),
      start_at: weekStart.toISOString(),
      end_at: weekEnd.toISOString(),
    };

    const response = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/user_schedule?${getQueryString(
        params,
      )}`,
    );
    this.availablityMatrix = response.data;
  },
  props: {
    scheduleId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      days: this.getCurrentWeekDays(),
      availablityMatrix: {},
      shifts: [],
      availability: {
        available: [],
        'available if necessary': [],
        neutral: [],
        unavailable: [],
      },
    };
  },
  methods: {
    getCurrentWeekDays() {
      const weekStart = this.$moment.utc().startOf('week');

      const days = [];
      for (let i = 0; i <= 6; i++) {
        days.push(this.$moment.utc(weekStart).add(i, 'days'));
      }

      return days;
    },
    setAvailability(shift, day, availablity) {
      if (this.availablityMatrix[shift.id]) {
        this.availablityMatrix[shift.id][
          day.format('YYYY-MM-DD')
        ] = availablity;
      } else {
        this.availablityMatrix[shift.id] = {
          [day.format('YYYY-MM-DD')]: availablity,
        };
      }
    },
    setAvailabilityForShift(shift, availablity) {
      this.availablityMatrix[shift.id] = {};

      this.days.forEach((day) => {
        this.availablityMatrix[shift.id][
          day.format('YYYY-MM-DD')
        ] = availablity;
      });
    },

    setAvailabilityForDay(day, availablity) {
      this.shifts.forEach((shift) => {
        this.availablityMatrix[shift.id][
          day.format('YYYY-MM-DD')
        ] = availablity;
      });
    },
    getAvailability(shift, day) {
      if (this.availablityMatrix[shift.id]) {
        return this.availablityMatrix[shift.id][day.format('YYYY-MM-DD')];
      }
      return null;
    },

    getAvailabilityForShift(shift) {
      if (this.availablityMatrix[shift.id]) {
        const availabilityValues = Object.values(
          this.availablityMatrix[shift.id],
        );
        if (
          availabilityValues.every((val, i, arr) => val === arr[0]) &&
          availabilityValues.length === this.days.length
        ) {
          return availabilityValues[0];
        }
        return null;
      }
      return null;
    },

    getAvailabilityForDay(day) {
      if (this.availablityMatrix) {
        const dayValues = Object.values(this.availablityMatrix);
        if (
          dayValues.every(
            (val, i, arr) =>
              val[day.format('YYYY-MM-DD')] ===
              arr[0][day.format('YYYY-MM-DD')],
          ) &&
          dayValues.length === this.shifts.length
        ) {
          return dayValues[0][day.format('YYYY-MM-DD')];
        }
        return null;
      }
      return null;
    },
    generateTimeslots(shift, day, availablity) {
      const [startHour, startMinute] = shift.start_time.split(':');
      const [endHour, endMinute] = shift.end_time.split(':');

      const startMoment = moment.utc(day);
      startMoment.set({ hour: Number(startHour), minute: Number(startMinute) });

      const endMoment = moment.utc(day);
      endMoment.set({ hour: Number(endHour), minute: Number(endMinute) });

      const intervals = startMoment.twix(endMoment).toArray(30, 'minutes');
      const timeslots = [];
      for (let i = 0; i < intervals.length - 1; i++) {
        timeslots.push({
          start_at: intervals[i].toISOString(),
          end_at: intervals[i + 1].toISOString(),
        });
      }
      this.availability[availablity].push(...timeslots);
    },
    async createSchedule() {
      Object.keys(this.availablityMatrix).forEach((shiftId) => {
        const shift = this.shifts.find((s) => {
          return Number(s.id) === Number(shiftId);
        });

        Object.entries(this.availablityMatrix[shiftId]).forEach(
          ([key, value]) => {
            this.generateTimeslots(shift, moment.utc(key, 'YYYY-MM-DD'), value);
          },
        );
      });

      const schedule = Object.keys(this.availability).map((availability) => {
        return {
          availability,
          timeslots: this.availability[availability],
        };
      });
      await this.$http.post(
        `${process.env.VUE_APP_API_BASE_URL}/user_schedule`,
        {
          user: this.currentUser.id,
          schedule,
        },
      );
      this.$emit('saved');
    },
  },
  computed: {
    gridStyle() {
      return {
        display: 'grid',
        'grid-template-columns': '2.5fr repeat(7, 1fr)',
        'grid-template-rows': `1fr repeat(${this.shifts.length}, 1.1fr)`,
      };
    },
  },
};
</script>

<style scoped>
.grid {
  grid-gap: 1px;
  @apply bg-white;
}
.grid-cell {
  @apply border flex;
  box-sizing: content-box;
  width: 100%;
  height: 100%;
}
</style>
