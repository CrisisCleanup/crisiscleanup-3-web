// @flow

/**
 * Phone model type definitions.
 */

import { AgentStates, RouteStates } from '@/models/phone/AgentClient';
import { ConnectionStates } from '@/models/phone/Connection';
import { ContactStates, ContactActions } from '@/models/phone/Contact';

type AgentState = $Keys<typeof AgentStates>;
type RouteState = $Keys<typeof RouteStates>;
type ConnectionState = $Keys<typeof ConnectionStates>;
type ContactState = $Keys<typeof ContactStates>;
type ContactAction = $Keys<typeof ContactActions>;

type AgentClientType = {|
  userId: number,
  agentId: string,
  state: AgentState,
  routeState: RouteState,
|};

type ContactType = {|
  contactId: string,
  state: ContactState,
  action: ContactAction,
|};

type ConnectionType = {|
  connectionId: string,
  contactId: string,
  state: ConnectionState,
  // duration: number
|};

export type {
  AgentState,
  RouteState,
  ConnectionState,
  ContactState,
  ContactAction,
  AgentClientType,
  ContactType,
  ConnectionType,
};
