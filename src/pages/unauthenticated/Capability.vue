<template>
  <div>
    <div class="grid grid-cols-6 text-gray-500">
      <div class="text-xs text-center">NORMAL</div>
      <div class="text-xs text-center">WARNING</div>
      <div class="text-xs text-center">IMPACT</div>
      <div class="text-xs text-center">RESCUE</div>
      <div class="text-xs text-center">CLEANUP</div>
      <div class="text-xs text-center">LONGTERM</div>
    </div>
    <div
      class="text-center bg-gradient-to-r from-transparent via-gray-500 to-transparent my-2"
    >
      Business Services
    </div>
    <div>Business Financial Assistance</div>
    <div class="mb-10 mt-2 grid grid-cols-6 ml-3" v-if="capabilityInfo">
      <div
        v-for="(item, index) in capabilityInfo.businessFinancialAssistance"
        :key="index"
      >
        <div class="flex items-center justify-center col-span-1">
          <base-checkbox :value="item"></base-checkbox>
        </div>
      </div>
    </div>
    <div>SBA Loans</div>
    <div class="mb-10 mt-2 grid grid-cols-6 ml-3" v-if="capabilityInfo">
      <div v-for="(item, index) in capabilityInfo.sbaLoans" :key="index">
        <div class="flex items-center justify-center col-span-1">
          <base-checkbox :value="item"></base-checkbox>
        </div>
      </div>
    </div>
    <div
      class="text-center bg-gradient-to-r from-transparent via-gray-500 to-transparent my-2"
    >
      Capacity Building
    </div>
    <div>Community Monitoring and Evaluation</div>
    <div class="mb-10 mt-2 grid grid-cols-6 ml-3" v-if="capabilityInfo">
      <div
        v-for="(item, index) in capabilityInfo.communityMonitoring"
        :key="index"
      >
        <div class="flex items-center justify-center col-span-1">
          <base-checkbox :value="item"></base-checkbox>
        </div>
      </div>
    </div>
    <div>Contingency Planning</div>
    <div class="mb-10 mt-2 grid grid-cols-6 ml-3" v-if="capabilityInfo">
      <div
        v-for="(item, index) in capabilityInfo.contingencyPlanning"
        :key="index"
      >
        <div class="flex items-center justify-center col-span-1">
          <base-checkbox :value="item"></base-checkbox>
        </div>
      </div>
    </div>
    <div>Grant Writing</div>
    <div class="mb-10 mt-2 grid grid-cols-6 ml-3" v-if="capabilityInfo">
      <div v-for="(item, index) in capabilityInfo.grantWriting" :key="index">
        <div class="flex items-center justify-center col-span-1">
          <base-checkbox :value="item"></base-checkbox>
        </div>
      </div>
    </div>
    <div>Preparation and Capacity Building</div>
    <div class="mb-10 mt-2 grid grid-cols-6 ml-3" v-if="capabilityInfo">
      <div v-for="(item, index) in capabilityInfo.preparation" :key="index">
        <div class="flex items-center justify-center col-span-1">
          <base-checkbox :value="item"></base-checkbox>
        </div>
      </div>
    </div>
    <div>Relationship Building</div>
    <div class="mb-10 mt-2 grid grid-cols-6 ml-3" v-if="capabilityInfo">
      <div
        v-for="(item, index) in capabilityInfo.relationshipBuilding"
        :key="index"
      >
        <div class="flex items-center justify-center col-span-1">
          <base-checkbox :value="item"></base-checkbox>
        </div>
      </div>
    </div>
    <div>Systems Monitoring and Evaluation</div>
    <div class="mb-10 mt-2 grid grid-cols-6 ml-3" v-if="capabilityInfo">
      <div
        v-for="(item, index) in capabilityInfo.systemsMonitoring"
        :key="index"
      >
        <div class="flex items-center justify-center col-span-1">
          <base-checkbox :value="item"></base-checkbox>
        </div>
      </div>
    </div>
    <div>Vulnerability Assessment</div>
    <div class="mb-10 mt-2 grid grid-cols-6 ml-3" v-if="capabilityInfo">
      <div
        v-for="(item, index) in capabilityInfo.vulnerabilityAssessment"
        :key="index"
      >
        <div class="flex items-center justify-center col-span-1">
          <base-checkbox :value="item"></base-checkbox>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Capability',
  props: {
    capabilityInfo: {
      type: Object,
      default: null,
    },
  },
};
</script>
