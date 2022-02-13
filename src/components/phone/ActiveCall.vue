<template>
  <div class="flex flex-col items-center justify-between">
    <div
      class="px-2 py-1 w-full text-white bg-crisiscleanup-lightblue-800"
      v-if="isTransitioning || (isTakingCalls && !isOnCall)"
    >
      {{ $t('~~Connecting....') }}
    </div>
    <div
      v-else-if="isOnCall"
      class="px-2 py-1 w-full text-white bg-crisiscleanup-dark-blue"
    >
      <div v-if="isInboundCall">{{ $t('~~Inbound Call') }}</div>
      <div v-if="isOutboundCall">{{ $t('~~Outbound Call') }}</div>
    </div>
    <div class="px-2 py-1 w-full text-white bg-crisiscleanup-green-300" v-else>
      {{ $t('~~Call Completed') }}
    </div>

    <div
      class="p-1"
      :style="{ backgroundColor: scripts.currentScriptColor.value }"
    >
      <base-text variant="h3">{{
        $t(scripts.currentScriptHeader.value[0])
      }}</base-text>
      <base-text variant="bodysm">
        {{ `"${$t(scripts.currentScript.value)}"` }}
      </base-text>
    </div>

    <div class="flex items-start justify-between w-full py-1 px-2">
      <div>
        <base-text variant="h2">
          {{ caller.dnis }}
        </base-text>
        <div class="text-xs text-crisiscleanup-dark-200 p-1">
          {{ caller.location_name }} {{ caller.state_name }}
        </div>
      </div>
      <div
        class="text-xs text-crisiscleanup-dark-200"
        v-if="caller.number_of_inbound_calls"
      >
        {{
          `${caller.number_of_inbound_calls} ${$t(
            '~~Calls',
          )} | ${$moment().diff($moment(caller.created_at), 'days')} days`
        }}
      </div>
    </div>
    <div class="flex py-2" v-if="cards.length">
      <div class="pr-2" v-for="c in cards" :key="`${c.id}`">
        <div
          class="cursor-pointer bg-crisiscleanup-light-grey p-2 w-40"
          @click="() => setCase(c)"
          :class="c.id === caseId ? 'border' : ''"
        >
          <div class="flex">
            <div
              v-html="getSVG(c.worktype)"
              class="cases-svg-container p-1"
            ></div>
            <div class="p-1">{{ c.caseNumber }}</div>
          </div>
          <div class="text-xs text-crisiscleanup-dark-200 p-1">
            {{ c.address }} {{ c.state }}
          </div>
        </div>
      </div>
    </div>

    <div class="py-1">
      <ccu-icon
        @click.native="$phoneService.hangup"
        v-if="isOnCall && isOutboundCall"
        size="lg"
        type="hangup"
      ></ccu-icon>
    </div>
  </div>
</template>
<script>
import { ConnectFirstMixin, WorksitesMixin } from '@/mixins';
import useScripts from '@/use/phone/useScripts';
import Worksite from '@/models/Worksite';
import Pda from '@/models/Pda';

export default {
  name: 'ActiveCall',
  mixins: [ConnectFirstMixin, WorksitesMixin],
  props: {
    caseId: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      cards: [],
    };
  },
  async mounted() {
    await this.createCards();
  },
  methods: {
    getSVG(worktype) {
      return this.getWorktypeSVG(worktype);
    },
    setCase(caseObject) {
      this.$emit('setCase', caseObject.id);
    },
    async createCards() {
      if (this.call) {
        let cases = [];
        const { pda, worksite } = this.call;
        if (worksite) {
          const worksiteResponse = await Worksite.api().fetch(worksite);
          const [site] = await worksiteResponse.entities.worksites;
          cases = [...Array.from([site]), ...cases];
        }
        if (pda) {
          const pdaResponse = await Pda.api().get(`/pdas/${pda}`);
          const [assessment] = await pdaResponse.entities.pdas;
          cases = [...Array.from([assessment]), ...cases];
        }
        this.cards = cases.map((c) => ({
          caseNumber: c.case_number ? c.case_number : `PDA-${c.id}`,
          address: c.short_address,
          state: c.state,
          worktype: c.getWorkType ? c.getWorkType() : 'wellness_check',
          fullAddress: c.full_address,
          id: c.id,
          type: c.case_number ? 'worksite' : 'pda',
        }));
      }
    },
  },
  computed: {
    scripts() {
      return useScripts({
        callType: this.callType,
        incident: this.currentIncident,
        recentWorksite: null,
      });
    },
  },
};
</script>
