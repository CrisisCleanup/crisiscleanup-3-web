// @ts-nocheck TODO(tabiodun): Fix this file
/**
 * Hook for Phone Scripts
 */

import { computed } from 'vue';
import * as config from 'tailwind.config';
import moment from 'moment';
import { wrap } from '../../utils/wrap';
import type Incident from '../../models/Incident';
import type Worksite from '../../models/Worksite';
import useCurrentUser from '../useCurrentUser';
import { i18n } from '../../main';

const { theme } = config;

const CallType = Object.freeze({
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
  CALLDOWN: 'CALLDOWN',
});

const Scripts = Object.freeze({
  [CallType.INBOUND]: 'phoneDashboard.inbound_script',
  [CallType.OUTBOUND]: 'phoneDashboard.outbound_script',
  [CallType.CALLDOWN]: 'phoneDashboard.calldown_script',
});

type UseScriptsProps = {
  callType: typeof CallType;
  incident: typeof Incident;
  recentWorksite?: typeof Worksite;
};

export default ({ callType, incident, recentWorksite }: UseScriptsProps) => {
  const _callType = wrap(callType);
  const _incident = wrap(incident);
  const _recentWorksite = wrap(recentWorksite);

  const scriptColors = {
    [CallType.INBOUND]: theme.extend.colors['phone-inbound'],
    [CallType.OUTBOUND]: theme.extend.colors['phone-outbound'],
    [CallType.CALLDOWN]: theme.extend.colors['phone-calldown'],
  };

  const scriptHeaders = {
    // Note: translated later, no $t here.
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

  const { currentUser } = useCurrentUser();

  const currentScript = computed(
    () =>
      currentUser &&
      i18n.global.t(
        Scripts[_callType.value ? _callType.value : CallType.INBOUND],
        {
          name: currentUser.first_name,
          incidentType: _incident.value ? _incident.value.incident_type : '',
          timeAgo: _recentWorksite.value
            ? moment(_recentWorksite.value.updated_at).fromNow()
            : '',
        },
      ),
  );

  const currentScriptColor = computed(
    () =>
      scriptColors[_callType.value ? _callType.value : CallType.INBOUND].light,
  );

  const currentCallType = computed(() =>
    _callType.value ? _callType.value : CallType.INBOUND,
  );

  return {
    callType: currentCallType,
    currentScriptColor,
    currentScript,
    currentScriptHeader,
  };
};
