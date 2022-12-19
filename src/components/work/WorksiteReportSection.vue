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
                  class="w-10 border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none text-center"
                  :value="entry.volunteers"
                  @update:modelValue="
                    currentTimeEdit.volunteers = $event.target.value
                  "
                />
              </div>
              <div v-else>
                {{ entry.volunteers }}
              </div>
            </td>
            <td class="text-right border p-1">
              <div v-if="currentTimeEdit.id === entry.id">
                <input
                  class="w-10 border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none text-center"
                  :value="entry.seconds / 3600"
                  @update:modelValue="
                    currentTimeEdit.seconds = $event.target.value * 3600
                  "
                />
              </div>
              <div v-else>
                {{ secondsToHm(entry.seconds) }}
              </div>
            </td>
            <td class="">
              <ccu-icon
                v-if="!currentTimeEdit.id"
                :alt="$t('actions.edit')"
                size="md"
                class="p-1 w-5"
                type="edit"
                @click="editTimeEntry(entry)"
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
              {{ secondsToHm(timeEnteredByOtherOrganizations.seconds) }}
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
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import { useToast } from 'vue-toastification';
import useCurrentUser from '../../hooks/useCurrentUser';
import { getErrorMessage } from '../../utils/errors';
import Worksite from '../../models/Worksite';
import { secondsToHm } from '../../filters/index';

export default {
  name: 'WorksiteReportSection',
  props: {
    worksite: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const { currentUser } = useCurrentUser();
    const { t } = useI18n();
    const $toasted = useToast();

    const volunteersToAdd = ref('');
    const hoursPerVolunteer = ref('');
    const addingTime = ref(false);
    const currentTimeEdit = ref({});
    const timeForm = ref(null);

    const timeEnteredByMyOrganization = computed(() => {
      if (props.worksite) {
        return props.worksite.time.filter(
          (type) => type.created_by_org === currentUser.organization.id,
        );
      }
      return [];
    });

    const timeEnteredByOtherOrganizations = computed(() => {
      let time = [];
      if (props.worksite) {
        time = props.worksite.time.filter(
          (type) => type.created_by_org !== currentUser.organization.id,
        );
      }
      const volunteers = time.reduce((total, object) => {
        return total + object.volunteers;
      }, 0);

      const seconds = time.reduce((total, object) => {
        return total + object.seconds;
      }, 0);

      return {
        created_by_name: t('Other Organizations'),
        seconds,
        volunteers,
      };
    });

    async function addTime() {
      try {
        const isValid = timeForm.value.reportValidity();
        if (!isValid) {
          return;
        }
        await Worksite.api().addTime(
          props.worksite.id,
          moment.duration(Number(hoursPerVolunteer.value), 'hours').asSeconds(),
          volunteersToAdd.value,
        );
        addingTime.value = false;
        volunteersToAdd.value = '';
        hoursPerVolunteer.value = '';
        await Worksite.api().fetch(props.worksite.id);
        emit('timeAdded');
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }
    async function saveTimeEntry() {
      try {
        await Worksite.api().updateTimeEntry(
          currentTimeEdit.value.id,
          currentTimeEdit.value.seconds,
          currentTimeEdit.value.volunteers,
        );
        currentTimeEdit.value = {};
        await Worksite.api().fetch(props.worksite.id);
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }
    function editTimeEntry(entry) {
      currentTimeEdit.value.id = entry.id;
      currentTimeEdit.value.seconds = entry.seconds;
      currentTimeEdit.value.volunteers = entry.volunteers;
      currentTimeEdit.value = { ...currentTimeEdit.value };
    }

    return {
      volunteersToAdd,
      hoursPerVolunteer,
      addingTime,
      currentTimeEdit,
      timeEnteredByMyOrganization,
      timeEnteredByOtherOrganizations,
      currentUser,
      timeForm,
      addTime,
      saveTimeEntry,
      editTimeEntry,
      secondsToHm,
    };
  },
};
</script>
