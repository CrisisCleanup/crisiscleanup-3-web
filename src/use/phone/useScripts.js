// @flow

/**
 * Hook for Phone Scripts
 */

import { Scripts } from '@/store/modules/phone/controller';
import _ from 'lodash';
import { CallType } from '@/models/phone/Contact';
import { computed } from '@vue/composition-api';
import { wrap } from '@/utils/wrap';
import { theme } from '@/../tailwind.config';
import useUser from '@/use/user/useUser';
import useIncident from '@/use/worksites/useIncident';

export type UseScriptsProps = {|
  callType: $Values<typeof CallType>,
|};

export default ({ callType }: UseScriptsProps) => {
  const _callType = wrap(callType);

  const scriptColors = {
    [CallType.INBOUND]: '#CCEBFF',
    [CallType.OUTBOUND]: '#13E768',
    [CallType.CALLDOWN]: theme.extend.colors['crisiscleanup-yellow']['100'],
  };

  const scriptHeaders = {
    // note: translated later, no $t here.
    [CallType.INBOUND]: ['phoneDashboard.inbound_description', 'phoneDashboard.inbound_call_parenthesis'],
    [CallType.OUTBOUND]: [
      'phoneDashboard.callback_description',
      'phoneDashboard.callback_parenthesis',
    ],
    [CallType.CALLDOWN]: [
      'phoneDashboard.calldown_description',
      'phoneDashboard.calldown_parenthesis',
      [
        {
          title: 'IF THEY ST',
          body:
            'phoneDashboard.if_yes_instructions_say',
          note: 'phoneDashboard.if_yes_instructions_do',
          accent: theme.extend.colors['crisiscleanup-green']['900'],
        },
        {
          title: 'phoneDashboard.if_no',
          body: 'phoneDashboard.if_no_instructions_say',
          note:
            'phoneDashboard.if_no_instructions_do',
          accent: theme.extend.colors['crisiscleanup-red']['600'],
        },
      ],
    ],
  };

  const currentScriptHeader = computed(
    () => scriptHeaders[_callType.value ? _callType.value : CallType.INBOUND],
  );

  const { currentUser } = useUser();
  const { currentIncident } = useIncident();

  const currentScript = computed(
    () =>
      currentUser.value &&
      _.template(Scripts[_callType.value ? _callType.value : CallType.INBOUND])(
        {
          name: currentUser.value ? currentUser.value.first_name : '',
          incidentType: currentIncident.value
            ? currentIncident.value.incident_type
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
