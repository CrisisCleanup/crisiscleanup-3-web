/**
 * Phone model type definitions.
 */

import { AgentStates, RouteStates } from '@/models/phone/AgentClient';
import { ConnectionStates } from '@/models/phone/Connection';
import {
  ContactActions,
  ContactAttributes,
  ContactStates,
} from '@/models/phone/Contact';
import Language from '@/models/Language';

type AgentState = typeof AgentStates[keyof typeof AgentStates];
type RouteState = typeof RouteStates[keyof typeof RouteStates];
type ConnectionState = typeof ConnectionStates[keyof typeof ConnectionStates];
type ContactState = typeof ContactStates[keyof typeof ContactStates];
type ContactAction = typeof ContactActions[keyof typeof ContactActions];
type ContactAttribute =
  typeof ContactAttributes[keyof typeof ContactAttributes];

type RawContactAttribute = {
  name: string;
  value: string;
};

type RawContactAttributes = { [key: string]: RawContactAttribute };

type ContactAttributesType = {
  [key: string]: string | number[];
};

type ConnectionType = {
  connectionId: string;
  contactId: string;
  state: ConnectionState;
  streamsConnectionId?: string;
  // duration: number
};

type ContactType = {
  contactId: string | null | undefined;
  agentId: string | null;
  state: ContactState;
  action: ContactAction;
  connection: ConnectionType;
  attributes?: ContactAttributesType;
};

type AgentClientType = {
  userId: number;
  agentId: string;
  state: AgentState;
  routeState: RouteState;
  contacts: ContactType[];
  connections: ConnectionType[];
  localeIds: number[] | null;
  locale?: Language[];
};

export {
  AgentState,
  RouteState,
  ConnectionState,
  ContactState,
  ContactAction,
  ContactAttribute,
  AgentClientType,
  ContactType,
  ConnectionType,
  RawContactAttribute,
  RawContactAttributes,
  ContactAttributesType,
};
