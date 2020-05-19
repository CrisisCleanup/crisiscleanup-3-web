<template>
  <modal modal-classes="w-108">
    <template #header>
      <div class="header">
        <DisasterIcon
          v-if="currentAniIncident && currentAniIncident.incidentImage"
          :width="50"
          :current-incident="currentAniIncident"
        />
        <base-text :weight="700" variant="h1"
          >{{ $t('~~Incoming Call for ') }}
          {{ currentAniIncident.friendlyName }}
        </base-text>
      </div>
    </template>

    <div class="modal--body">
      <div class="modal-script">
        <base-text variant="body" class="script">
          {{
            $t(
              "~~ Press 1 to let us know you're ready, then we will call you right back with the live call.",
            )
          }}
        </base-text>
        <base-text variant="body" class="script">
          {{
            $t("Don't worry, your number will never be shared with the caller.")
          }}
        </base-text>
      </div>
      <div class="modal-callinfo">
        <div class="caller">
          <ccu-icon with-text size="md" :type="icons.phone_user">
            <base-text variant="h1" :weight="400">{{ callerName }}</base-text>
          </ccu-icon>
          <ccu-icon with-text size="md" :type="icons.earth_globe">
            <base-text variant="h1" :weight="400">{{
              callerLocale.name_t.split(' ')[0]
            }}</base-text>
          </ccu-icon>
        </div>
        <div class="stats">
          <base-text class="mobile" :weight="600" variant="h1">{{
            validatePhoneNumber(callerId).newValue
          }}</base-text>
          <tag class="tag">
            <base-text variant="bodysm">
              {{ callerHistory.total }}
              {{ `${$t(' Calls ')} | ${callerHistory.recent}` }}
            </base-text>
          </tag>
        </div>
      </div>
      <div class="modal-divider">
        <base-text variant="h3" :weight="400">
          <span> {{ previewCaseCards.length }} {{ $t('~~ cases ') }} </span>
          {{ $t(' ~~are assigned to this number') }}
        </base-text>
      </div>
      <div class="modal-cases">
        <case-card
          v-for="c in previewCaseCards"
          :key="c.caseNumber"
          :case-number="c.caseNumber"
          :address="c.address"
          :state="c.state"
          :worktype="c.worktype"
        />
      </div>
    </div>
    <template #footer>
      <div />
    </template>
  </modal>
</template>

<script>
import {
  IncidentMixin,
  UserMixin,
  IconsMixin,
  AgentMixin,
  ValidateMixin,
} from '@/mixins';
import CaseCard from '@/components/cards/Case.vue';
import DisasterIcon from '@/components/DisasterIcon.vue';

export default {
  name: 'IncomingPopup',
  mixins: [UserMixin, IconsMixin, AgentMixin, ValidateMixin, IncidentMixin],
  components: { CaseCard, DisasterIcon },
  async mounted() {
    await this.createCaseCards();
  },
  computed: {
    previewCaseCards() {
      return this.caseCards.filter((c) => c.id !== -1);
    },
  },
};
</script>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-around;
  @apply pt-6 px-6;
  p {
    @apply px-4;
  }
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
            @apply mt-4 pb-6 px-3;
          }
          &:last-child {
            @apply mb-4 px-3;
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
              @apply text-primary-dark text-h4;
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
