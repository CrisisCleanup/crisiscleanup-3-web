<template>
  <modal modal-classes="w-108">
    <template #header>
      <div class="header">
        <base-text :weight="700" variant="h1">{{
          $t('Incoming Call')
        }}</base-text>
      </div>
    </template>

    <div class="modal--body">
      <div class="modal-script">
        <base-text variant="body" class="script">
          {{
            $t(
              "You are currently receiving a phone call. Please answer it via your phone to proceed. Don't worry, your number will never be shared with the caller.",
            )
          }}
        </base-text>
        <base-text variant="body" class="script">
          {{
            $t('A sample script would be: "Crisis Cleanup Hotline, my name is ')
          }}
          {{ currentUser.first_name }} {{ $t('. How may I help you?') }}
        </base-text>
      </div>
      <div class="modal-callinfo">
        <div class="caller">
          <ccu-icon with-text size="md" :type="icons.phone_user">
            <base-text variant="h1" :weight="400">{{ callerName }}</base-text>
          </ccu-icon>
          <ccu-icon with-text size="md" :type="icons.earth_globe">
            <base-text variant="h1" :weight="400">{{
              $t('English')
            }}</base-text>
          </ccu-icon>
        </div>
        <div class="stats">
          <base-text class="mobile" :weight="600" variant="h1">{{
            callerId
          }}</base-text>
          <tag class="tag">
            <base-text variant="bodysm">
              {{ callerHistory.total }}
              {{ `${$t(' Calls ')} | ${callerHistory.recent} days` }}
            </base-text>
          </tag>
        </div>
      </div>
      <div class="modal-divider">
        <base-text variant="h3" :weight="400">
          <span> {{ callerTotalCases }} {{ $t(' cases ') }} </span>
          {{ $t(' are assigned to this number') }}
        </base-text>
      </div>
      <div class="modal-cases">
        <case-card
          v-for="c in cards"
          :key="c.caseNumber"
          :case-number="c.caseNumber"
          :address="c.address"
          :state="c.state"
          :worktype="c.worktype"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex items-center justify-center p-6 pt-12">
        <base-button variant="solid" size="large">
          {{ $t('Close') }}
        </base-button>
      </div>
    </template>
  </modal>
</template>

<script>
import { UserMixin, IconsMixin, AgentMixin } from '@/mixins';
import VueTypes from 'vue-types';
import CaseCard from '@/components/cards/Case.vue';

export default {
  name: 'IncomingPopup',
  mixins: [UserMixin, IconsMixin, AgentMixin],
  components: { CaseCard },
  data() {
    return {
      cards: [],
    };
  },
  props: {
    cases: VueTypes.any,
  },
  methods: {
    async createCards() {
      const cases = [
        ...Array.from(this.cases.worksites),
        ...Array.from(this.cases.pdas),
      ];
      this.$log.debug('generating cards from cases:', cases);
      const cards = cases.map((c) => ({
        caseNumber: c.case_number ? c.case_number : `COVID-${c.id}`,
        address: c.short_address,
        state: c.city_state,
        worktype: c.getWorkType ? c.getWorkType() : 'wellness_check',
        fullAddress: c.full_address,
      }));
      this.$log.debug('cards:', cards);
      this.cards = cards;
      return cards;
    },
  },
  async mounted() {
    await this.createCards();
  },
};
</script>

<style scoped lang="scss">
.header {
  @apply pt-6 px-6;
}

@mixin fullwidth {
  margin-left: -2rem;
  margin-right: -2rem;
}

@mixin divider {
  width: 100%;
  height: 1px;
  @apply bg-crisiscleanup-dark-100;
  content: '';
  position: absolute;
  margin-left: -2rem;
  margin-right: -2rem;
}

.modal {
  &--body {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    @apply px-8;
    .modal {
      position: relative;
      &-script {
        @apply py-4;
        &:after {
          @include divider;
        }
        &:before {
          @include divider;
        }
        p.script {
          &:first-child {
            @apply mt-4;
          }
          &:last-child {
            @apply mb-4;
          }
          @apply text-crisiscleanup-dark-300;
        }
      }
      &-callinfo {
        @apply pb-4;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        .caller {
          display: flex;
          @apply pt-2;
          div {
            @apply pr-4;
            p {
              @apply text-crisiscleanup-dark-300;
            }
          }
        }
        .stats {
          @apply py-2;
          display: flex;
          div {
            @apply px-2;
          }
          p.mobile {
            @apply text-xl;
          }

          .tag {
            @apply mx-4;
            @apply border-primary-dark;
            border-radius: 500px;
            p {
              @apply px-2;
              @apply text-primary-dark;
            }
          }
        }
      }

      &-cases {
        @apply my-3 mt-6;
        display: flex;
        flex-direction: column;
      }
      &-divider {
        @apply bg-crisiscleanup-dark-100 px-8;
        @include fullwidth;
        p span {
          @apply font-bold;
        }
      }
    }
  }
}
</style>
