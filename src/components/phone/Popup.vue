<template>
  <modal v-show="!dismissState.state.value" modal-classes="max-w-lg">
    <template #header>
      <div class="header">
        <DisasterIcon
          v-if="currentIncident && currentIncident.incidentImage"
          :width="50"
          :current-incident="currentIncident"
        />
        <base-text :weight="700" variant="h1"
          >{{ $t('~~Incoming Call for ') }}
          {{ currentIncident.friendlyName }}
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
          <ccu-icon with-text size="md" :type="enums.icons.phone_user">
            <base-text variant="h1" :weight="400">{{ callerName }}</base-text>
          </ccu-icon>
          <ccu-icon with-text size="md" :type="enums.icons.earth_globe">
            <base-text variant="h1" :weight="400">{{
              callState.locale.value
                ? callState.locale.value.name_t.split(' ')[0]
                : 'English'
            }}</base-text>
          </ccu-icon>
        </div>
        <div class="stats">
          <base-text
            class="mobile text-crisiscleanup-dark-500"
            semi-bold
            variant="h1"
            >{{ callerNumber }}</base-text
          >
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
          <span> {{ caseCards.length }} {{ $t('~~ cases ') }} </span>
          {{ $t(' ~~are assigned to this number') }}
        </base-text>
      </div>
      <div class="modal-cases">
        <div v-for="c in caseCards">
          <case-card
            :key="c.caseNumber"
            :case-number="c.caseNumber"
            :address="c.address"
            :state="c.state"
            :worktype="c.worktype"
          />
          <hr class="cases-divider" />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-center p-3">
        <base-button
          :action="() => dismissState.toggle(true)"
          variant="solid"
          size="large"
        >
          {{ $t('~~Dismiss') }}
        </base-button>
      </div>
    </template>
  </modal>
</template>

<script>
import CaseCard from '@/components/cards/Case.vue';
import DisasterIcon from '@/components/DisasterIcon.vue';
import useCaseCards from '@/use/worksites/useCaseCards';
import useUser from '@/use/user/useUser';
import useContact from '@/use/phone/useContact';
import useIncident from '@/use/worksites/useIncident';
import useEnums from '@/use/useEnums';
import useAgent from '@/use/phone/useAgent';
import useToggle from '@/use/useToggle';

export default {
  name: 'IncomingPopup',
  components: { CaseCard, DisasterIcon },
  setup() {
    const { agent } = useAgent();
    const { callerCases, ...contact } = useContact({ agent });
    const dismissState = useToggle();
    return {
      ...contact,
      ...useUser(),
      ...useCaseCards({ cases: callerCases, addNew: false }),
      ...useIncident(),
      ...useEnums(),
      dismissState,
    };
  },
};
</script>

<style scoped lang="scss">
.header {
  display: inline-flex;
  align-items: center;
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

$neg-body-x-pad: calc(0rem - theme('spacing.8'));

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
        display: flex;
        flex-direction: column;
        max-height: 30vh;
        margin-left: $neg-body-x-pad;
        margin-right: $neg-body-x-pad;
        overflow: auto;
        scrollbar-width: none;
        & > div {
          @apply px-8;
        }
        div .cases-divider {
          @apply my-4;
          @apply bg-crisiscleanup-dark-100;
          @include fullwidth;
        }
      }
      &-divider {
        @apply bg-crisiscleanup-dark-100 px-8 mb-6;
        @include fullwidth;
        p span {
          @apply font-bold;
        }
      }
    }
  }
}
</style>
