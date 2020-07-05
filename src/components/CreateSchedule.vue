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
      modal-classes="bg-white max-w-lg shadow"
      :title="$t('~~Create Schedule')"
      closeable
      @close="
        () => {
          showCreateScheduleModal = false;
        }
      "
    >
      <div class="text-justify flex flex-col p-3 justify-center">
        <div class="my-2">
          {{ $t('~~Name') }}
        </div>
        <base-input
          v-model="schedule.name"
          type="text"
          class="input"
          size="large"
          :placeholder="$t('Name')"
          required
        />

        <div class="my-2">
          {{ $t('~~Description') }}
        </div>
        <textarea
          v-model="schedule.description"
          :placeholder="$t('~~Description')"
          rows="4"
          class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 my-2 resize-none w-full"
        />

        <div class="my-2">
          {{ $t('~~Capabilites') }}
        </div>
        <form-select
          :placeholder="$t('~~Capabilites')"
          v-model="schedule.capability_ids"
          class="w-auto border border-crisiscleanup-dark-100 multi-select mr-1"
          select-classes="h-full"
          :options="capabilities"
          multiple
          item-key="id"
          label="name_t"
          searchable
        />
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

export default {
  name: 'CreateSchedule',
  async mounted() {
    const capabilitiesResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/organization_capabilities?limit=200`,
    );
    this.capabilities = capabilitiesResponse.data.results;
  },
  methods: {
    async createSchedule() {
      try {
        await this.$http.post(`${process.env.VUE_APP_API_BASE_URL}/schedules`, {
          ...this.schedule,
        });
        this.showCreateScheduleModal = false;
        await this.$toasted.success(this.$t('~~Created Schedule'));
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
  data() {
    return {
      showCreateScheduleModal: false,
      capabilities: [],
      schedule: {
        name: '',
        description: '',
        capability_ids: [],
        available_to: {},
        shift_ids: [],
      },
    };
  },
};
</script>
