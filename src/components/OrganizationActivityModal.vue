<template>
  <div class="relative w-full rounded p-2 popup--container">
    <div
      class="absolute top-1 right-0 cursor-pointer px-2"
      @click="closeModal()"
    >
      X
    </div>
    <img
      :src="generalInfo.avatar"
      v-if="generalInfo.avatar"
      class="w-10 h-10 rounded-full"
    />
    <div class="flex flex-col">
      <div class="pb-2">
        <div class="text-h2">{{ generalInfo.name }}</div>
        <div v-if="generalInfo.website" class="text-bodysm">
          {{ generalInfo.website }}
        </div>
      </div>
      <hr />
      <div class="py-2">
        <div class="grid grid-cols-2 ml-5">
          <div class="col-span-1">
            <div class="text-crisiscleanup-dark-300">{{ $t('TYPE') }}</div>
            <div>{{ $t(generalInfo.type ? generalInfo.type : 'Unknown') }}</div>
          </div>
          <div class="col-span-1">
            <div class="text-crisiscleanup-dark-300">{{ $t('ROLE') }}</div>
            <div>{{ $t(generalInfo.role ? generalInfo.role : 'Unknown') }}</div>
          </div>
        </div>
        <div class="grid grid-cols-4 text-center">
          <div class="col-span-1">
            <div class="text-crisiscleanup-dark-300">{{ $t('INCIDENTS') }}</div>
            <div>{{ $t(generalInfo.reported_count) }}</div>
          </div>
          <div class="col-span-1">
            <div class="text-crisiscleanup-dark-300">{{ $t('CLAIMED') }}</div>
            <div>{{ $t(generalInfo.claimed_count) }}</div>
          </div>
          <div class="col-span-1">
            <div class="text-crisiscleanup-dark-300">{{ $t('CALLS') }}</div>
            <div>{{ $t(generalInfo.calls) }}</div>
          </div>
          <div class="col-span-1">
            <div class="text-crisiscleanup-dark-300">{{ $t('VALUE') }}</div>
            <div>{{ $t(generalInfo.commercial_value) }}</div>
          </div>
        </div>
      </div>
      <hr />
      <div class="py-2">
        <div
          class="flex flex-row cursor-pointer"
          @click="showIncidents = !showIncidents"
        >
          <div class="mt-2">{{ $t('INCIDENTS') }}</div>
          <div class="ml-auto text-lg">
            <div v-if="!showIncidents">&#8964;</div>
            <div v-else>&#8963;</div>
          </div>
        </div>
        <Incidents
          v-if="showIncidents"
          :incidents="testIncidents"
          class="pt-2"
        />
      </div>
      <hr class="mt-2" />
      <div class="py-2">
        <div
          class="flex flex-row cursor-pointer"
          @click="showCapability = !showCapability"
        >
          <div class="mt-2">{{ $t('CAPABILITY') }}</div>
          <div class="ml-auto text-lg">
            <div v-if="!showCapability">&#8964;</div>
            <div v-else>&#8963;</div>
          </div>
        </div>
        <Capability :capabilities="testCapabilities" v-if="showCapability" />
      </div>
    </div>
  </div>
</template>
<script>
import Incidents from '@/components/Incidents.vue';
import Capability from '@/components/Capability.vue';

export default {
  name: 'OrganizationActivityModal',
  components: { Incidents, Capability },
  props: {
    generalInfo: {
      type: Object,
      default: null,
    },
    incidents: {
      type: Array,
      default: () => [],
    },
    capability: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      showIncidents: false,
      showCapability: false,
      testIncidents: [
        {
          name: 'Hurricane Florence',
          cases: 45,
          claimed: 103,
          calls: '25.2K',
          value: '2.7M',
        },
        {
          name: 'Hurricane Irma',
          cases: 45,
          claimed: 103,
          calls: '25.2K',
          value: '2.7M',
        },
        {
          name: 'Flint Michigan Water Crisis',
          cases: 45,
          claimed: 103,
          calls: '25.2K',
          value: '2.7M',
        },
      ],
      testCapabilities: [
        {
          name: 'Business Services',
          items: [
            {
              name: 'Business Financial Assistance',
              normal: true,
              warning: false,
              impact: false,
              rescue: true,
              cleanup: true,
              longterm: false,
            },
            {
              name: 'SBA Loans',
              normal: false,
              warning: true,
              impact: true,
              rescue: true,
              cleanup: true,
              longterm: false,
            },
          ],
        },
        {
          name: 'Capacity-Building',
          items: [
            {
              name: 'Community Monitoringand Evaluation',
              normal: false,
              warning: false,
              impact: true,
              rescue: false,
              cleanup: true,
              longterm: false,
            },
            {
              name: 'Contingency Planning',
              normal: false,
              warning: true,
              impact: true,
              rescue: true,
              cleanup: true,
              longterm: false,
            },
            {
              name: 'Grant Writing',
              normal: false,
              warning: true,
              impact: true,
              rescue: true,
              cleanup: true,
              longterm: false,
            },
          ],
        },
      ],
    };
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
  },
};
</script>
<style scoped>
.popup--container {
  background: #2e343b;
}
</style>
