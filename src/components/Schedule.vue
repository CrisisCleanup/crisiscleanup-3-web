<template>
  <div class="flex flex-col items-center justify-center">
    <div :style="gridStyle" class="grid" v-if="shifts.length">
      <div class="grid-cell">
        <div class="flex items-center justify-start px-5">
          <AvailabilityCheckbox class="mr-3" />
          Available All the time
        </div>
      </div>
      <div class="grid-cell flex-col justify-center" v-for="day in days">
        <div class="flex flex-col items-center justify-center p-3">
          <AvailabilityCheckbox
            :value="getAvailabilityForDay(day)"
            @input="(availablity) => setAvailabilityForDay(day, availablity)"
          />
          <div class="capitalize">
            {{ day | moment('ddd') }}
          </div>
          <div class="capitalize">
            {{ day | moment('MM/DD') }}
          </div>
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
              <div class="mb-1">{{ shift.name }}</div>
              <div class="flex items-center">
                <ccu-icon
                  :alt="$t('actions.delete')"
                  size="small"
                  type="time"
                  class="mr-1"
                />
                <div class="my-1">
                  {{ [shift.start_time, 'HH:mm:ss'] | moment('hA') }} -
                  {{ [shift.end_time, 'HH:mm:ss'] | moment('hA') }}
                </div>
              </div>
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
        v-if="!hideCancel"
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
        :text="$t('~~Save Availability')"
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
import { getErrorMessage } from '../utils/errors';
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
    this.schedule = scheduleResponse.data;

    const weekStart = this.$moment.utc().startOf('week');
    const weekEnd = this.$moment.utc().endOf('week');

    const params = {
      shift_ids: this.shifts.map((shift) => shift.id).join(','),
      start_at: weekStart.toISOString(),
      end_at: weekEnd.toISOString(),
      schedule: this.schedule.id,
      email: this.email || this.currentUser.email,
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
      type: Number,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    hideCancel: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      availablityMatrix: {},
      schedule: null,
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
      this.$forceUpdate();
    },
    setAvailabilityForShift(shift, availablity) {
      this.availablityMatrix[shift.id] = {};

      this.days.forEach((day) => {
        this.availablityMatrix[shift.id][
          day.format('YYYY-MM-DD')
        ] = availablity;
      });
      this.$forceUpdate();
    },

    setAvailabilityForDay(day, availablity) {
      this.shifts.forEach((shift) => {
        this.availablityMatrix[shift.id][
          day.format('YYYY-MM-DD')
        ] = availablity;
      });
      this.$forceUpdate();
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

      let endMoment = moment.utc(day);
      endMoment.set({ hour: Number(endHour), minute: Number(endMinute) });

      if (startMoment > endMoment) {
        endMoment = moment.utc(day).add(1, 'd');
        endMoment.set({ hour: Number(endHour), minute: Number(endMinute) });
      }

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
      try {
        await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/user_schedule`,
          {
            email: this.email || this.currentUser.email,
            schedule,
          },
        );
        this.$emit('saved');
        await this.$toasted.success(this.$t('~~Saved Availability'));
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
  computed: {
    days() {
      if (this.schedule && this.schedule.days) {
        const results = this.schedule.days.map((day) => {
          return this.$moment(day);
        });
        results.sort((a, b) => a - b);
        return results;
      }
      return [];
    },
    gridStyle() {
      return {
        display: 'grid',
        'grid-template-columns': `210px repeat(${
          this.days.length ? this.days.length : 1
        }, 85px)`,
        'grid-template-rows': `80px repeat(${
          this.shifts.length ? this.shifts.length : 1
        }, 85px)`,
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
