// @flow
/**
 * useAgentState Hook
 */

import AgentClient, { RouteStates } from '@/models/phone/AgentClient';
import { computed, ref } from '@vue/composition-api';
import { ConnectionStates } from '@/models/phone/Connection';
import { unwrap } from '@/utils/wrap';
import _ from 'lodash';

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

  // UI friendly 'action' string to enact state change.
  const _stateAction = {
    // translation takes place in component, no $t here.
    [RouteStates.NOT_ROUTABLE]: '~~Start Taking Calls',
    [RouteStates.ROUTABLE]: '~~Stop Taking Calls',
    [ConnectionStates.PAUSED]: '~~Ready for Next Call',
    NEED_TRAINING: '~~Start Training',
  };

  // Computed UI friendly values from current state.
  const agentState = computed(() => {
    if (!unwrap(isTrained)) {
      return {
        text: _stateAction.NEED_TRAINING,
        enabled: true,
        statusText: _stateAction[RouteStates.NOT_ROUTABLE],
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
        _agent.value.contactState,
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
  const toggleAgentState = async () => {
    if (!_agent.value) {
      context.root.$log.error(
        'tried to change agent state, but no agent available!',
      );
      context.root.$log.error(_agent);
      return;
    }
    _agent.value.toggleOnline();
  };

  const acwDuration = computed(() =>
    _agent.value ? _agent.value.getAcwDuration() / 1000 : 0,
  );

  return {
    agent: _agent,
    agentState,
    toggleAgentState,
    acwDuration,
  };
};
