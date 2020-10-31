// @flow

/**
 * Phone store types.
 */

import { AuthStates, InboundActions } from '@/store/modules/phone/streams';
import {
  ControllerActionTabs,
  ControllerPages,
  Metrics,
} from '@/store/modules/phone/controller';
import Worksite from '@/models/Worksite';
import Pda from '@/models/Pda';

type AuthState = $Values<typeof AuthStates>;
type InboundAction = $Values<typeof InboundActions>;

type ControllerPage = $Values<typeof ControllerPages>;
type ControllerActionTab = $Values<typeof ControllerActionTabs>;
type PhoneMetric = $Keys<typeof Metrics>;

type CaseType = Pda | Worksite;

type ViewStateT = {|
  page: ControllerPage,
  actionTab: ControllerActionTab,
|};

type StatusStateT = {|
  statusId: number | null,
  notes: string,
  modified: CaseType[],
|};

type MetricsStateT = {
  [$ElementType<PhoneMetric, 0>]: number,
};

type PhoneMetricUpdate = {|
  name: PhoneMetric,
  type: string,
  value: string,
|};

export type {
  AuthState,
  InboundAction,
  CaseType,
  ControllerActionTab,
  ControllerPage,
  ViewStateT,
  PhoneMetric,
  MetricsStateT,
  PhoneMetricUpdate,
  StatusStateT,
};
