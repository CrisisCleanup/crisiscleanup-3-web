<template>
  <modal
    :title="$t('workTypeRequestModal.work_type_request')"
    modal-classes="w-2/3"
    @close="$emit('onCancel')"
  >
    <div class="px-6 py-3">
      <div class="font-xs my-2">
        {{
          $t(`~~You are requesting that {organizations} assign one or more work types to {my_organization} for case {case_number}. This is an opportunity for you to develop a relationship with {organizations}. Please be nice, respectful, and assume that the other organization is acting with the best intentions.
        We encourage you to call them directly. A phone conversation can speed up the process and minimize misunderstandings. Each of the people below will receive an email alerting them of the request, and encouraging to contact you with questions.`)
        }}
        {{ $t('~~They will be able to take one of three actions:') }}
        <ul class="my-2 list-disc list-inside">
          <li>{{ $t('~~Approve your Request') }}</li>
          <li>{{ $t('~~Deny your Request') }}</li>
          <li>{{ $t('~~Take No Action') }}</li>
        </ul>
        {{
          $t(`~~If they approve your request, you will receive another alert, and your organization will immediately be listed as claiming the work type. If they deny your request, you will receive an alert, and the request will be cancelled. If this happens, please be nice, respectful, and assume the best intentions of the other organization. Please also reach out directly to the person who denied the request if you need any clarification.
        If they take no action, the request will automatically be approved after 36 hours, and you will receive an alert.
        Add a note explaining why you are requesting to do this case. Please be respectful. Examples might include:`)
        }}
        <ul class="my-2 list-disc list-inside">
          <li>
            {{ $t("'~~This person is a member of our faith community.'") }}
          </li>
          <li>
            {{
              $t(
                "'~~We are working next door, and can help this person immediately.'",
              )
            }}
          </li>
          <li>
            {{
              $t(
                `'~~You marked the case "Closed, done by others." We are the organization that did the work.'`,
              )
            }}
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
            value => {
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
        {{ $t('~~workTypeRequestModal.reason_requested') }}
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
        class="ml-2 p-3 px-6 mr-1 text-xs border border-black"
        :action="
          () => {
            $emit('onCancel');
          }
        "
      />
      <base-button
        type="primary"
        :action="
          () => {
            $emit('onRequest', {
              workTypes: Array.from(requestedWorkTypes),
              reason: reason,
            });
          }
        "
        :text="$t('actions.request')"
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
  },
  data() {
    return {
      requestedWorkTypes: new Set(this.initialSelection),
      reason: '',
      organizations: [],
    };
  },
  async mounted() {
    const organizationIds = this.workTypes.map(type => type.claimed_by);
    this.organizations = Organization.query()
      .whereIdIn(organizationIds)
      .get();
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
