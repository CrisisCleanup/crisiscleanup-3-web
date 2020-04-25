<template>
  <modal
    :title="$t('workTypeRequestModal.work_type_request')"
    modal-classes="w-2/3"
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
        <div v-for="contact in organization.incident_primary_contacts">
          {{ contact.first_name }} {{ contact.last_name }} ({{
            organization.name
          }}) {{ contact.email }} {{ contact.mobile }}
        </div>
      </template>
      <div class="font-xs my-2 font-bold">
        {{ $t('workTypeRequestModal.choose_work_types') }}
      </div>
      <div v-for="work_type_to_request in workTypes">
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
            work_type_to_request.work_type | getWorkTypeName
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

    <div slot="footer" class="p-3 flex justify-end">
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
  </modal>
</template>
<script>
import Organization from '@/models/Organization';

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
  data() {
    return {
      requestedWorkTypes: new Set(this.initialSelection),
      reason: '',
      organizations: [],
    };
  },
  async mounted() {
    const organizationIds = this.workTypes.map((type) => type.claimed_by);
    this.organizations = Organization.query().whereIdIn(organizationIds).get();
  },
  methods: {
    setSelectedWorkTypeRequest(workType, value) {
      if (value) {
        this.requestedWorkTypes.add(workType);
      } else {
        this.requestedWorkTypes.remove(workType);
      }
    },
  },
};
</script>
