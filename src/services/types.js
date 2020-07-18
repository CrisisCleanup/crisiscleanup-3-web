// @flow

/**
 * Service types.
 */


import * as ACS from './connect.service';

type ACSEventTopic = $Values<typeof ACS.EventTopics>;
type ACSAgentEvent = $Values<typeof ACS.AgentEvents>;
type ACSContactEvent = $Values<typeof ACS.ContactEvents>;


export type { ACSEventTopic, ACSAgentEvent, ACSContactEvent };
