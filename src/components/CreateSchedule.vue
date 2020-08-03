<template>
  <div>
    <div @click="showCreateScheduleModal = true">
      <slot name="trigger">
        <base-button
          variant="outline"
          class="mx-1 px-3 py-1"
          :text="schedule.id ? $t('~~Edit Schedule') : $t('~~Create Schedule')"
          :alt="schedule.id ? $t('~~Edit Schedule') : $t('~~Create Schedule')"
        ></base-button>
      </slot>
    </div>
    <modal
      v-if="showCreateScheduleModal"
      modal-classes="bg-white max-w-6xl shadow"
      :title="schedule.id ? $t('~~Edit Schedule') : $t('~~Create Schedule')"
      closeable
      @close="
        () => {
          showCreateScheduleModal = false;
          this.$emit('reload');
        }
      "
    >
      <Wizard
        :steps="wizardSteps"
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
        <template #template>
          <div class="flex flex-col items-center justify-center pt-8">
            <div class="grid grid-cols-2 grid-rows-2 gap-4">
              <base-radio
                class="border p-3 w-56 h-40 flex flex-col items-start"
                :color="selectedTemplate === 'Custom' ? '#009bff' : null"
                :class="
                  selectedTemplate === 'Custom'
                    ? 'border-crisiscleanup-dark-blue text-crisiscleanup-dark-blue'
                    : null
                "
                name="Custom"
                label="Custom"
                :value="selectedTemplate"
                @change="
                  (value) => {
                    selectedTemplate = value;
                    createPresetSchedule('custom');
                  }
                "
              >
                <div
                  class="mt-4 flex flex-col items-center justify-center text-center"
                >
                  <div>{{ $t('~~Custom') }}</div>
                  <div class="text-xs">
                    {{ $t('~~Select Days, Create time slots') }}
                  </div>
                </div>
              </base-radio>
              <base-radio
                class="border p-3 w-56 h-40 flex flex-col items-start"
                :color="
                  selectedTemplate === 'Field Worker Schedule'
                    ? '#009bff'
                    : null
                "
                :class="
                  selectedTemplate === 'Field Worker Schedule'
                    ? 'border-crisiscleanup-dark-blue text-crisiscleanup-dark-blue'
                    : null
                "
                name="Field Worker Schedule"
                label="Field Worker Schedule"
                :value="selectedTemplate"
                @change="
                  (value) => {
                    selectedTemplate = value;
                    createPresetSchedule('field_worker');
                  }
                "
              >
                <div
                  class="mt-4 flex flex-col items-center justify-center text-center"
                >
                  <div>{{ $t('~~Field Worker Template') }}</div>
                  <div class="text-xs">
                    {{ $t('~~3 weeks, 6 days, 4 time slots') }}
                  </div>
                </div>
              </base-radio>
              <base-radio
                class="border p-3 w-56 h-40 flex flex-col items-start"
                :color="
                  selectedTemplate === 'Phone Volunteer Schedule'
                    ? '#009bff'
                    : null
                "
                :class="
                  selectedTemplate === 'Phone Volunteer Schedule'
                    ? 'border-crisiscleanup-dark-blue text-crisiscleanup-dark-blue'
                    : null
                "
                name="Phone Volunteer Schedule"
                label="Phone Volunteer Schedule"
                :value="selectedTemplate"
                @change="
                  (value) => {
                    selectedTemplate = value;
                    createPresetSchedule('phone_volunteer');
                  }
                "
              >
                <div
                  class="mt-4 flex flex-col items-center justify-center text-center"
                >
                  <div>{{ $t('~~Phone Volunteer Template') }}</div>
                  <div class="text-xs">
                    {{ $t('~~1 week, 7 days, 3 time slots') }}
                  </div>
                </div>
              </base-radio>
              <base-radio
                class="border p-3 w-56 h-40 flex flex-col items-start"
                :color="
                  selectedTemplate === 'Team Organizer Schedule'
                    ? '#009bff'
                    : null
                "
                :class="
                  selectedTemplate === 'Team Organizer Schedule'
                    ? 'border-crisiscleanup-dark-blue text-crisiscleanup-dark-blue'
                    : null
                "
                name="Team Organizer Schedule"
                label="Team Organizer Schedule"
                :value="selectedTemplate"
                @change="
                  (value) => {
                    selectedTemplate = value;
                    createPresetSchedule('team_organizer');
                  }
                "
              >
                <div
                  class="mt-4 flex flex-col items-center justify-center text-center"
                >
                  <div>{{ $t('~~Team Organizer Template') }}</div>
                  <div class="text-xs">
                    {{ $t('~~3 weeks, 21 days, 4 time slots') }}
                  </div>
                </div>
              </base-radio>
            </div>
          </div>
        </template>
        <template #days>
          <div class="flex flex-col mx-3 items-center justify-center">
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
            <div>
              <div :style="gridStyle" class="main-grid" v-if="days.length">
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
                    <div class="flex items-center justify-start w-full px-1">
                      <div
                        class="flex-col flex items-start justify-center w-full"
                      >
                        <div
                          v-if="shift.isEditing"
                          class="flex flex-col items-center justify-center"
                        >
                          <base-input
                            v-model="shift.name"
                            type="text"
                            class="w-full"
                            :placeholder="$t('~~Shift Name')"
                            size="small"
                          />
                          <div class="flex my-1 relative">
                            <TimeSelect
                              :placeholder="$t('~~Start')"
                              :value="
                                shift.buffer.start_time
                                  ? $moment(shift.buffer.start_time, 'HH:mm:ss')
                                  : $moment(shift.start_time, 'HH:mm:ss')
                              "
                              :key="shift.buffer.start_time"
                              @input="
                                (value) => {
                                  shift.buffer.start_time =
                                    value && value.format('HH:mm:ss');
                                  shift = { ...shift };
                                }
                              "
                              style="margin-right: 5px;"
                            ></TimeSelect>
                            <TimeSelect
                              :placeholder="$t('~~End')"
                              @input="
                                (value) => {
                                  shift.buffer.end_time =
                                    value && value.format('HH:mm:ss');
                                  shift = { ...shift };
                                }
                              "
                              :value="
                                shift.buffer.end_time
                                  ? $moment(shift.buffer.end_time, 'HH:mm:ss')
                                  : $moment(shift.end_time, 'HH:mm:ss')
                              "
                              :key="shift.buffer.end_time"
                            ></TimeSelect>
                          </div>
                          <div
                            class="grid grid-cols-2 divide-x text-xs divide-gray-400"
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
                        <div v-else class="w-full">
                          <div class="flex justify-end w-full">
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
                              @click.native="
                                () => {
                                  schedule.shifts = schedule.shifts.filter(
                                    (s) => {
                                      return s !== shift;
                                    },
                                  );
                                }
                              "
                            />
                          </div>
                          <div class="px-2">
                            <div class="mb-1">{{ shift.name }}</div>
                            <div class="mb-1 flex">
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
                  :style="`grid-column: span ${
                    schedule.days.length + 1
                  }; margin-right: -2px;`"
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
          </div>
        </template>
        <template #users>
          <div class="flex flex-col items-center justify-center pt-3">
            <div class="w-132 shadow px-3 mb-1">
              <div class="text-base py-1 flex items-center justify-between">
                {{ $t('~~Select Users') }}
                <span
                  class="text-3xl cursor-pointer"
                  @click="showSelectUsers = !showSelectUsers"
                  >-</span
                >
              </div>
              <div v-show="showSelectUsers">
                <base-input
                  :value="userSearch"
                  icon="search"
                  :placeholder="$t('actions.search')"
                  class="mb-3"
                  size="small"
                  @input="
                    (value) => {
                      userSearch = value;
                      throttle(getUsers, 1000)();
                    }
                  "
                ></base-input>
                <div class="h-64 overflow-scroll">
                  <base-checkbox
                    :value="selectedUsers.has(user.email)"
                    v-for="user in users"
                    :key="user.id"
                    class="flex items-center pb-1"
                    @input="
                      (value) => {
                        if (value) {
                          selectedUsers.add(user.email);
                        } else {
                          selectedUsers.delete(user.email);
                        }
                        selectedUsers = new Set(selectedUsers);
                      }
                    "
                  >
                    <div
                      style="
                        display: grid;
                        grid-template-columns: max-content 1fr;
                      "
                    >
                      <Avatar
                        :initials="user.first_name"
                        :url="user.profilePictureUrl"
                        class="mr-2"
                      />
                      <div>
                        {{ user.full_name }}
                        <div class="text-xs text-primary-dark">
                          {{ user.currentRole.name_t }}
                        </div>
                      </div>
                    </div>
                  </base-checkbox>
                </div>
              </div>
            </div>
            <div class="w-132 shadow px-3">
              <div class="text-base py-1 flex items-center justify-between">
                {{ $t('~~Invite New People') }}
                <span
                  class="text-3xl cursor-pointer"
                  @click="showInviteUsers = !showInviteUsers"
                  >-</span
                >
              </div>
              <div v-show="showInviteUsers">
                <EmailInput @input="invitedUsers = $event" />
              </div>
            </div>
          </div>
        </template>
      </Wizard>
      <div slot="footer"></div>
    </modal>
  </div>
</template>
<script>
import { UserMixin } from '@/mixins';
import { throttle } from 'lodash';
import { getErrorMessage } from '../utils/errors';
import TimeSelect from './TimeSelect';
import Wizard from './Wizard';
import User from '../models/User';
import Avatar from './Avatar';
import { getQueryString } from '../utils/urls';
import EmailInput from './EmailInput';

export default {
  name: 'CreateSchedule',
  components: { EmailInput, Avatar, Wizard, TimeSelect },
  mixins: [UserMixin],
  props: {
    schedule: {
      type: Object,
      default: () => {
        return {
          name: '',
          description: '',
          capability_ids: [],
          available_to: {},
          shift_ids: [],
          days: [],
          shifts: [],
        };
      },
    },
  },
  async mounted() {
    const capabilitiesResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/organization_capabilities?limit=200`,
    );
    this.capabilities = capabilitiesResponse.data.results;
    await this.getUsers();

    if (this.schedule.days.length) {
      this.days = this.schedule.days.map((day) => {
        return this.$moment(day);
      });
    }
  },
  computed: {
    gridStyle() {
      return {
        display: 'grid',
        'grid-template-columns': `170px repeat(${
          this.schedule.days.length ? this.schedule.days.length : 1
        }, 85px)`,
        'grid-template-rows': `60px repeat(${
          this.schedule.shifts.length ? this.schedule.shifts.length : 1
        }, 85px)`,
      };
    },
    wizardSteps() {
      if (this.schedule.id) {
        return [
          {
            id: 'schedule',
            name: 'Schedule Information',
            disabled: !this.schedule.name,
          },
          {
            id: 'days',
            name: 'Select Days',
            disabled: !this.schedule.days.length,
          },
          { id: 'users', name: 'Select Users', disabled: false },
        ];
      }
      return [
        {
          id: 'schedule',
          name: 'Schedule Information',
          disabled: !this.schedule.name,
        },
        {
          id: 'template',
          name: 'Select Template',
          disabled: !this.selectedTemplate,
        },
        {
          id: 'days',
          name: 'Select Days',
          disabled: !this.schedule.days.length,
        },
        { id: 'users', name: 'Select Users', disabled: false },
      ];
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
    async getUsers() {
      const params = {
        organization: this.currentUser.organization.id,
      };
      if (this.userSearch) {
        params.search = this.userSearch;
      }
      const queryString = getQueryString(params);

      const results = await User.api().get(`/users?${queryString}`, {
        dataKey: 'results',
      });
      const { users } = results.entities;
      this.users = users;
    },
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
      if (preset === 'custom') {
        this.days = [];
        this.shifts = [];
        return;
      }

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
        start_time: '00:00:00',
        end_time: '00:00:00',
        buffer: {},
      });
    },
    async createSchedule() {
      this.schedule.shift_ids = [];
      await Promise.all(
        this.schedule.shifts.map((shift) => {
          return this.createShift(shift);
        }),
      );
      try {
        let scheduleId = this.schedule.id;
        if (this.schedule.id) {
          await this.$http.patch(
            `${process.env.VUE_APP_API_BASE_URL}/schedules/${this.schedule.id}`,
            {
              ...this.schedule,
            },
          );
        } else {
          const response = await this.$http.post(
            `${process.env.VUE_APP_API_BASE_URL}/schedules`,
            {
              ...this.schedule,
            },
          );
          scheduleId = response.data.id;
        }
        await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/schedules/${scheduleId}/send`,
          {
            emails: [...Array.from(this.selectedUsers), ...this.invitedUsers],
          },
        );
        this.schedule = {
          name: '',
          description: '',
          capability_ids: [],
          available_to: {},
          shift_ids: [],
          days: [],
          shifts: [],
        };
        this.showCreateScheduleModal = false;
        await this.$toasted.success(this.$t('~~Saved Schedule'));
        this.$emit('reload');
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async createShift(shift) {
      try {
        if (shift.id) {
          this.schedule.shift_ids = [...this.schedule.shift_ids, shift.id];
        } else {
          const response = await this.$http.post(
            `${process.env.VUE_APP_API_BASE_URL}/shifts`,
            shift,
          );
          this.schedule.shift_ids = [
            ...this.schedule.shift_ids,
            response.data.id,
          ];
        }
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
      if (shift.name && shift.start_time && shift.end_time) {
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
      throttle,
      showCreateScheduleModal: false,
      capabilities: [],
      selectedTemplate: null,
      days: [],
      users: [],
      userSearch: '',
      selectedUsers: new Set(),
      showSelectUsers: true,
      invitedUsers: [],
      showInviteUsers: false,
    };
  },
};
</script>

<style scoped>
.main-grid {
  grid-gap: 1px;
  @apply bg-white w-full;
}
.grid-cell {
  @apply border flex;
  box-sizing: content-box;
  width: 100%;
  height: 100%;
}
</style>
