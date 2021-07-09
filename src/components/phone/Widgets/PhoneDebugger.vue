<template>
  <div
    class="
      opreview
      bg-crisiscleanup-dark-500
      text-white
      shadow-xl
      opacity-75
      w-64
      h-128
    "
    :class="visibleState.state.value ? 'active' : ''"
  >
    <div class="opreview__tabs">
      <div
        @click="() => visibleState.toggle()"
        class="opreview__tab flex justify-center shadow-xl"
        :class="[
          visibleState.state.value ? '' : 'rounded-bl',
          pageError !== '' && '--has-error',
        ]"
      >
        <base-text variant="bodysm">{{
          visibleState.state.value
            ? $t('phoneDashboard.hide')
            : $t('phoneDashboard.debugger')
        }}</base-text>
      </div>
      <div
        v-show="visibleState.state.value"
        v-for="p in Object.keys(pages)"
        :key="p"
        class="opreview__tab flex justify-center shadow-xl"
        @click="() => (currentPage = p)"
        :class="[
          currentPage === p && '--active',
          pageError === p && '--has-error',
        ]"
      >
        <base-text variant="bodysm" class="py-1">
          {{ p | startCase }}
        </base-text>
      </div>
    </div>

    <div class="opreview__current">
      <div class="opreview__item">
        <base-text variant="h1"> Phone Debugger </base-text>
      </div>
      <div
        class="opreview__item"
        v-for="{ title, value, action } in pages[currentPage]"
        :key="`${title}-${value}-${action}`"
      >
        <base-text variant="h4"> {{ $t(title) }} </base-text>
        <base-text v-if="value" variant="bodysm"> {{ value }} </base-text>
        <base-button variant="outline" v-if="action" :action="action.method">{{
          $t(action.label)
        }}</base-button>
      </div>
    </div>
    <div class="opreview__config">
      <div class="flex h-full">
        <base-text variant="h3">Enable Outbounds:</base-text>
        <toggle-button
          :value="isServingOutbounds"
          sync
          :font-size="14"
          :width="85"
          :labels="{
            checked: $t('phoneDashboard.polling'),
            unchecked: $t('phoneDashboard.disabled'),
          }"
          @input="toggleServeState"
        />
      </div>
    </div>
  </div>
</template>

<script>
import useController from '@/use/phone/useController';
import useAgent from '@/use/phone/useAgent';
import useContact from '@/use/phone/useContact';
import useToggle from '@/use/useToggle';
import { computed, ref, watch } from '@vue/composition-api';
import _ from 'lodash';
import { useState } from '@u3u/vue-hooks';
import { ControllerPages } from '@/store/modules/phone/controller';
import { useLocalStorage } from 'vue-composable';
import useUser from '@/use/user/useUser';

export default {
  name: 'PhoneDebugger',
  setup(props, context) {
    const { actions, state } = useController();
    const { agent } = useAgent();
    const visibleState = useToggle();
    const { currentContact } = useContact();
    const { currentUser } = useUser();
    const currentPage = ref('contact');
    const pageError = ref('');
    const scriptStorage = useLocalStorage('ccu-ivr-hide-script', false);
    const contactState = {
      ...useState('entities/phone/contact', [
        'dnis',
        'worksites',
        'pdas',
        'locale',
        'outbounds',
        'inbound',
        'outbound',
        'incident',
        'resolveTask',
        'resolveRequested',
      ]),
    };

    const contactStateInfo = computed(() => {
      return _.map(contactState, (stateItem, key) => {
        if (stateItem.value) {
          return _.isArray(stateItem.value)
            ? [key, _.map(stateItem.value, 'id')]
            : [key, _.get(stateItem.value, 'id', stateItem.value)];
        }
        return [key, 'None'];
      });
    });

    const configParams = [
      'extension',
      'name',
      'username',
      'softphoneEnabled',
      'softphoneAutoAccept',
    ];

    const isIAMUser = computed(() => {
      if (agent.value) {
        const conUsername = agent.value.connectConfig.username;
        return conUsername !== currentUser.value.email;
      }
      return false;
    });

    watch(
      () => isIAMUser.value,
      () => {
        if (isIAMUser.value === true) {
          pageError.value = 'config';
        } else {
          pageError.value = '';
        }
      },
    );

    const pages = computed(() => ({
      contact: [
        {
          title: 'phoneDashboard.contact_id_store',
          value: _.get(currentContact, 'value.contactId', 'None'),
        },
        {
          title: 'phoneDashboard.contact_id_connect',
          value: _.get(currentContact, 'value.connectContactId', 'None'),
        },
        {
          title: 'phoneDashboard.contact_state',
          value: _.get(currentContact, 'value.fullState', 'None'),
        },
        {
          title: 'phoneDashboard.call_type',
          value: _.get(currentContact, 'value.callType', 'None'),
        },
        {
          title: 'phoneDashboard.has_resolved_cases',
          value: _.get(currentContact, 'value.hasResolvedCases', 'No'),
        },
        {
          title: '~~Call Pending',
          value: _.get(currentContact, 'value.callPending', 'No'),
        },
        {
          title: '~~Contact Ready',
          value: _.get(currentContact, 'value.isReady', 'No'),
        },
        {
          title: 'phoneDashboard.agent_state',
          value: _.get(agent, 'value.fullState', 'None'),
        },
      ].concat(
        currentContact.value
          ? Object.keys(currentContact.value.contactAttributes).map((k) => ({
              title: k,
              value: currentContact.value.contactAttributes[k],
            }))
          : [],
      ),
      state: contactStateInfo.value
        .map(([k, v]) => ({
          title: k,
          value: v,
        }))
        .concat([
          {
            title: 'Recent Worksite',
            value: _.get(currentContact, 'value.mostRecentWorksite', 'None'),
          },
        ]),
      outbound: [
        {
          title: 'phoneDashboard.serving_outbound',
          value: _.get(state.currentOutbound, 'value.phone_number', 'None'),
        },
        {
          title: 'phoneDashboard.outbound_id_completion',
          value: [
            _.get(state.currentOutbound, 'value.id', 'None'),
            _.get(state.currentOutbound, 'value.completion', 'None'),
          ].join(' / '),
        },
        {
          title: 'phoneDashboard.priority',
          value: _.get(state.currentOutbound, 'value.priority', '0.00'),
        },
        {
          title: 'phoneDashboard.location',
          value: _.get(state.currentOutbound, 'value.location_name', 'None'),
        },
        {
          title: 'phoneDashboard.agent_state',
          value: _.get(agent, 'value.fullState', 'None'),
        },
        {
          title: 'phoneDashboard.contact_state',
          value: _.get(currentContact, 'value.fullState', 'None'),
        },
        {
          title: 'phoneDashboard.call_type',
          value: _.get(currentContact, 'value.callType', 'None'),
        },
        {
          title: 'phoneDashboard.total_outbounds',
          value: _.get(
            state.metrics,
            'value.all.contactsInQueueOutboundAll',
            'None',
          ),
        },
        {
          title: 'phoneDashboard.total_callbacks',
          value: _.get(
            state.metrics,
            'value.all.contactsScheduledOutboundAll',
            'None',
          ),
        },
      ],
      config: agent.value
        ? [
            ...Object.keys(agent.value.connectConfig).map(
              (k) =>
                configParams.includes(k) && {
                  title: _.startCase(k),
                  value: _.get(agent, `value.connectConfig.${k}`, 'None'),
                },
            ),
            {
              title: 'Is IAM User',
              value: isIAMUser.value,
            },
          ]
        : [],
      debug: [
        {
          title: 'phoneDashboard.controller_page',
          value: state.view.value.page,
          action: {
            label: 'phoneDashboard.toggle',
            method: () =>
              actions.setView({
                page:
                  state.view.value.page === ControllerPages.DASHBOARD
                    ? ControllerPages.CONTROLLER
                    : ControllerPages.DASHBOARD,
              }),
          },
        },
        {
          title: 'phoneDashboard.script_popup',
          value: scriptStorage.storage.value,
          action: {
            label: 'phoneDashboard.toggle',
            method: () => {
              scriptStorage.storage.value = !scriptStorage.storage.value;
            },
          },
        },
        {
          title: '~~Dump Phone Store',
          action: {
            label: '~~Execute',
            method: () => {
              context.root.$log.info(agent.value);
              context.root.$log.info(currentContact.value);
            },
          },
        },
      ],
    }));
    return {
      pageError,
      visibleState,
      ...actions,
      ...state,
      agent,
      pages,
      currentPage,
      async toggleServeState(value) {
        await actions.setServingOutbounds(value);
      },
    };
  },
};
</script>

<style scoped lang="postcss">
@lost flexbox flex;
$neg-left: calc(0rem - theme('width.4'));
$neg-hidden: calc(0rem - theme('width.64'));

.opreview {
  position: fixed;
  bottom: 0;
  right: 0;
  @apply p-3;
  lost-flex-container: column;
  transform: translateX(theme('width.64'));
  transition: transform 250ms easeInOutCirc;
  min-height: calc(theme('spacing.64') * 1.75);
  &.active {
    transform: translateX(0px);
  }
  &__current {
    max-height: 50vh;
    overflow: auto;
    lost-row: 4/5;
    scrollbar-width: none;
    ^&__item {
      &:first-child {
        @apply pb-3;
      }
      p {
        @apply text-white;
      }
    }
  }
  &__config {
    lost-row: 1/5;
    & > div {
      align-items: flex-end;
      justify-content: space-evenly;

      p {
        @apply text-white;
        line-height: 22px !important;
      }
    }
  }
  &__tabs {
    position: absolute;
    left: $neg-left;
    top: 0;

    .opreview__tab {
      transition: background-color 250ms easeInOutCirc;
      @apply w-4 h-16 bg-crisiscleanup-dark-400;
      align-items: center;
      cursor: pointer;

      &.--active,
      &:hover {
        @apply bg-crisiscleanup-dark-500;
      }
      &.--active p {
        @apply font-bold;
      }
      &.--has-error p {
        @apply text-crisiscleanup-red-600 font-bold;
        animation: pulse 1s infinite;
      }
      p {
        @apply text-white;
        writing-mode: vertical-rl;
      }
      &:first-child {
        @apply rounded-tl;
        opacity: 1;
      }
      &:last-child {
        @apply rounded-bl;
      }
    }
  }
}
</style>
