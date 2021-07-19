<template>
  <div
    class="rounded bg-gray-700 text-white grid grid-rows-7 justify-center items-center w-full"
  >
    <div class="grid grid-cols-4 pt-5 ml-3 row-span-1">
      <div class="flex items-center">
        <img
          :src="organizationImage"
          class="col-span-1 rounded-full w-20 justify-self-center"
        />
      </div>
      <div class="grid-rows-2 col-span-3 sm:ml-2">
        <div class="row-span-1 text-xl sm:text-sm">
          {{ organizationInfo.name }}
        </div>
        <div class="row-span-1 text-gray-500 text-lg sm:text-xs">
          {{ organizationInfo.orgType }} * {{ organizationInfo.availability }}
        </div>
      </div>
    </div>
    <div class="row-span-1 grid grid-rows-2 items-center py-5">
      <div class="row-span-1 flex flex-row mb-1">
        <img src="@/assets/icons/pin.svg" class="mr-1" />
        <span>{{ organizationInfo.address }}</span>
      </div>
      <div class="row-span-1 grid grid-cols-2">
        <div class="col-span-1">
          <span>Type: </span><span>{{ organizationInfo.type }}</span>
        </div>
        <div class="col-span-1">
          <span>Role: </span><span>{{ organizationInfo.role }}</span>
        </div>
      </div>
    </div>
    <div class="row-span-1 grid grid-cols-4 text-center" v-if="!isMore">
      <div class="col-span-1">
        <div>CASES</div>
        <div>{{ organizationInfo.cases }}</div>
      </div>
      <div class="col-span-1">
        <div>CLAIMED</div>
        <div>{{ organizationInfo.claimed }}</div>
      </div>
      <div class="col-span-1">
        <div>CALLS</div>
        <div>{{ (organizationInfo.calls/1000) }}K</div>
      </div>
      <div class="col-span-1">
        <div>VALUE</div>
        <div>{{ (organizationInfo.value/1000000) }}M</div>
      </div>
    </div>
    <div class="row-span-2" v-if="!isMore">
      <div class="grid grid-cols-6 text-gray-500">
        <div class="text-xs text-center">NORMAL</div>
        <div class="text-xs text-center">WARNING</div>
        <div class="text-xs text-center">IMPACT</div>
        <div class="text-xs text-center">RESCUE</div>
        <div class="text-xs text-center">CLEANUP</div>
        <div class="text-xs text-center">LONGTERM</div>
      </div>
      <div
        v-if="!isMore"
        class="text-center bg-gradient-to-r from-transparent via-gray-500 to-transparent my-2"
      >
        Business Services
      </div>
      <div class="my-3">
        <div class="ml-3">Business Financial Assistance</div>
        <div class="grid grid-cols-6">
          <div
            v-for="(items, index) in organizationInfo.financialAssistance"
            :key="index"
          >
            <div class="text-xs text-center">{{ items }}</div>
          </div>
        </div>
      </div>
      <div class="ml-3">SBA Loans</div>
      <div class="grid grid-cols-6">
        <div v-for="(items, index) in organizationInfo.sbaLoans" :key="index">
          <div class="text-xs text-center">{{ items }}</div>
        </div>
      </div>
    </div>
    <div
      class="row-span-1 text-center text-blue-500 underline"
      @click="isMore = true"
      v-if="!isMore"
    >
      More
    </div>
    <div class="row-span-3 w-full" v-if="isMore">
      <TabbedCard :tabs="tabs">
        <template #incident>
          <IncidentList
            :incident-list="organizationInfo.incidents"
            class="bg-gray-700 px-5 py-20 sm:py-5"
          />
        </template>
        <template #capability>
          <Capability
            :capability-info="organizationInfo.capabilityInfo"
            class="bg-gray-700 px-5 py-2"
          />
        </template>
      </TabbedCard>
    </div>
    <div
      class="row-span-1 text-center text-blue-500 underline"
      @click="isMore = false"
      v-if="isMore"
    >
      Less
    </div>
  </div>
</template>
<script>
import IncidentList from '@/pages/unauthenticated/IncidentList.vue';
import Capability from '@/pages/unauthenticated/Capability.vue';
import TabbedCard from '@/components/cards/TabbedCard.vue';

export default {
  name: 'OrganizationActivity',
  components: { IncidentList, Capability, TabbedCard },
  props: {
    organizationInfo: {
      type: Object,
      default: () => {},
    },
    organizationImage: {
      type: String,
      default:
        'data:image/jpeg;base64,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',
    },
  },
  data() {
    return {
      isMore: false,
      currentView: 'incident',
    };
  },
  computed: {
    tabs() {
      return [
        {
          key: 'incident',
        },
        {
          key: 'capability',
        },
      ];
    },
  },
};
</script>
