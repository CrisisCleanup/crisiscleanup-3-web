<template>
  <modal
    v-show="!dismissState.state.value"
    modal-classes="max-w-2xl max-h-screen overflow-auto"
  >
    <template #header>
      <div></div>
    </template>

    <div class="popup">
      <div class="popup__header">
        <div
          class="header__title"
          :class="`header__title--${callType.toLowerCase()}`"
        >
          <div class="inline-flex align-center">
            <base-text bold variant="h2">{{
              $t(currentScriptHeader[1]).replace('(', '').replace(')', '')
            }}</base-text>
          </div>
        </div>

        <div
          class="header__body"
          :class="`header__body--${callType.toLowerCase()}`"
        >
          <base-text variant="h3">{{ $t(currentScriptHeader[0]) }}</base-text>
          <base-text variant="bodysm">
            {{ `"${$t(currentScript)}"` }}
          </base-text>
        </div>
        <div
          class="header__footer"
          :class="`header__footer--${callType.toLowerCase()}`"
          v-if="currentScriptHeader.length > 2"
        >
          <div
            v-for="item in currentScriptHeader[2]"
            class="item"
            :key="item.title"
          >
            <div class="item__left" :style="{ backgroundColor: item.accent }">
              <base-text variant="h3" bold>
                {{ $t(item.title).replace('IF', '') | capitalize }}
              </base-text>
            </div>
            <div class="item__right">
              <base-text variant="bodysm" :style="{ color: item.accent }">
                {{ $t(item.body) }}
              </base-text>
              <base-text variant="bodysm" class="text-crisiscleanup-dark-400">
                {{ $t(item.note).replace('(', '').replace(')', '') }}
              </base-text>
            </div>
          </div>
        </div>
      </div>

      <div class="popup__body">
        <div class="body__caller">
          <div class="caller__left">
            <base-text
              variant="h1"
              class="text-crisiscleanup-dark-500 pr-3"
              normal
            >
              {{ callerNumber }}
            </base-text>
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
          <div class="caller__right">
            <ccu-icon
              class="pr-3"
              with-text
              size="sm"
              :type="enums.icons.phone_user"
              :alt="$t('phoneDashboard.caller_name')"
            >
              <base-text variant="h3" :weight="400">{{ callerName }}</base-text>
            </ccu-icon>
            <ccu-icon
              with-text
              size="sm"
              :type="enums.icons.earth_globe"
              :alt="$t('phoneDashboard.locale')"
            >
              <base-text variant="h3" :weight="400">{{
                callState.locale.value
                  ? callState.locale.value.name_t.split(' ')[0]
                  : 'English'
              }}</base-text>
            </ccu-icon>
          </div>
        </div>

        <div class="body__cases">
          <div class="cases__title">
            <base-text variant="h3" :weight="400">
              <span class="font-bold">
                {{ caseCards.length }}
              </span>
              {{ $t('phoneDashboard.cases_assigned_to_number') }}
            </base-text>
          </div>
          <div class="cases__body overflow-hidden">
            <div v-for="c in caseCards.slice(0, 3)" :key="`${c.caseNumber}`">
              <case-card
                class="case-card"
                v-bind="c"
                :tile="true"
                :interactive="false"
                :small="true"
              />
            </div>
            <div v-if="caseCards.length > 3" class="case-card-extra">
              <base-text>
                {{ `+${caseCards.length - 3}` }}
              </base-text>
            </div>
          </div>
        </div>
      </div>

      <div class="popup__footer">
        <div class="footer__actions">
          <base-button
            :action="() => skipCall()"
            variant="solid"
            size="large"
            class="btn-danger text-white"
            :disabled="hasResponded !== null"
            :show-spinner="hasResponded === 'skip'"
          >
            {{ $t('actions.skip_call') }}
          </base-button>
          <ProgressButton
            :total="25"
            :action="() => acceptCall()"
            @update:done="() => skipCall()"
            variant="solid"
            size="large"
            class="btn-success"
            :value="acceptTime"
            :show-spinner="hasResponded === 'accept'"
            reverse
          >
            {{
              hasResponded === 'accept'
                ? $t('~~Connecting')
                : $t('~~Accept') + ` (${acceptTime}s)`
            }}
          </ProgressButton>
        </div>
      </div>
    </div>

    <template #footer>
      <div></div>
    </template>
  </modal>
</template>

<script>
import CaseCard from '@/components/cards/Case.vue';
import useCaseCards from '@/use/worksites/useCaseCards';
import useUser from '@/use/user/useUser';
import useContact from '@/use/phone/useContact';
import useIncident from '@/use/worksites/useIncident';
import useEnums from '@/use/useEnums';
import useToggle from '@/use/useToggle';
import useScripts from '@/use/phone/useScripts';
import { useActions, useMutations } from '@u3u/vue-hooks';
import { ContactActions, ContactStates } from '@/models/phone/Contact';
import PhoneInbound from '@/models/PhoneInbound';
import PhoneOutbound from '@/models/PhoneOutbound';
import useAgent from '@/use/phone/useAgent';
import { InboundActions } from '@/store/modules/phone/streams';
import ProgressButton from '@/components/buttons/ProgressButton.vue';
import { useIntervalFn } from '@/use/useIntervalFn';
import { ref, watch, watchEffect } from '@vue/composition-api';
import VueTypes from 'vue-types';

export default {
  name: 'IncomingPopup',
  components: { CaseCard, ProgressButton },
  props: {
    /**
     * Whether the popup is active or not.
     */
    active: VueTypes.bool.def(false),
  },
  setup(props, context) {
    const {
      callerCases,
      callType,
      callState,
      currentContact,
      activeIncident,
      ...contact
    } = useContact();
    const { setNextInboundAction } = useMutations('phone.streams', [
      'setNextInboundAction',
    ]);
    const { updateContact } = useActions('phone.streams', ['updateContact']);
    const { clearState } = useActions('phone.controller', ['clearState']);
    const { agent } = useAgent();
    const dismissState = useToggle();
    const { currentIncident } = useIncident();

    /**
     * Time left to accept.
     * @type {Ref<UnwrapRef<number>>}
     */
    const acceptTime = ref(0);
    /**
     * Current action user responded with.
     * @type {null}
     */
    const hasResponded = ref(null);

    /**
     * Timer controller for allotted accept time.
     * @type {{resume: resume, stop: pause, start: resume, isActive: Ref<UnwrapRef<boolean>>, pause: pause}}
     */
    const acceptTimer = useIntervalFn(
      () => {
        if (acceptTime.value >= 1) {
          acceptTime.value -= 1;
        }
      },
      1000,
      false,
    );

    /**
     * Reset/Start timer depending on the active prop.
     */
    watch(
      () => props.active,
      (active, prevActive) => {
        if (active && !prevActive) {
          acceptTime.value = 25;
          hasResponded.value = null;
          acceptTimer.start();
        } else {
          acceptTimer.stop();
        }
      },
    );

    // Stop the accept timer on user response.
    watch(hasResponded, (responded) => responded && acceptTimer.stop());

    /**
     * Inbound contact connection poll response.
     */
    const inboundResponse = ref(null);
    /**
     * Interval for polling inbound contact connection status.
     * @type {{resume: resume, stop: pause, start: resume, isActive: Ref<UnwrapRef<boolean>>, pause: pause}}
     */
    const inboundPollTimer = useIntervalFn(
      async () => {
        context.root.$log.info('polling inbound connection...');
        if (callState.inbound.value) {
          inboundResponse.value = await PhoneInbound.api().pollConnection(
            callState.inbound.value.id,
          );
        } else {
          context.root.$log.warn(
            'Tried to poll inbound, but there is no active ID!',
            callState,
          );
        }
      },
      5000,
      false,
    );

    /**
     * Watches for completed connection.
     * Ends status polling + indicates received call.
     */
    watchEffect(() => {
      if (
        inboundResponse.value === true &&
        contact.callConnected.value === true
      ) {
        context.root.$log.info('Contact has been routed!');
        PhoneInbound.api()
          .receiveConnection(callState.inbound.value.id)
          .then((resp) => {
            context.root.$log.info(`Ending inbound response poll: ${resp}`);
            inboundPollTimer.stop();
          });
      }
    });

    const skipCall = async () => {
      if (hasResponded.value) return;
      hasResponded.value = 'skip';
      if (callState.inbound.value && currentContact.value.isInbound) {
        setNextInboundAction(InboundActions.SKIP);
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

    const acceptCall = async () => {
      if (hasResponded.value) return;
      hasResponded.value = 'accept';
      acceptTime.value = 0;
      context.root.$log.info(
        'user accepted call!',
        callState,
        currentContact.value,
      );
      if (callState.outbound.value && !currentContact.value.isInbound) {
        context.root.$log.info('accepting outbound!');
        await PhoneOutbound.api().acceptCall(callState.outbound.value.id);
      } else {
        context.root.$log.info('accepting inbound!');
        setNextInboundAction(InboundActions.VERIFY);
        await PhoneInbound.api().acceptCall(callState.inbound.value.id);
        inboundPollTimer.start();
      }
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
      hasResponded,
      skipCall,
      acceptCall,
      acceptTime,
      acceptTimer,
    };
  },
};
</script>

<style scoped lang="postcss">
.popup {
  &__header {
    flex: 1;
  }
  &__body {
    flex: 3;
  }
  &__footer {
    flex: 3;
  }
}

.popup__header {
  .header {
    &__title {
      @apply p-3 px-6;
      &--inbound {
        @apply bg-phone-inbound-dark;
      }
      &--outbound {
        @apply bg-phone-outbound-dark;
      }
      &--calldown {
        @apply bg-phone-calldown-dark;
      }
      p {
        @apply text-white;
      }
    }

    &__body {
      @apply p-3 px-6;
      &--inbound {
        @apply bg-phone-inbound-light;
      }
      &--outbound {
        @apply bg-phone-outbound-light;
      }
      &--calldown {
        @apply bg-phone-calldown-light;
      }
    }

    &__footer {
      @apply p-3 px-6 pb-4;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      &--inbound {
        @apply bg-phone-inbound-light;
      }
      &--outbound {
        @apply bg-phone-outbound-light;
      }
      &--calldown {
        @apply bg-phone-calldown-light;
      }
      .item {
        display: flex;
        flex-direction: row;
        flex: 1;
        &:first-child {
          @apply pr-3;
        }
        &__left {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          p {
            @apply text-white;
          }
        }
        &__right {
          flex: 3;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          @apply bg-white p-1;
        }
      }
    }
  }
}

.popup__body {
  @apply p-3 px-6;
  .body {
    &__caller {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .caller {
        &__left {
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          .tag {
            @apply border-primary-dark;
            border-radius: 500px;
            p {
              @apply px-2;
              @apply text-primary-dark text-h4;
            }
          }
        }
        &__right {
          display: inline-flex;
          flex-direction: row;
          align-items: center;
        }
      }
    }

    &__cases {
      @apply py-3;
      .cases {
        &__title {
          display: inline-flex;
          align-items: center;
          flex-direction: row;
          @apply pb-2;
        }
        &__body {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: row;
          .case-card {
            @apply mr-2;
          }
          .case-card-extra {
            @apply rounded-full bg-crisiscleanup-smoke p-2 ml-2;
            justify-self: flex-end;
          }
        }
      }
    }
  }
}

.popup__footer {
  @apply p-3 px-6;
  .footer {
    &__actions {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
    }
  }
}

.btn-danger {
  @apply bg-crisiscleanup-red-300 !important;
}
</style>
