// @flow

/**
 * Service types.
 */

import * as ACS from './connect.service';
import '@crisiscleanup/amazon-connect-streams';

type ACSEventTopic = $Values<typeof ACS.EventTopics>;
type ACSAgentEvent = $Values<typeof ACS.AgentEvents>;
type ACSContactEvent = $Values<typeof ACS.ContactEvents>;
type ACSCoreEvent = $Values<typeof ACS.CoreEvents>;

type ACSCallback = connect.AgentCallback | connect.ContactCallback | Function;

type ACSConfig = {|
  ccpUrl: string,
  region: string,
  softphone: {|
    allowFramedSoftphone: boolean,
  |},
  loginPopup: boolean,
  loginPopupAutoClose: boolean,
  loginUrl?: string,
  loginOptions?: {|
    autoClose: boolean,
    height: number,
    width: number,
    top: number,
    left: number,
  |},
|};

export type {
  ACSEventTopic,
  ACSAgentEvent,
  ACSContactEvent,
  ACSCoreEvent,
  ACSCallback,
  ACSConfig,
};
