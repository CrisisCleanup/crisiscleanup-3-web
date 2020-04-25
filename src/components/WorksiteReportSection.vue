<template>
  <section class="px-3 pb-3">
    <form ref="timeForm" class="flex items-center justify-between w-full">
      <base-input
        v-model="volunteersToAdd"
        input-style="width: 6rem"
        input-classes="text-xs"
        :placeholder="$t('caseView.volunteers')"
        required
        pattern="\d*"
      />
      <base-input
        v-model="hoursPerVolunteer"
        :placeholder="$t('caseView.hours_per_volunteer')"
        input-classes="text-xs"
        input-style="width: 11rem;"
        required
        pattern="\d*"
      />
      <base-button
        :text="$t('actions.add')"
        :alt="$t('actions.add')"
        variant="solid"
        class="p-3"
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
            <th class="border p-1 break-all">
              {{ $t('caseView.volunteers') }}
            </th>
            <th class="border p-1 break-all">
              {{ $t('caseView.hours_per_volunteer') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in timeEnteredByMyOrganization">
            <td class="text-left border p-1 break-all">
              {{ entry.created_by_name }}
            </td>
            <td class="text-right border p-1">{{ entry.volunteers }}</td>
            <td class="text-right border p-1">
              {{ entry.seconds | secondsToHm }}
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
