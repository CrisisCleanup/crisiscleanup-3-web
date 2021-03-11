// @flow

/**
 * Hook for Phone Scripts
 */

import { Scripts } from '@/store/modules/phone/controller';
import { CallType } from '@/models/phone/Contact';
import { computed } from '@vue/composition-api';
import { wrap } from '@/utils/wrap';
import { theme } from '@/../tailwind.config';
import useUser from '@/use/user/useUser';
import Incident from '@/models/Incident';
import Worksite from '@/models/Worksite';

export type UseScriptsProps = {|
  callType: $Values<typeof CallType>,
  incident: typeof Incident,
  recentWorksite?: typeof Worksite,
|};

export default ({
  callType,
  incident,
  recentWorksite,
}: UseScriptsProps = {}) => {
  const _callType = wrap(callType);
  const _incident = wrap(incident);
  const _recentWorksite = wrap(recentWorksite);

  const scriptColors = {
    [CallType.INBOUND]: theme.extend.colors['phone-inbound-light'],
    [CallType.OUTBOUND]: theme.extend.colors['phone-outbound-light'],
    [CallType.CALLDOWN]: theme.extend.colors['phone-calldown-light'],
  };

  const scriptHeaders = {
    // note: translated later, no $t here.
    [CallType.INBOUND]: [
      'phoneDashboard.inbound_description',
      'phoneDashboard.inbound_call_parenthesis',
    ],
    [CallType.OUTBOUND]: [
      'phoneDashboard.callback_description',
      'phoneDashboard.callback_parenthesis',
    ],
    [CallType.CALLDOWN]: [
      'phoneDashboard.calldown_description',
      'phoneDashboard.calldown_parenthesis',
      [
        {
          title: 'phoneDashboard.if_yes',
          body: 'phoneDashboard.if_yes_instructions_say',
          note: 'phoneDashboard.if_yes_instructions_do',
          accent: theme.extend.colors['crisiscleanup-green']['900'],
        },
        {
          title: 'phoneDashboard.if_no',
          body: 'phoneDashboard.if_no_instructions_say',
          note: 'phoneDashboard.if_no_instructions_do',
          accent: theme.extend.colors['crisiscleanup-red']['600'],
        },
      ],
    ],
  };

  const currentScriptHeader = computed(
    () => scriptHeaders[_callType.value ? _callType.value : CallType.INBOUND],
  );

  const { currentUser } = useUser();

  const currentScript = computed(
    () =>
      currentUser.value &&
      window.vue.$t(
        Scripts[_callType.value ? _callType.value : CallType.INBOUND],
        {
          name: currentUser.value.first_name,
          incidentType: _incident.value ? _incident.value.incident_type : '',
          timeAgo: _recentWorksite.value
            ? window.vue.$moment(_recentWorksite.value.updated_at).fromNow()
            : '',
        },
      ),
  );

  const currentScriptColor = computed(
    () => scriptColors[_callType.value ? _callType.value : CallType.INBOUND],
  );

  return {
    callType: _callType,
    currentScriptColor,
    currentScript,
    currentScriptHeader,
  };
};
