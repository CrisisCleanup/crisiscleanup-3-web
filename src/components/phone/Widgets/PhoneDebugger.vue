<template>
  <div
    class="opreview bg-crisiscleanup-dark-500 text-white shadow-xl opacity-75 w-64 h-128"
    :class="visibleState.state.value ? 'active' : ''"
  >
    <div class="opreview__tabs">
      <div
        @click="() => visibleState.toggle()"
        class="opreview__tab flex justify-center shadow-xl"
        :class="visibleState.state.value ? '' : 'rounded-bl'"
      >
        <base-text variant="bodysm">{{
          visibleState.state.value ? 'Hide' : 'Debugger'
        }}</base-text>
      </div>
      <div
        v-show="visibleState.state.value"
        v-for="p in Object.keys(pages)"
        class="opreview__tab flex justify-center shadow-xl"
        @click="() => (currentPage = p)"
        :class="currentPage === p && 'active'"
      >
        <base-text variant="bodysm" class="py-1">
          {{ p | startCase }}
        </base-text>
      </div>
    </div>

    <div class="opreview__current">
      <div class="opreview__item">
        <base-text variant="h1">
          Phone Debugger
        </base-text>
      </div>
      <div
        class="opreview__item"
        v-for="{ title, value } in pages[currentPage]"
      >
        <base-text variant="h4"> {{ title }} </base-text>
        <base-text variant="bodysm"> {{ value }} </base-text>
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
            checked: 'Polling',
            unchecked: 'Disabled',
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
import { computed, ref } from '@vue/composition-api';
import _ from 'lodash';
import { useState } from '@u3u/vue-hooks';

export default {
  name: 'PhoneDebugger',
  setup() {
    const { actions, state } = useController();
    const { agent } = useAgent();
    const visibleState = useToggle();
    const { currentOutbound, currentContact } = useContact();
    const currentPage = ref('contact');
    const contactState = {
      ...useState('entities/phone/contact', [
        'dnis',
        'worksites',
        'pdas',
        'locale',
        'outbounds',
        'inbound',
        'outbound',
      ]),
    };

    const configParams = [
      'extension',
      'name',
      'username',
      'softphoneEnabled',
      'softphoneAutoAccept',
    ];

    const pages = computed(() => ({
      contact: [
        {
          title: 'Agent State',
          value: _.get(agent, 'value.fullState', 'None'),
        },
        {
          title: 'Contact State',
          value: _.get(currentContact, 'value.fullState', 'None'),
        },
        {
          title: 'Call Type',
          value: _.get(currentContact, 'value.callType', 'None'),
        },
      ].concat(
        currentContact.value
          ? Object.keys(currentContact.value.contactAttributes).map((k) => ({
              title: k,
              value: currentContact.value.contactAttributes[k],
            }))
          : [],
      ),
      state: Object.keys(contactState).map((k) => ({
        title: k,
        value: _.get(contactState.value, k, 'None'),
      })),
      outbound: [
        {
          title: 'Serving Outbound',
          value: _.get(currentOutbound, 'value.phone_number', 'None'),
        },
        {
          title: 'Priority',
          value: _.get(currentOutbound, 'value.priority', '0.00'),
        },
        {
          title: 'Location',
          value: _.get(currentOutbound, 'value.location_name', 'None'),
        },
        {
          title: 'Controller Outbound',
          value: _.get(state, 'outbound', 'None'),
        },
        {
          title: 'Agent State',
          value: _.get(agent, 'value.fullState', 'None'),
        },
        {
          title: 'Contact State',
          value: _.get(currentContact, 'value.fullState', 'None'),
        },
        {
          title: 'Call Type',
          value: _.get(currentContact, 'value.callType', 'None'),
        },
        {
          title: 'Total Outbounds',
          value: _.get(
            state.metrics,
            'value.all.contactsInQueueOutboundAll',
            'None',
          ),
        },
        {
          title: 'Total Callbacks',
          value: _.get(
            state.metrics,
            'value.all.contactsScheduledOutboundAll',
            'None',
          ),
        },
      ],
      config: agent.value
        ? Object.keys(agent.value.connectConfig).map(
            (k) =>
              configParams.includes(k) && {
                title: _.startCase(k),
                value: _.get(agent, `value.connectConfig.${k}`, 'None'),
              },
          )
        : [],
    }));
    return {
      visibleState,
      ...actions,
      ...state,
      currentOutbound,
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
  min-height: calc(theme('spacing.64') * 1.5);
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

      &.active,
      &:hover {
        @apply bg-crisiscleanup-dark-500;
      }
      &.active p {
        @apply font-bold;
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
