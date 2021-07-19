<template>
  <div
    class="rounded relative bg-gray-700 text-white grid grid-rows-7 justify-center items-center w-full"
  >
    <div class="absolute top-0 right-0 text-center rounded-full hover:bg-gray-600 py-1 px-2 m-1" @click="$emit('close')">
      X
    </div>
    <div class="grid grid-cols-4 pt-5 ml-3 row-span-1">
      <div class="flex items-center">
        <img
          :src="organizationImage"
          class="col-span-1 rounded-full w-20 h-20 object-contain bg-black justify-self-center"
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
      <TabbedCard :tabs="tabs" class="w-full">
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
      default: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png'
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
