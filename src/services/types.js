// @flow

/**
 * Service types.
 */

import * as ACS from './connect.service';
import '@crisiscleanup/amazon-connect-streams';

type ACSEventTopic = $Values<typeof ACS.EventTopics>;
type ACSAgentEvent = $Values<typeof ACS.AgentEvents>;
type ACSContactEvent = $Values<typeof ACS.ContactEvents>;

type ACSCallback = connect.AgentCallback | connect.ContactCallback;

export type { ACSEventTopic, ACSAgentEvent, ACSContactEvent, ACSCallback };
