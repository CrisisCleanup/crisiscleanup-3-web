<template>
  <modal v-show="!dismissState.state.value" modal-classes="max-w-xl">
    <template #header>
      <div
        class="modal-script"
        :style="{ backgroundColor: currentScriptColor }"
      >
        <div class="script__header">
          <div class="script__title flex">
            <base-text variant="h1" semi-bold>
              {{ $t(currentScriptHeader[0]) }}
            </base-text>
            <base-text variant="h1" bold>
              {{ ' ' + $t(currentScriptHeader[1]) }}
            </base-text>
          </div>
          <div class="script__body flex">
            <base-text variant="body">
              {{ `"${$t(currentScript)}"` }}
            </base-text>
          </div>
        </div>
        <div
          v-if="currentScriptHeader.length >= 2"
          class="script__footer flex justify-center items-center pt-3 px-2 w-full h-full"
        >
          <template v-for="item in currentScriptHeader[2]">
            <div :key="item.title" class="flex items-center px-2 flex-1">
              <base-text variant="h1" :style="{ color: item.accent }" bold>
                {{ $t(item.title) }}
              </base-text>
              <div class="flex flex-col text-crisiscleanup-dark-400 px-3">
                <base-text variant="bodysm" :style="{ color: item.accent }">
                  {{ $t(item.body) }}
                </base-text>
                <base-text variant="bodysm" class="text-crisiscleanup-dark-400">
                  {{ $t(item.note) }}
                </base-text>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="header">
        <DisasterIcon
          v-if="activeIncident && activeIncident.incidentImage"
          :current-incident="activeIncident"
        />
        <base-text :weight="700" variant="h1"
          >{{
            $t('phoneDashboard.incoming_call_for_incident', {
              incidentName: activeIncident && activeIncident.friendlyName,
            })
          }}
        </base-text>
      </div>
    </template>

    <div class="modal--body">
      <div class="modal-callinfo">
        <div class="caller">
          <ccu-icon
            with-text
            size="md"
            :type="enums.icons.phone_user"
            :alt="$t('phoneDashboard.caller_name')"
          >
            <base-text variant="h1" :weight="400">{{ callerName }}</base-text>
          </ccu-icon>
          <ccu-icon
            with-text
            size="md"
            :type="enums.icons.earth_globe"
            :alt="$t('phoneDashboard.locale')"
          >
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
              {{
                ` ${$t('phoneDashboard.calls')} | ${$t(
                  'phoneDashboard.most_recent',
                )} ${$t(callerHistory.recent)}`
              }}
            </base-text>
          </tag>
        </div>
      </div>
      <div class="modal-divider">
        <base-text variant="h3" :weight="400">
          <span>
            {{ caseCards.length }}:
            {{ $t('phoneDashboard.cases_assigned_to_number') }}
          </span>
        </base-text>
      </div>
      <div class="modal-cases">
        <div v-for="c in caseCards" :key="`${c.caseNumber}`">
          <case-card
            :case-number="c.caseNumber"
            :address="c.address"
            :state="c.state"
            :worktypes="c.worktypes"
          />
          <hr class="cases-divider" />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-around p-6">
        <base-button
          :action="() => dismissState.toggle(true)"
          variant="solid"
          size="large"
        >
          {{ $t('actions.hide') }}
        </base-button>
        <base-button
          :action="() => skipCall()"
          variant="solid"
          size="large"
          class="btn-danger"
        >
          {{ $t('actions.skip_call') }}
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
import useToggle from '@/use/useToggle';
import useScripts from '@/use/phone/useScripts';
import { useActions } from '@u3u/vue-hooks';
import { ContactActions, ContactStates } from '@/models/phone/Contact';
import PhoneInbound from '@/models/PhoneInbound';
import PhoneOutbound from '@/models/PhoneOutbound';
import useAgent from '@/use/phone/useAgent';

export default {
  name: 'IncomingPopup',
  components: { CaseCard, DisasterIcon },
  setup() {
    const {
      callerCases,
      callType,
      callState,
      currentContact,
      activeIncident,
      ...contact
    } = useContact();
    const { updateContact } = useActions('phone.streams', ['updateContact']);
    const { clearState } = useActions('phone.controller', ['clearState']);
    const { agent } = useAgent();
    const dismissState = useToggle();
    const { currentIncident } = useIncident();

    const skipCall = async () => {
      if (callState.inbound.value && currentContact.value.isInbound) {
        await PhoneInbound.api().skipCall(callState.inbound.value.id);
      }
      if (callState.outbound.value && !currentContact.value.isInbound) {
        await PhoneOutbound.api().skipCall(callState.outbound.value.id);
      }
      await updateContact({
        action: ContactActions.MISSED,
        state: ContactStates.ROUTED,
      });
      await clearState({ agentId: agent.value.agentId });
    };

    return {
      activeIncident,
      currentIncident,
      currentContact,
      callState,
      ...contact,
      ...useCaseCards({ cases: callerCases, addNew: false }),
      ...useUser(),
      ...useEnums(),
      ...useScripts({
        callType,
        incident: activeIncident,
        recentWorksite: currentContact.value
          ? currentContact.value.recentWorksite
          : null,
      }),
      callType,
      dismissState,
      skipCall,
    };
  },
};
</script>

<style scoped lang="scss">
.header {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  @apply w-full;
  @apply py-4 px-6;
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
  @apply bg-crisiscleanup-dark-300;
  opacity: 0.25;
  content: '';
  position: absolute;
}

$neg-body-x-pad: calc(0rem - theme('spacing.8'));

.modal {
  &-script {
    @apply py-8 w-full shadow-sm;
    .script {
      &__header {
        position: relative;
        .script__title {
          justify-content: center;
          flex-wrap: wrap;
          text-align: center;
          p {
            &:first-child {
              @apply pr-2;
            }
            @apply text-crisiscleanup-dark-500;
          }
        }
        .script__body {
          @apply h-full w-full;
          justify-content: center;
          align-items: stretch;
          @apply py-4 px-6;
          &:after {
            @include divider;
          }
          &:before {
            @include divider;
            bottom: 0;
          }
          p {
            text-align: center;
            @apply text-crisiscleanup-dark-400 pt-4 px-4;
          }
        }
      }
    }
  }

  &--body {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    @apply px-8;
    .modal {
      position: relative;
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
.btn-danger {
  @apply bg-crisiscleanup-red-300 #{!important};
}
</style>
