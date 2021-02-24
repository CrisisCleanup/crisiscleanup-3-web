// @flow
/**
 * useAgentState Hook
 */

import AgentClient, { RouteStates } from '@/models/phone/AgentClient';
import { computed, ref, watch } from '@vue/composition-api';
import { ConnectionStates } from '@/models/phone/Connection';
import { unwrap } from '@/utils/wrap';
import _ from 'lodash';
import { useIntervalFn } from '@/use/useIntervalFn';
import { useState, useGetters } from '@u3u/vue-hooks';

/**
 * Utilize current agent state to compute UI components.
 * @param agent - agent provided by useAgent hook.
 * @param isTrained - has agent completed training?
 * @param context - component context.
 * @returns {{agent: Ref<UnwrapRef<AgentClient>>, agentState: ComputedRef<unknown>, toggleAgentState: toggleAgentState}}
 */
export default ({
  agent,
  context,
  isTrained,
}: {
  agent: AgentClient,
  context: any,
  isTrained: boolean,
}) => {
  const _agent = ref<AgentClient>(agent);
  const _acwElapsed = ref(0);
  const streamsState = {
    ...useState('phone.streams', ['connected']),
  };
  const ctrlGetters = {
    ...useGetters('phone.controller', ['isCallActive']),
  };

  // UI friendly 'action' string to enact state change.
  const _stateAction = {
    // translation takes place in component, no $t here.
    [RouteStates.NOT_ROUTABLE]: 'actions.start_taking_calls',
    [RouteStates.ROUTABLE]: 'actions.stop_taking_calls',
    [ConnectionStates.PAUSED]: 'actions.ready_for_next_call',
    NEED_TRAINING: 'actions.start_training',
    DISCONNECTED: 'actions.no_connection',
  };

  // Computed UI friendly values from current state.
  const agentState = computed(() => {
    if (!streamsState.connected.value) {
      return {
        text: _stateAction.DISCONNECTED,
        enabled: false,
        statusText: 'phoneDashboard.disconnected',
      };
    }
    if (!unwrap(isTrained)) {
      return {
        text: _stateAction.NEED_TRAINING,
        enabled: true,
        statusText: _stateAction.NEED_TRAINING,
      };
    }
    if (!_agent.value) {
      return {
        text: _stateAction[RouteStates.NOT_ROUTABLE],
        enabled: true,
        statusText: _stateAction[RouteStates.NOT_ROUTABLE],
      };
    }
    return {
      text: _.get(
        _stateAction,
        _agent.value ? _agent.value.contactState : RouteStates.NOT_ROUTABLE,
        _stateAction[_agent.value.routeState],
      ),
      enabled:
        _agent.value.isConnecting === false &&
        _agent.value.isConnected === false,
      statusText: _agent.value.isOnline
        ? _agent.value.friendlyState
        : _agent.value.state,
    };
  });

  /**
   * Toggle agent connection state.
   * @returns {Promise<void>}
   */
  const toggleAgentState = async ({
    userInitiated = false,
  }: { userInitiated: boolean } = {}) => {
    if (!_agent.value) {
      context.root.$log.error(
        'tried to change agent state, but no agent available!',
      );
      context.root.$log.error(_agent);
      return;
    }
    if (ctrlGetters.isCallActive.value) {
      if (userInitiated) {
        context.root.$toasted.error(
          context.root.$t('phoneDashboard.call_status_required_before_next'),
        );
      }
      return;
    }
    _agent.value.toggleOnline(null, userInitiated);
  };

  const acwTimer = useIntervalFn(() => {
    if (_agent.value) {
      const val = _agent.value.getAcwDuration();
      if (val > 0) {
        _acwElapsed.value = val / 1000;
      }
    }
  }, 1000);

  watch(
    () => (_agent.value ? _agent.value.contactState : _agent.value),
    () => {
      if (_agent.value.contactState === ConnectionStates.PAUSED) {
        acwTimer.start();
      } else {
        if (_acwElapsed.value) {
          acwTimer.stop();
          _agent.value.toggleOnline(true);
        }
        _acwElapsed.value = 0;
      }
    },
  );

  const acwDuration = computed(() => _acwElapsed.value);

  return {
    agent: _agent,
    agentState,
    toggleAgentState,
    acwDuration,
    connected: streamsState.connected,
  };
};
