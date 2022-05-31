/**
 * Service types.
 */

import * as ACS from './connect.service';
import 'amazon-connect-streams';

type ACSEventTopic = typeof ACS.EventTopics;
type ACSAgentEvent = typeof ACS.AgentEvents;
type ACSContactEvent = typeof ACS.ContactEvents;
type ACSCoreEvent = typeof ACS.CoreEvents;

type ACSCallback = connect.AgentCallback | connect.ContactCallback | Function;

type ACSConfig = {
  ccpUrl: string;
  region: string;
  softphone: {
    allowFramedSoftphone: boolean;
  };
  loginPopup: boolean;
  loginPopupAutoClose: boolean;
  loginUrl?: string;
  loginOptions?: {
    autoClose: boolean;
    height: number;
    width: number;
    top: number;
    left: number;
  };
};

export {
  ACSEventTopic,
  ACSAgentEvent,
  ACSContactEvent,
  ACSCoreEvent,
  ACSCallback,
  ACSConfig,
};
