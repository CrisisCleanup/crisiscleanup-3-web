<template>
  <div class="flex flex-col items-center justify-between">
    <div
      class="px-2 py-1 w-full text-white bg-crisiscleanup-lightblue-800"
      v-if="isTransitioning || (isTakingCalls && !isOnCall)"
    >
      {{ $t('phoneDashboard.connecting') }}
    </div>
    <div
      v-else-if="isOnCall"
      class="px-2 py-1 w-full text-white bg-crisiscleanup-dark-blue"
    >
      <div v-if="isInboundCall">{{ $t('phoneDashboard.inbound_call') }}</div>
      <div v-if="isOutboundCall">{{ $t('phoneDashboard.outbound_call') }}</div>
    </div>
    <div class="px-2 py-1 w-full text-white bg-crisiscleanup-green-300" v-else>
      {{ $t('phoneDashboard.completed') }}
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
      <div class="flex items-center">
        <base-text variant="h2">
          {{ caller.dnis }}
        </base-text>
        <div class="text-xs text-crisiscleanup-dark-200 ml-2">
          {{ caller.location_name }} {{ caller.state_name }}
        </div>
      </div>
      <div
        class="text-xs text-crisiscleanup-dark-200"
        v-if="caller.number_of_inbound_calls"
      >
        {{
          `${caller.number_of_inbound_calls} ${$t(
            'phoneDashboard.calls',
          )} | ${$moment().diff($moment(caller.created_at), 'days')} ${$t(
            'phoneDashboard.days',
          )}`
        }}
      </div>
    </div>
    <div v-if="cards.length">{{ $t('phoneDashboard.existing_cases') }}</div>
    <div class="flex overflow-x-auto overflow-y-hidden w-full">
      <div
        class="
          cursor-pointer
          bg-crisiscleanup-light-grey
          p-1
          flex-grow-0 flex-shrink-0
          w-32
          h-24
          m-1
        "
        @click="() => setCase(null)"
        :class="Boolean(caseId) ? '' : 'border'"
      >
        <div class="flex flex-col items-center justify-center h-full">
          <ccu-icon
            :alt="$t('actions.create_new')"
            type="add-orange"
            size="xl"
            class="pb-1"
          />
          <base-text variant="h3" class="text-crisiscleanup-dark-400"
            >{{ $t('phoneDashboard.new_case') }}
          </base-text>
        </div>
      </div>
      <div
        class="flex-grow-0 flex-shrink-0 w-56 m-1 h-24"
        v-for="c in cards"
        :key="`${c.id}`"
      >
        <div
          class="cursor-pointer bg-crisiscleanup-light-grey p-1 h-full w-full"
          @click="() => setCase(c)"
          :class="c.id === caseId ? 'border' : ''"
        >
          <div class="flex items-center">
            <div
              v-html="getSVG(c.worktype)"
              class="cases-svg-container p-1"
            ></div>
            <div class="px-1">{{ c.caseNumber }}</div>
          </div>
          <div class="px-1">{{ c.name }}</div>
          <div class="text-xs text-crisiscleanup-dark-200 p-1">
            {{ c.address }} {{ c.state }}
          </div>
        </div>
      </div>
    </div>
    <ccu-icon
      @click.native="$phoneService.hangup"
      v-if="(isOnCall || caller) && isOutboundCall"
      size="lg"
      class="ml-2"
      type="hangup"
    ></ccu-icon>
  </div>
</template>
<script>
import { ConnectFirstMixin, WorksitesMixin } from '@/mixins';
import useScripts from '@/use/phone/useScripts';
import Worksite from '@/models/Worksite';

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
      this.$emit('setCase', caseObject);
    },
    async createCards() {
      if (this.caller) {
        const cases = this.caller.worksites;
        this.cards = cases.map((w) => {
          const c = new Worksite(w);
          return {
            name: c.name,
            caseNumber: c.case_number ? c.case_number : `PDA-${c.id}`,
            address: c.short_address,
            state: c.state,
            worktype: Worksite.getWorkType(c.work_types),
            fullAddress: c.full_address,
            id: c.id,
            type: c.case_number ? 'worksite' : 'pda',
            incident: c.incident,
          };
        });
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

<style>
.cases-svg-container svg {
  width: 25px;
  height: 25px;
}
</style>
