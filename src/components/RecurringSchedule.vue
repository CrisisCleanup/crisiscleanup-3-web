<template>
  <div>
    <form
      v-if="showSchedule"
      style="z-index: 1001;"
      class="p-2 border"
      :class="containerClass"
      @change="logChange"
    >
      <div>
        <div>
          <form-select
            v-model="frequency"
            :options="['Daily', 'Weekly']"
            indicator-icon="caret-down"
            select-classes="h-10 border bg-white text-sm"
            @input="logChange"
          />
        </div>
        <div class="daily" v-if="frequency === 'Daily'">
          <base-radio
            class="mr-10 pt-4"
            name="Days"
            label="Days"
            :value="dailyOption"
            @change="dailyOption = $event"
          >
            <div class="flex items-center">
              {{ $t('Every') }}
              <input
                class="w-10 border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none mx-2 text-center"
                v-model="dayInterval"
              />
              {{ $t('day(s)') }}
            </div>
          </base-radio>
          <base-radio
            class="mr-10 py-2"
            name="Every Weekday"
            label="Every Weekday"
            :value="dailyOption"
            @change="dailyOption = $event"
          />
        </div>

        <div class="weekly" v-if="frequency === 'Weekly'">
          <div class="py-2">
            {{ $t('Recur Every') }}
            <input
              class="w-10 border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none mx-2 text-center"
              v-model="weekInterval"
            />
            {{ $t('weeks(s) on:') }}
          </div>

          <div class="flex flex-wrap">
            <div v-for="(day, key) in daysOfWeek" :key="key" class="p-1 w-24">
              <base-checkbox v-model="selectedDays[key]">
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
            :alt="$t('calendar')"
          />
          <datepicker
            input-class="h-10 p-1 outline-none w-full text-sm cursor-pointer"
            wrapper-class="flex-grow"
            :format="customFormatter"
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
      >{{ $t('Add schedule') }}</base-button
    >
  </div>
</template>

<script>
import { RRule } from 'rrule';
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
  },
  mounted() {
    this.currentRRule = this.value;
    if (this.currentRRule) {
      const rule = RRule.fromString(this.currentRRule);
      if (rule.origOptions.freq === RRule.DAILY) {
        this.frequency = 'Daily';
        this.dayInterval = rule.origOptions.interval;
        this.endDate = rule.origOptions.until;
      }
      if (rule.origOptions.freq === RRule.WEEKLY) {
        this.frequency = 'Weekly';
        this.weekInterval = rule.origOptions.interval;
        this.endDate = rule.origOptions.until;
      }
    }
  },
  methods: {
    customFormatter(date) {
      return this.$moment(date).format('ddd MMMM Do YYYY');
    },
    logChange() {
      if (this.frequency === 'Weekly') {
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
      if (this.frequency === 'Daily') {
        this.currentRRule = new RRule({
          freq: RRule.DAILY,
          interval: this.dayInterval,
          until: this.endDate,
          byhour: [11],
          byweekday:
            this.dailyOption === 'Every Weekday'
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
  watch: {
    currentRRule(value) {
      this.$emit('input', value);
    },
  },
  data() {
    return {
      frequency: 'Daily',
      dailyOption: 'Days',
      selectedDays: {},
      dayInterval: 1,
      weekInterval: 1,
      currentRRule: '',
      endDate: null,
      showSchedule: false,
      daysOfWeek: {
        [this.$t('~~Sun')]: RRule.SU,
        [this.$t('~~Mon')]: RRule.MO,
        [this.$t('~~Tue')]: RRule.TU,
        [this.$t('~~Wed')]: RRule.WE,
        [this.$t('~~Thu')]: RRule.TH,
        [this.$t('~~Fri')]: RRule.FR,
        [this.$t('~~Sat')]: RRule.SA,
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
