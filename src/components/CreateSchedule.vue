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
      <div class="text-justify flex flex-col p-3 justify-center">
        <div class="flex">
          <div class="w-1/2 mr-2">
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

          <div class="w-1/2 ml-2">
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
        </div>

        <div class="my-1">
          {{ $t('~~Description') }}
        </div>
        <textarea
          v-model="schedule.description"
          :placeholder="$t('~~Description')"
          rows="3"
          class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 my-1 resize-none w-full"
        />
      </div>

      <div class="m-3">
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
            <base-button
              class="flex items-center justify-start px-5 text-primary-dark"
              :action="addShift"
              type="link"
              :text="$t('~~Add Shift')"
            />
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
                {{ day | moment('MM/DD') }}
              </div>
            </div>
          </div>

          <template v-for="shift in schedule.shifts">
            <div class="grid-cell">
              <div class="flex items-center justify-start px-5">
                <div class="flex-col flex items-start justify-center">
                  <template v-if="shift.isEditing">
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
                  </template>
                  <template v-else>
                    <div class="mb-1">{{ shift.name }}</div>
                    <div class="mb-1">
                      {{ [shift.start_time, 'HH:mm:ss'] | moment('hA') }} -
                      {{ [shift.end_time, 'HH:mm:ss'] | moment('hA') }}
                    </div>
                    <base-button
                      class="text-primary-dark"
                      type="link"
                      :text="$t('~~Change Shift')"
                      :action="
                        () => {
                          shift.isEditing = true;
                        }
                      "
                    />
                  </template>
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
        </div>
      </div>

      <div slot="footer" class="p-3 flex justify-end">
        <base-button
          :text="$t('actions.cancel')"
          :alt="$t('actions.cancel')"
          class="ml-2 p-3 px-6 mr-1 text-xs border border-black"
          :action="
            () => {
              showCreateScheduleModal = false;
            }
          "
        />
        <base-button
          variant="solid"
          :action="createSchedule"
          :text="$t('actions.submit')"
          :alt="$t('actions.submit')"
          class="ml-2 p-3 px-6 text-xs"
        />
      </div>
    </modal>
  </div>
</template>
<script>
import { getErrorMessage } from '../utils/errors';
import TimeSelect from './TimeSelect';

export default {
  name: 'CreateSchedule',
  components: { TimeSelect },
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
    addDay() {
      this.schedule.days.push(this.$moment());
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
