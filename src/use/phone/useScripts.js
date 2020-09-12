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
    [CallType.INBOUND]: ['~~This person is calling you ', '~~(inbound-call)'],
    [CallType.OUTBOUND]: [
      '~~You are calling this person back.',
      '~~(call-back)',
    ],
    [CallType.CALLDOWN]: [
      '~~This person has case you calling to check if they still need help.',
      '~~(call-down)',
      [
        {
          title: '~~YES',
          body:
            '~~You are still on the map. There are no guarantees. It may take a long time.',
          note: '~~(Add a note about your call)',
          accent: theme.extend.colors['crisiscleanup-green']['900'],
        },
        {
          title: '~~NO',
          body: '~~Thank you.',
          note:
            '~~(Change Status on all work to: "closed done by others." Add a note about your call.)',
          accent: theme.extend.colors['crisiscleanup-red']['600'],
        },
      ],
    ],
  };

  const currentScriptHeader = computed(() => scriptHeaders[_callType.value]);

  const { currentUser } = useUser();
  const { currentIncident } = useIncident();

  const currentScript = computed(
    () =>
      currentUser.value &&
      _.template(Scripts[_callType.value])({
        name: currentUser.value ? currentUser.value.first_name : '',
        incidentType: currentIncident.value
          ? currentIncident.value.incident_type
          : '',
      }),
  );

  const currentScriptColor = computed(() => scriptColors[_callType.value]);

  return {
    callType: _callType,
    currentScriptColor,
    currentScript,
    currentScriptHeader,
  };
};
