<template>
  <section class="px-3 pb-3">
    <form ref="timeForm" class="w-full grid grid-cols-7 gap-2">
      <base-input
        v-model="volunteersToAdd"
        input-classes="text-xs"
        :placeholder="$t('caseView.volunteers')"
        required
        pattern="\d*"
        class="col-span-2"
        width="85"
      />
      <base-input
        v-model="hoursPerVolunteer"
        :placeholder="$t('caseView.hours_per_volunteer')"
        input-classes="text-xs"
        required
        pattern="^\d*(\.\d{0,2})?$"
        class="col-span-2"
        width="140"
      />
      <div class="col-span-1"></div>
      <base-button
        :text="$t('actions.add')"
        :alt="$t('actions.add')"
        variant="solid"
        class="p-1 col-span-2"
        :action="addTime"
      />
    </form>
    <div v-if="worksite.total_volunteers" class="my-2">
      <div class="my-1">{{ $t('caseView.volunteer_hour_reports') }}</div>
      <table class="table-fixed text-xs w-full">
        <thead>
          <tr>
            <th class="text-left border p-1 break-all">
              {{ $t('caseView.entered_by') }}
            </th>
            <th class="border p-1 break-all" width="90px">
              {{ $t('caseView.volunteers') }}
            </th>
            <th class="border p-1 break-all">
              {{ $t('caseView.hours_per_volunteer') }}
            </th>
            <th width="20px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in timeEnteredByMyOrganization" :key="`${entry.id}`">
            <td class="text-left border p-1 break-all">
              {{ entry.created_by_name }}
            </td>
            <td class="text-right border p-1">
              <div v-if="currentTimeEdit.id === entry.id">
                <input
                  class="
                    w-10
                    border border-crisiscleanup-dark-100
                    placeholder-crisiscleanup-dark-200
                    outline-none
                    text-center
                  "
                  :value="entry.volunteers"
                  @input="currentTimeEdit.volunteers = $event.target.value"
                />
              </div>
              <div v-else>
                {{ entry.volunteers }}
              </div>
            </td>
            <td class="text-right border p-1">
              <div v-if="currentTimeEdit.id === entry.id">
                <input
                  class="
                    w-10
                    border border-crisiscleanup-dark-100
                    placeholder-crisiscleanup-dark-200
                    outline-none
                    text-center
                  "
                  :value="entry.seconds / 3600"
                  @input="currentTimeEdit.seconds = $event.target.value * 3600"
                />
              </div>
              <div v-else>
                {{ entry.seconds | secondsToHm }}
              </div>
            </td>
            <td class="">
              <ccu-icon
                v-if="!currentTimeEdit.id"
                :alt="$t('actions.edit')"
                size="md"
                class="p-1 w-5"
                type="edit"
                @click.native="editTimeEntry(entry)"
              />
              <font-awesome-icon
                icon="check"
                v-if="currentTimeEdit.id === entry.id"
                :alt="$t('actions.save')"
                size="md"
                class="mx-1 text-green-600 cursor-pointer"
                type="up"
                @click="saveTimeEntry"
              />
            </td>
          </tr>
          <tr v-if="timeEnteredByOtherOrganizations.volunteers">
            <td class="text-left border p-1">
              {{ timeEnteredByOtherOrganizations.created_by_name }}
            </td>
            <td class="text-right border p-1">
              {{ timeEnteredByOtherOrganizations.volunteers }}
            </td>
            <td class="text-right border p-1">
              {{ timeEnteredByOtherOrganizations.seconds | secondsToHm }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="border p-1 text-right font-bold">
              {{ $t('caseView.total_time') }} {{ worksite.total_time }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>
</template>
<script>
import User from '@/models/User';
import Worksite from '@/models/Worksite';
import VueTypes from 'vue-types';
import { getErrorMessage } from '../utils/errors';

export default {
  name: 'WorksiteReportSection',
  data() {
    return {
      volunteersToAdd: '',
      hoursPerVolunteer: '',
      addingTime: false,
      currentTimeEdit: {},
    };
  },
  props: {
    worksite: VueTypes.object,
  },
  methods: {
    async addTime() {
      try {
        const isValid = this.$refs.timeForm.reportValidity();
        if (!isValid) {
          return;
        }
        await Worksite.api().addTime(
          this.worksite.id,
          this.$moment
            .duration(Number(this.hoursPerVolunteer), 'hours')
            .asSeconds(),
          this.volunteersToAdd,
        );
        this.addingTime = false;
        this.volunteersToAdd = '';
        this.hoursPerVolunteer = '';
        await Worksite.api().fetch(this.worksite.id);
        this.$emit('timeAdded');
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async saveTimeEntry() {
      try {
        await Worksite.api().updateTimeEntry(
          this.currentTimeEdit.id,
          this.currentTimeEdit.seconds,
          this.currentTimeEdit.volunteers,
        );
        this.currentTimeEdit = {};
        await Worksite.api().fetch(this.worksite.id);
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    editTimeEntry(entry) {
      this.currentTimeEdit.id = entry.id;
      this.currentTimeEdit.seconds = entry.seconds;
      this.currentTimeEdit.volunteers = entry.volunteers;
      this.currentTimeEdit = { ...this.currentTimeEdit };
    },
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    timeEnteredByMyOrganization() {
      if (this.worksite) {
        return this.worksite.time.filter(
          (type) => type.created_by_org === this.currentUser.organization.id,
        );
      }
      return [];
    },
    timeEnteredByOtherOrganizations() {
      let time = [];
      if (this.worksite) {
        time = this.worksite.time.filter(
          (type) => type.created_by_org !== this.currentUser.organization.id,
        );
      }
      const volunteers = time.reduce((total, obj) => {
        return total + obj.volunteers;
      }, 0);

      const seconds = time.reduce((total, obj) => {
        return total + obj.seconds;
      }, 0);

      return {
        created_by_name: this.$t('Other Organizations'),
        seconds,
        volunteers,
      };
    },
  },
};
</script>
