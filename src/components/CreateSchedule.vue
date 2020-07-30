<template>
  <div>
    <base-button
      variant="outline"
      class="mx-1 px-3 py-1"
      :text="$t('~~Create Schedule')"
      :alt="$t('~~Create Schedule')"
      @click.native="showCreateScheduleModal = true"
    ></base-button>
    <modal
      v-if="showCreateScheduleModal"
      modal-classes="bg-white max-w-5xl shadow"
      :title="$t('~~Create Schedule')"
      closeable
      @close="
        () => {
          showCreateScheduleModal = false;
        }
      "
    >
      <Wizard
        :steps="[
          { id: 'schedule', name: 'Schedule Information', disabled: false },
          { id: 'days', name: 'Select Days', disabled: false },
          { id: 'users', name: 'Select Users', disabled: false },
        ]"
        @cancel="showCreateScheduleModal = false"
        @complete="createSchedule"
      >
        <template #schedule>
          <div
            class="text-justify flex flex-col p-3 justify-center items-center"
          >
            <div class="w-1/2">
              <div class="my-1">
                {{ $t('~~Name') }}
              </div>
              <base-input
                v-model="schedule.name"
                type="text"
                class="input"
                :placeholder="$t('Name')"
                required
              />
            </div>
            <div class="w-1/2">
              <div class="my-1">
                {{ $t('~~Capabilites') }}
              </div>
              <form-select
                :placeholder="$t('~~Capabilites')"
                v-model="schedule.capability_ids"
                class="w-auto border border-crisiscleanup-dark-100 multi-select mr-1"
                select-classes="h-10"
                :options="capabilities"
                multiple
                item-key="id"
                label="name_t"
                searchable
              />
            </div>
            <div class="w-1/2 my-1">
              {{ $t('~~Description') }}
            </div>
            <textarea
              v-model="schedule.description"
              :placeholder="$t('~~Description')"
              rows="3"
              class="w-1/2 text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 my-1 resize-none"
            />
          </div>
        </template>
        <template #days>
          <div class="flex m-3">
            <div class="w-3/4">
              <v-datepicker
                v-model="days"
                :update-on-input="false"
                color="yellow"
                :masks="{
                  input: 'YYYY-MM-DD',
                }"
                :popover="{ placement: 'bottom', visibility: 'click' }"
                mode="multiple"
              >
                <base-button
                  :text="$t('~~Set Dates')"
                  class="flex items-center justify-start pb-3 text-primary-dark"
                />
              </v-datepicker>
              <div :style="gridStyle" class="grid" v-if="days.length">
                <div class="grid-cell">
                  <div class="p-2 flex items-center justify-center">
                    {{ $t('~~ALL DAY') }}
                  </div>
                </div>
                <div
                  class="grid-cell flex-col justify-center"
                  v-for="day in schedule.days"
                >
                  <div
                    class="flex flex-col items-center justify-center p-2"
                    @click="addDay"
                  >
                    <div class="capitalize">
                      {{ day | moment('ddd') }}
                    </div>
                    <div class="capitalize">
                      {{ day | moment('DD') }}
                    </div>
                  </div>
                </div>

                <template v-for="shift in schedule.shifts">
                  <div class="grid-cell">
                    <div class="flex items-center justify-start">
                      <div class="flex-col flex items-start justify-center">
                        <div v-if="shift.isEditing">
                          <base-input
                            size="small"
                            class="w-full my-1"
                            :placeholder="$t('~~Shift Name')"
                            v-model="shift.name"
                          ></base-input>
                          <div class="flex my-1 pb-2">
                            <TimeSelect
                              :placeholder="$t('~~Start')"
                              :value="shift.start_time"
                              @input="
                                (value) => {
                                  shift.buffer.start_time = value;
                                }
                              "
                              class="mr-1"
                            ></TimeSelect>
                            <TimeSelect
                              :placeholder="$t('~~End')"
                              @input="
                                (value) => {
                                  shift.buffer.end_time = value;
                                }
                              "
                              :value="shift.end_time"
                              class="ml-1"
                            ></TimeSelect>
                          </div>
                          <div
                            class="grid grid-cols-2 divide-x text-xs divide-gray-400 my-1"
                          >
                            <base-button
                              class="px-1 text-primary-dark"
                              type="link"
                              :text="$t('actions.save')"
                              :action="
                                () => {
                                  saveShift(shift);
                                }
                              "
                            />
                            <base-button
                              class="px-1"
                              type="bare"
                              :text="$t('actions.cancel')"
                              :action="
                                () => {
                                  cancelShift(shift);
                                }
                              "
                            />
                          </div>
                        </div>
                        <div v-else>
                          <div class="flex mt-1 justify-end w-full">
                            <ccu-icon
                              :alt="$t('actions.edit')"
                              size="sm"
                              type="edit"
                              class="mr-2"
                              @click.native="
                                () => {
                                  shift.isEditing = true;
                                }
                              "
                            />
                            <ccu-icon
                              :alt="$t('actions.delete')"
                              size="small"
                              type="trash"
                            />
                          </div>
                          <div class="px-5 pb-1">
                            <div class="mb-1">{{ shift.name }}</div>
                            <div class="mb-1 flex items-center">
                              <ccu-icon
                                :alt="$t('actions.delete')"
                                size="small"
                                type="time"
                                class="mr-1"
                              />
                              <span
                                >{{
                                  [shift.start_time, 'HH:mm:ss'] | moment('hA')
                                }}
                                -
                                {{
                                  [shift.end_time, 'HH:mm:ss'] | moment('hA')
                                }}</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="grid-cell flex-col justify-center items-center"
                    v-for="day in schedule.days"
                  >
                    <span class="hidden">{{ day }}</span>
                  </div>
                </template>
                <div
                  class="h-10 border p-2 border-crisiscleanup-dark-blue border-dashed text-crisiscleanup-dark-blue cursor-pointer flex items-center"
                  :style="`grid-column: span ${schedule.days.length + 1}`"
                  @click="addShift"
                >
                  <ccu-icon
                    :alt="$t('casesVue.new_case')"
                    type="active-link"
                    size="small"
                    class="ml-3 mr-2"
                  />
                  {{ $t('~~Add Time Slot') }}
                </div>
              </div>
            </div>
            <div class="pl-6">
              <div class="mb-2">{{ $t('~~Select Template') }}</div>
              <base-radio
                class="mb-4"
                name="Custom"
                label="Custom"
                :value="selectedTemplate"
                @change="
                  (value) => {
                    selectedTemplate = value;
                  }
                "
              />
              <base-radio
                class="mb-4"
                name="Field Worker Schedule"
                label="Field Worker Schedule"
                :value="selectedTemplate"
                @change="
                  (value) => {
                    selectedTemplate = value;
                    createPresetSchedule('field_worker');
                  }
                "
              />
              <base-radio
                class="mb-4"
                name="Phone Volunteer Schedule"
                label="Phone Volunteer Schedule"
                :value="selectedTemplate"
                @change="
                  (value) => {
                    selectedTemplate = value;
                    createPresetSchedule('phone_volunteer');
                  }
                "
              />
              <base-radio
                class="mb-4"
                name="Team Organizer Schedule"
                label="Team Organizer Schedule"
                :value="selectedTemplate"
                @change="
                  (value) => {
                    selectedTemplate = value;
                    createPresetSchedule('team_organizer');
                  }
                "
              />
            </div>
          </div>
        </template>
      </Wizard>
      <div slot="footer"></div>
    </modal>
  </div>
</template>
<script>
import { getErrorMessage } from '../utils/errors';
import TimeSelect from './TimeSelect';
import Wizard from './Wizard';

export default {
  name: 'CreateSchedule',
  components: { Wizard, TimeSelect },
  async mounted() {
    const capabilitiesResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/organization_capabilities?limit=200`,
    );
    this.capabilities = capabilitiesResponse.data.results;
  },
  computed: {
    gridStyle() {
      return {
        display: 'grid',
        'grid-template-columns': `max-content repeat(${
          this.schedule.days.length ? this.schedule.days.length : 1
        }, auto)`,
        'grid-template-rows': `max-content repeat(${
          this.schedule.shifts.length ? this.schedule.shifts.length : 1
        }, auto)`,
      };
    },
  },
  watch: {
    days: {
      handler(newValue) {
        this.schedule.days = newValue.map((day) => {
          return this.$moment(day).format('YYYY-MM-DD');
        });
      },
      deep: true,
    },
  },
  methods: {
    getCurrentWeekDays() {
      const weekStart = this.$moment().startOf('week');

      const days = [];
      for (let i = 0; i <= 6; i++) {
        days.push(this.$moment(weekStart).add(i, 'days').format('YYYY-MM-DD'));
      }

      return days;
    },
    getWeekends(count) {
      const days = [];
      for (let i = 0; i < count; i++) {
        days.push(
          this.$moment()
            .day(6 + i * 7)
            .format('YYYY-MM-DD'),
        );
        days.push(
          this.$moment()
            .day(7 + i * 7)
            .format('YYYY-MM-DD'),
        );
      }
      return days;
    },
    createPresetSchedule(preset) {
      if (preset === 'field_worker') {
        this.days = this.getCurrentWeekDays();
      }
      if (preset === 'phone_volunteer') {
        this.days = this.getWeekends(3);
      }
      if (preset === 'team_organizer') {
        this.days = this.getWeekends(3);
      }

      this.schedule.shifts = [
        {
          name: 'Morning',
          isEditing: false,
          start_time: '07:00:00',
          end_time: '12:00:00',
          buffer: {},
        },
        {
          name: 'Afternoon',
          isEditing: false,
          start_time: '12:00:00',
          end_time: '18:00:00',
          buffer: {},
        },
        {
          name: 'Evening',
          isEditing: false,
          start_time: '18:00:00',
          end_time: '23:00:00',
          buffer: {},
        },
        {
          name: 'Night',
          isEditing: false,
          start_time: '23:00:00',
          end_time: '07:00:00',
          buffer: {},
        },
      ];
    },
    addDay() {
      this.days.push(this.$moment());
    },
    addShift() {
      this.schedule.shifts.push({
        name: '',
        isEditing: true,
        start_time: '',
        end_time: '',
        buffer: {},
      });
    },
    async createSchedule() {
      await Promise.all(
        this.schedule.shifts.map((shift) => {
          return this.createShift(shift);
        }),
      );
      try {
        await this.$http.post(`${process.env.VUE_APP_API_BASE_URL}/schedules`, {
          ...this.schedule,
        });
        this.showCreateScheduleModal = false;
        await this.$toasted.success(this.$t('~~Created Schedule'));
        this.$emit('reload');
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async createShift(shift) {
      try {
        const response = await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/shifts`,
          shift,
        );
        this.schedule.shift_ids = [
          ...this.schedule.shift_ids,
          response.data.id,
        ];
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async saveShift(shift) {
      Object.keys(shift.buffer).forEach((key) => {
        shift[key] = shift.buffer[key];
      });
      shift.buffer = {};
      shift.isEditing = false;
    },
    async cancelShift(shift) {
      if (shift.start_time && shift.end_time) {
        shift.buffer = {};
        shift.isEditing = false;
      } else {
        this.removeShift(shift);
      }
    },
    removeShift(shift) {
      this.schedule.shifts = this.schedule.shifts.filter(
        (item) => item !== shift,
      );
    },
  },
  data() {
    return {
      showCreateScheduleModal: false,
      capabilities: [],
      selectedTemplate: 'Custom',
      days: [],
      schedule: {
        name: '',
        description: '',
        capability_ids: [],
        available_to: {},
        shift_ids: [],
        days: [],
        shifts: [],
      },
    };
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
