<template>
  <div class="p-3 h-full">
    <div class="main-grid">
      <div class="phone-grid">
        <div
          class="p-2 border shadow flex items-start justify-between"
          v-if="$route.meta.id === 'caller'"
        >
          <div class="pb-2">
            <base-text variant="h2">{{ $t('~~English Login:') }}</base-text>
            <base-text>{{ $t('~~Username:') }} english</base-text>
            <base-text>{{ $t('~~Password:') }} volunteer</base-text>
            <!--
            <base-text variant="h2">{{ $t('~~Spanish Login:') }}</base-text>
            <base-text>{{ $t('~~Username:') }} spanish</base-text>
            <base-text>{{ $t('~~Password:') }} volunteer</base-text>
            -->
          </div>
          <div class="pb-2">
            <base-text variant="h2">{{
              $t('~~Disaster Distress Helpline:')
            }}</base-text>
            <base-text>1-800-985-5990</base-text>
          </div>
          <div>
            <div class="pb-2" v-if="cards.length">
              <base-text variant="h2">{{ $t('~~Cases:') }}</base-text>
            </div>
            <div class="h-32 overflow-auto">
              <div class="case" v-for="c in cards" :key="c.id">
                <case-card
                  :key="c.caseNumber"
                  :case-number="c.caseNumber"
                  :state="c.state"
                  :worktype="c.worktype"
                  :address="c.address"
                  :tile="true"
                  :active="c.id === caseId"
                  :type="c.type"
                  @click.native="() => setCase(c)"
                  :svg="getSVG(c.worktype)"
                  class="cursor-pointer hover:bg-crisiscleanup-light-grey p-2"
                  :class="c.id === caseId ? 'border' : ''"
                />
              </div>
            </div>
          </div>
        </div>
        <iframe
          class="border"
          src="https://portal.vacd.biz/agent/#/login"
          width="100%"
          height="100%"
        ></iframe>
      </div>
      <div class="side-grid" v-if="$route.meta.id === 'caller'">
        <div class="p-2 border shadow flex flex-col" v-if="nextOutbound">
          <base-text variant="h3">{{ $t('Next Call:') }}</base-text>
          <div class="flex items-center justify-between">
            <base-text variant="h1">
              {{ nextOutbound && nextOutbound.phone_number }}
            </base-text>
            <base-button
              variant="outline"
              class="ml-2 px-6 text-xs"
              size="small"
              :action="() => $copyText(nextOutbound.phone_number)"
            >
              {{ $t('~~Copy') }}
            </base-button>
          </div>
          <form-select
            class="select"
            :options="selectValues"
            item-key="value"
            label="name_t"
            v-model="status"
            placeholder="Call Status "
            select-classes="border border-crisiscleanup-dark-100"
          />
          <textarea
            rows="3"
            v-model="currentNotes"
            class="text-base border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 my-2 resize-none w-full"
            :placeholder="$t('~~Notes')"
          ></textarea>
          <base-button
            class="self-end"
            size="small"
            variant="solid"
            :action="
              () => {
                updateOutboundStatus();
                getNextCall();
              }
            "
          >
            {{ $t('~~Call Complete - Next Call') }}
          </base-button>
        </div>
        <case-form
          :incident-id="String(currentIncidentId)"
          :pda-id="currentType === 'pda' ? caseId : null"
          :worksite-id="currentType === 'worksite' ? caseId : null"
          :key="caseId"
          disable-claim-and-save
          :data-prefill="prefillData"
          :is-editing="currentType === 'worksite'"
          @savedWorksite="clearCase"
          @closeWorksite="clearCase"
          class="border shadow"
          style="grid-template-rows: 600px 80px;"
          @navigateToWorksite="
            (id) => {
              currentType = 'worksite';
              caseId = id;
            }
          "
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import PhoneOutbound from '@/models/PhoneOutbound';
import PhoneStatus from '@/models/PhoneStatus';
import Worksite from '@/models/Worksite';
import Pda from '@/models/Pda';
import { AgentMixin, WorksitesMixin } from '@/mixins';
import CaseCard from '@/components/cards/case/CaseCard';
import CaseForm from '../CaseForm';

export default {
  name: 'PhoneLegacy',
  components: { CaseCard, CaseForm },
  mixins: [AgentMixin, WorksitesMixin],
  data() {
    return {
      nextOutbound: null,
      worksite: null,
      cases: {},
      cards: [],
      caseId: null,
      currentType: null,
      status: null,
      iframeLoading: true,
      currentNotes: '',
    };
  },
  async mounted() {
    await this.getNextCall();
  },
  methods: {
    setCase(caseObject) {
      this.caseId = caseObject.id;
      this.currentType = caseObject.type;
    },
    /**
     * Clears and refreshes intake form.
     * Because the initial caseId is null,
     * updating it from null => null
     * does NOT trigger a rerender.
     * As a workaround, temporarily set
     * the ID to -1 (or the completed worksite ID)
     * and then reset it to null on the next tick.
     */
    clearCase(worksite) {
      this.caseId = worksite ? worksite.id : -1;
      this.$nextTick(() => {
        this.$log.info('clearing current case!');
        this.caseId = null;
        this.currentType = null;
      });
    },
    async getNextCall() {
      try {
        const outbound = await PhoneOutbound.api().getNextOutbound({
          incidentId: this.currentIncidentId,
        });
        this.nextOutbound = outbound;
      } catch (e) {
        this.nextOutbound = null;
      }
      await this.createCards();
      this.status = null;
      this.currentNotes = '';
      this.clearCase();
      this.caseId = null;
      this.currentType = null;
    },
    getSVG(worktype) {
      return this.getWorktypeSVG(worktype, this.$t('worksiteMap.unclaimed'));
    },
    async createCards() {
      if (this.nextOutbound) {
        let cases = [];
        const { pda, worksite } = this.nextOutbound;
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
    async updateOutboundStatus() {
      await PhoneOutbound.api().updateStatus(this.nextOutbound.id, {
        statusId: this.status,
        notes: this.currentNotes,
        worksiteId: this.worksite ? this.worksite.id : null,
      });
    },
  },
  computed: {
    ...mapState('incident', ['currentIncidentId']),
    statuses() {
      return PhoneStatus.all();
    },
    selectValues() {
      return Object.values(this.statuses).map(({ id, status_name_t }) => {
        return {
          value: id,
          name_t: status_name_t,
        };
      });
    },
    prefillData() {
      if (this.callerId) {
        return {
          phone1: this.callerId,
        };
      }
      return {};
    },
  },
};
</script>

<style scoped lang="scss">
.main-grid {
  display: grid;
  grid-template-columns: minmax(800px, auto) 360px 1px;
  grid-gap: 10px;
}

.side-grid {
  display: grid;
  grid-template-rows: auto minmax(auto, 600px);
  grid-gap: 10px;
}

.phone-grid {
  display: grid;
  grid-template-rows: minmax(auto, 175px) minmax(600px, 700px);
  grid-gap: 10px;
}

.VueCarousel {
  &-slide {
    @apply px-2;
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
  }
}
</style>
