<template>
  <modal
    :title="$t('Work Type Request')"
    modal-classes="w-96"
    @close="$emit('onCancel')"
  >
    <div class="px-6 py-3">
      <div class="font-xs my-2">
        {{
          $t('Choose work type you would like to claim for your organization')
        }}
      </div>
      <div v-for="work_type_to_request in work_types">
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
    </div>

    <div slot="footer" class="p-3">
      <base-button
        type="primary"
        :action="
          () => {
            $emit('onRequest', Array.from(requestedWorkTypes));
          }
        "
        :text="$t('actions.request')"
        class="ml-2 p-3 px-6 text-xs"
      />
    </div>
  </modal>
</template>
<script>
export default {
  name: 'WorkTypeRequestModal',
  props: {
    workTypes: {
      type: Array,
      default: () => [],
    },
    initialSelection: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      requestedWorkTypes: new Set(this.initialSelection),
    };
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
