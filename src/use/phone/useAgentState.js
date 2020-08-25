// @flow
/**
 * useAgentState Hook
 */

import AgentClient, {
  AgentStates,
  RouteStates,
} from '@/models/phone/AgentClient';
import { computed, ref } from '@vue/composition-api';
import { ConnectionStates } from '@/models/phone/Connection';
import { unwrap } from '@/utils/wrap';

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
    [AgentStates.OFFLINE]: '~~Start Taking Calls',
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
        statusText: _stateAction[AgentStates.OFFLINE],
      };
    }
    if (!_agent.value) {
      return {
        text: _stateAction[AgentStates.OFFLINE],
        enabled: true,
        statusText: _stateAction[AgentStates.OFFLINE],
      };
    }
    return {
      text:
        _stateAction[
          _agent.value.isOnline ? _agent.value.contactState : _agent.value.state
        ],
      enabled: _agent.value.isRoutable || _agent.value.isOnline === false,
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

  return {
    agent: _agent,
    agentState,
    toggleAgentState,
  };
};
