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
            <div>{{ $t('TYPE') }}</div>
            <div>{{ $t(generalInfo.type ? generalInfo.type : 'Unknown') }}</div>
          </div>
          <div class="col-span-1">
            <div>{{ $t('ROLE') }}</div>
            <div>{{ $t(generalInfo.role ? generalInfo.role : 'Unknown') }}</div>
          </div>
        </div>
        <div class="grid grid-cols-4 text-center">
          <div class="col-span-1">
            <div>{{ $t('INCIDENTS') }}</div>
            <div>{{ $t(generalInfo.reported_count) }}</div>
          </div>
          <div class="col-span-1">
            <div>{{ $t('CLAIMED') }}</div>
            <div>{{ $t(generalInfo.claimed_count) }}</div>
          </div>
          <div class="col-span-1">
            <div>{{ $t('CALLS') }}</div>
            <div>{{ $t(generalInfo.calls) }}</div>
          </div>
          <div class="col-span-1">
            <div>{{ $t('VALUE') }}</div>
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
            &#8964;
          </div>
        </div>
        <Incidents v-if="showIncidents" />
      </div>
      <hr />
      <div class="py-2">
        <div
          class="flex flex-row cursor-pointer"
          @click="showCapability = !showCapability"
        >
          <div class="mt-2">{{ $t('CAPABILITY') }}</div>
          <div class="ml-auto text-lg">
            &#8964;
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Incidents from '@/components/Incidents.vue';

export default {
  name: 'OrganizationActivityModal',
  components: { Incidents },
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
