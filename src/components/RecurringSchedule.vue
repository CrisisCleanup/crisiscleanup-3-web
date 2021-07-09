<template>
  <div>
    <form
      v-if="showSchedule"
      style="z-index: 1001"
      class="p-2 border"
      :class="containerClass"
      @change="logChange"
    >
      <div>
        <div>
          <form-select
            v-model="frequency"
            :options="[
              $t('recurringSchedule.daily'),
              $t('recurringSchedule.weekly'),
            ]"
            indicator-icon="caret-down"
            select-classes="h-10 border bg-white text-sm"
            @input="logChange"
          />
        </div>
        <div class="daily" v-if="frequency === $t('recurringSchedule.daily')">
          <base-radio
            class="mr-10 pt-4"
            :name="$t('recurringSchedule.days')"
            :label="$t('recurringSchedule.days')"
            :value="dailyOption"
            @change="
              (value) => {
                dailyOption = value;
                logChange();
              }
            "
          >
            <div class="flex items-center">
              {{ $t('recurringSchedule.every') }}
              <input
                class="
                  w-10
                  border border-crisiscleanup-dark-100
                  placeholder-crisiscleanup-dark-200
                  outline-none
                  mx-2
                  text-center
                "
                v-model="dayInterval"
              />
              {{ $t('recurringSchedule.day_s') }}
            </div>
          </base-radio>
          <base-radio
            class="mr-10 py-2"
            :name="$t('recurringSchedule.every_weekday')"
            :label="$t('recurringSchedule.every_weekday')"
            :value="dailyOption"
            @change="
              (value) => {
                dailyOption = value;
                logChange();
              }
            "
          />
        </div>
        <div class="weekly" v-if="frequency === $t('recurringSchedule.weekly')">
          <div class="py-2">
            {{ $t('recurringSchedule.recur_every') }}
            <input
              class="
                w-10
                border border-crisiscleanup-dark-100
                placeholder-crisiscleanup-dark-200
                outline-none
                mx-2
                text-center
              "
              v-model="weekInterval"
              @input="logChange"
            />
            {{ $t('recurringSchedule.weeks_on') }}
          </div>

          <div class="flex flex-wrap">
            <div v-for="(day, key) in daysOfWeek" :key="key" class="p-1 w-24">
              <base-checkbox v-model="selectedDays[key]" @input="logChange">
                {{ key }}
              </base-checkbox>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-start border w-full">
          <ccu-icon
            class="h-10"
            type="calendar"
            size="xl"
            :alt="$t('recurringSchedule.calendar')"
          />
          <datepicker
            input-class="h-10 p-1 outline-none w-full text-sm cursor-pointer"
            wrapper-class="flex-grow"
            :format="customFormatter"
            :placeholder="$t('recurringSchedule.select_end_date')"
            v-model="endDate"
            @input="logChange"
          ></datepicker>
        </div>
      </div>
    </form>
    <base-button
      v-else
      text-variant="h3"
      @click.native="showSchedule = true"
      class="text-primary-dark"
      >{{ $t('recurringSchedule.add_schedule') }}</base-button
    >
  </div>
</template>

<script>
import { RRule } from 'rrule';
import { isEqual } from 'lodash';
export default {
  name: 'RecurringSchedule',
  props: {
    value: {
      type: String,
      default: '',
    },
    containerClass: {
      type: String,
      default: '',
    },
    isDefault: {
      type: Boolean,
    },
  },
  mounted() {
    this.currentRRule = this.value;
    const inverseDaysOfWeek = {};
    Object.keys(this.daysOfWeek).forEach((key) => {
      inverseDaysOfWeek[this.daysOfWeek[key].toString()] = key;
    });
    if (this.currentRRule) {
      const rule = RRule.fromString(this.currentRRule);
      if (rule.origOptions.freq === RRule.DAILY) {
        this.frequency = this.$t('recurringSchedule.daily');
        this.dayInterval = rule.origOptions.interval;
        this.endDate = rule.origOptions.until;
        if (
          isEqual(rule.origOptions.byweekday, [
            RRule.MO,
            RRule.TU,
            RRule.WE,
            RRule.TH,
            RRule.FR,
          ])
        ) {
          this.dailyOption = this.$t('recurringSchedule.every_weekday');
        }
      }
      if (rule.origOptions.freq === RRule.WEEKLY) {
        this.frequency = this.$t('recurringSchedule.weekly');
        this.weekInterval = rule.origOptions.interval;
        this.endDate = rule.origOptions.until;
        rule.origOptions.byweekday.forEach((weekday) => {
          this.selectedDays[inverseDaysOfWeek[weekday.toString()]] = true;
        });
      }
    }

    this.showSchedule = !this.isDefault;
  },
  methods: {
    customFormatter(date) {
      return this.$moment(date).format('ddd MMMM Do YYYY');
    },
    logChange() {
      if (this.frequency === this.$t('recurringSchedule.weekly')) {
        this.currentRRule = new RRule({
          freq: RRule.WEEKLY,
          interval: this.weekInterval,
          until: this.endDate,
          byhour: [11],
          byweekday: Object.keys(this.selectedDays)
            .filter((day) => Boolean(this.selectedDays[day]))
            .map((day) => this.daysOfWeek[day]),
        }).toString();
      }
      if (this.frequency === this.$t('recurringSchedule.daily')) {
        this.currentRRule = new RRule({
          freq: RRule.DAILY,
          interval: this.dayInterval,
          until: this.endDate,
          byhour: [11],
          byweekday:
            this.dailyOption === this.$t('recurringSchedule.every_weekday')
              ? [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR]
              : [],
        }).toString();
      }

      if (this.currentRRule) {
        this.$emit('input', this.currentRRule);
      }
    },
  },
  computed: {
    displayValue() {
      if (this.currentRRule) {
        return RRule.fromString(this.currentRRule).toText();
      }
      return '';
    },
  },
  data() {
    return {
      frequency: this.$t('recurringSchedule.daily'),
      dailyOption: this.$t('recurringSchedule.days'),
      selectedDays: {},
      dayInterval: 1,
      weekInterval: 1,
      currentRRule: '',
      endDate: null,
      showSchedule: false,
      daysOfWeek: {
        [this.$t('recurringSchedule.sun')]: RRule.SU,
        [this.$t('recurringSchedule.mon')]: RRule.MO,
        [this.$t('recurringSchedule.tue')]: RRule.TU,
        [this.$t('recurringSchedule.wed')]: RRule.WE,
        [this.$t('recurringSchedule.thu')]: RRule.TH,
        [this.$t('recurringSchedule.fri')]: RRule.FR,
        [this.$t('recurringSchedule.sat')]: RRule.SA,
      },
    };
  },
};
</script>

<style>
.cron-popover {
  @apply bg-white text-black outline-none w-full border shadow w-84;
  z-index: 100;
}
</style>
