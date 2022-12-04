<template>
  <modal
    :title="$t('workTypeRequestModal.work_type_request')"
    modal-classes="w-2/3"
    modal-body-classes="h-72 overflow-scroll border-b"
    @close="$emit('onCancel')"
  >
    <div class="px-6 py-3">
      <div class="font-xs my-2">
        <span
          v-html="
            $t('workTypeRequestModal.request_modal_instructions', {
              organizations: organizations.map((org) => org.name).join(','),
              my_organization: myOrganization.name,
              case_number: '',
            })
          "
        ></span>
        <span
          v-html="$t('workTypeRequestModal.please_add_respectful_note')"
        ></span>
        <ul class="my-2 list-disc list-inside">
          <li>
            {{ $t('workTypeRequestModal.reason_member_of_faith_community') }}
          </li>
          <li>
            {{ $t('workTypeRequestModal.reason_working_next_door') }}
          </li>
          <li>
            {{ $t('workTypeRequestModal.reason_we_did_the_work') }}
          </li>
        </ul>
      </div>
      <div class="font-xs my-2 font-bold">
        {{ $t('workTypeRequestModal.contacts') }}
      </div>
      <template v-for="organization in organizations">
        <div
          v-for="contact in organization.incident_primary_contacts"
          :key="contact.email"
        >
          {{ contact.first_name }} {{ contact.last_name }} ({{
            organization.name
          }}) {{ contact.email }} {{ contact.mobile }}
        </div>
      </template>
      <div class="font-xs my-2 font-bold">
        {{ $t('workTypeRequestModal.choose_work_types') }}
      </div>
      <div
        v-for="work_type_to_request in workTypes"
        :key="work_type_to_request.work_type"
      >
        <base-checkbox
          class="mb-3"
          :value="requestedWorkTypes.has(work_type_to_request.work_type)"
          @input="
            (value) => {
              setSelectedWorkTypeRequest(work_type_to_request.work_type, value);
            }
          "
        >
          <span class="text-sm">{{
            getWorkTypeName(work_type_to_request.work_type)
          }}</span>
        </base-checkbox>
      </div>
      <div class="font-xs my-2 font-bold">
        {{ $t('workTypeRequestModal.reason_requested') }}
      </div>
      <textarea
        v-model="reason"
        rows="4"
        class="block w-full border outline-none"
      />
    </div>
    <template #footer>
      <div class="p-3 flex justify-end">
        <base-button
          :text="$t('actions.cancel')"
          :alt="$t('actions.cancel')"
          class="ml-2 p-3 px-6 mr-1 text-xs border border-black"
          :action="
            () => {
              $emit('onCancel');
            }
          "
        />
        <base-button
          variant="solid"
          :action="
            () => {
              $emit('onRequest', {
                workTypes: Array.from(requestedWorkTypes),
                reason: reason,
              });
            }
          "
          :text="$t('actions.request')"
          :alt="$t('actions.request')"
          class="ml-2 p-3 px-6 text-xs"
        />
      </div>
    </template>
  </modal>
</template>
<script>
import Organization from '../../models/Organization';
import { onMounted, ref } from 'vue';
import { getWorkTypeName } from '../../filters/index';

export default {
  name: 'WorkTypeRequestModal',
  props: {
    workTypes: {
      type: Array,
      default: () => {
        return [];
      },
    },
    initialSelection: {
      type: Array,
      default: () => {
        return [];
      },
    },
    myOrganization: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const requestedWorkTypes = ref(new Set(props.initialSelection));
    const reason = ref('');
    const organizations = ref([]);

    function setSelectedWorkTypeRequest(workType, value) {
      if (value) {
        requestedWorkTypes.value.add(workType);
      } else {
        requestedWorkTypes.value.remove(workType);
      }
    }

    onMounted(() => {
      const organizationIds = props.workTypes.map((type) => type.claimed_by);
      organizations.value = Organization.query()
        .whereIdIn(organizationIds)
        .get();
    });

    return {
      requestedWorkTypes,
      reason,
      organizations,
      setSelectedWorkTypeRequest,
      getWorkTypeName,
    };
  },
};
</script>
