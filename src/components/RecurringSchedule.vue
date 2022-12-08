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
          <base-select
            v-model="frequency"
            :options="[
              $t('recurringSchedule.daily'),
              $t('recurringSchedule.weekly'),
            ]"
            indicator-icon="caret-down"
            select-classes="h-10 border bg-white text-sm"
            @update:modelValue="logChange"
          />
        </div>
        <div class="daily" v-if="frequency === $t('recurringSchedule.daily')">
          <base-radio
            class="mr-10 pt-4"
            :name="$t('recurringSchedule.days')"
            :label="$t('recurringSchedule.days')"
            :model-value="dailyOption"
            @update:modelValue="
              (value) => {
                dailyOption = value;
                logChange();
              }
            "
          >
            <div class="flex items-center">
              {{ $t('recurringSchedule.every') }}
              <input
                class="w-10 border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none mx-2 text-center"
                v-model="dayInterval"
              />
              {{ $t('recurringSchedule.day_s') }}
            </div>
          </base-radio>
          <base-radio
            class="mr-10 py-2"
            :name="$t('recurringSchedule.every_weekday')"
            :label="$t('recurringSchedule.every_weekday')"
            :model-value="dailyOption"
            @update:modelValue="
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
              class="w-10 border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none mx-2 text-center"
              v-model="weekInterval"
              @update:modelValue="logChange"
            />
            {{ $t('recurringSchedule.weeks_on') }}
          </div>

          <div class="flex flex-wrap">
            <div v-for="(day, key) in daysOfWeek" :key="key" class="p-1 w-24">
              <base-checkbox
                v-model="selectedDays[key]"
                @update:modelValue="logChange"
              >
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
            :formatter="{
              date: 'YYYY-MM-DD',
              month: 'MMM',
            }"
            :placeholder="$t('recurringSchedule.select_end_date')"
            as-single
            v-model="endDate"
            @update:modelValue="logChange"
          ></datepicker>
        </div>
      </div>
    </form>
    <base-button
      v-else
      text-variant="h3"
      @click="showSchedule = true"
      class="text-primary-dark"
      >{{ $t('recurringSchedule.add_schedule') }}</base-button
    >
  </div>
</template>

<script>
import { RRule } from 'rrule';
import { isEqual } from 'lodash';
import { useI18n } from 'vue-i18n';
import { ref, defineComponent, onMounted } from 'vue';
import moment from 'moment';
import LitepieDatepicker from 'litepie-datepicker';
export default defineComponent({
  name: 'RecurringSchedule',
  components: { datepicker: LitepieDatepicker },
  props: {
    modelValue: {
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
  setup(props, { emit }) {
    const { t } = useI18n();
    const frequency = ref(t('recurringSchedule.daily'));
    const dailyOption = ref(t('recurringSchedule.days'));
    const selectedDays = ref({});
    const dayInterval = ref(1);
    const weekInterval = ref(1);
    const currentRRule = ref('');
    const endDate = ref(null);
    const showSchedule = ref(false);
    const daysOfWeek = {
      [t('recurringSchedule.sun')]: RRule.SU,
      [t('recurringSchedule.mon')]: RRule.MO,
      [t('recurringSchedule.tue')]: RRule.TU,
      [t('recurringSchedule.wed')]: RRule.WE,
      [t('recurringSchedule.thu')]: RRule.TH,
      [t('recurringSchedule.fri')]: RRule.FR,
      [t('recurringSchedule.sat')]: RRule.SA,
    };
    function customFormatter(date) {
      return moment(date).format('ddd MMMM Do YYYY');
    }
    function logChange() {
      if (frequency.value === t('recurringSchedule.weekly')) {
        currentRRule.value = new RRule({
          freq: RRule.WEEKLY,
          interval: weekInterval.value,
          until: endDate.value,
          byhour: [11],
          byweekday: Object.keys(selectedDays.value)
            .filter((day) => Boolean(selectedDays.value[day]))
            .map((day) => daysOfWeek[day]),
        }).toString();
      }
      if (frequency.value === t('recurringSchedule.daily')) {
        currentRRule.value = new RRule({
          freq: RRule.DAILY,
          interval: dayInterval.value,
          until: endDate.value,
          byhour: [11],
          byweekday:
            dailyOption.value === t('recurringSchedule.every_weekday')
              ? [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR]
              : [],
        }).toString();
      }

      if (currentRRule.value) {
        emit('update:modelValue', currentRRule.value);
      }
    }

    onMounted(() => {
      currentRRule.value = props.modelValue;
      const inverseDaysOfWeek = {};
      Object.keys(daysOfWeek).forEach((key) => {
        inverseDaysOfWeek[daysOfWeek[key].toString()] = key;
      });
      if (currentRRule.value) {
        const rule = RRule.fromString(currentRRule.value);
        if (rule.origOptions.freq === RRule.DAILY) {
          frequency.value = t('recurringSchedule.daily');
          dayInterval.value = rule.origOptions.interval;
          endDate.value = rule.origOptions.until;
          if (
            isEqual(rule.origOptions.byweekday, [
              RRule.MO,
              RRule.TU,
              RRule.WE,
              RRule.TH,
              RRule.FR,
            ])
          ) {
            dailyOption.value = t('recurringSchedule.every_weekday');
          }
        }
        if (rule.origOptions.freq === RRule.WEEKLY) {
          frequency.value = t('recurringSchedule.weekly');
          weekInterval.value = rule.origOptions.interval;
          endDate.value = rule.origOptions.until;
          rule.origOptions.byweekday.forEach((weekday) => {
            selectedDays.value[inverseDaysOfWeek[weekday.toString()]] = true;
          });
        }
      }

      showSchedule.value = !props.isDefault;
    });
    return {
      frequency,
      dailyOption,
      selectedDays,
      dayInterval,
      weekInterval,
      currentRRule,
      endDate,
      showSchedule,
      daysOfWeek,
      customFormatter,
      logChange,
    };
  },
});
</script>

<style>
.cron-popover {
  @apply bg-white text-black outline-none w-full border shadow w-84;
  z-index: 100;
}
</style>
