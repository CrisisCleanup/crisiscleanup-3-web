// @flow

/**
 * Phone store types.
 */

import { AuthStates } from '@/store/modules/phone/streams';
import {
  ControllerActionTabs,
  ControllerPages,
  Metrics,
} from '@/store/modules/phone/controller';

type AuthState = $Values<typeof AuthStates>;

type ControllerPage = $Values<typeof ControllerPages>;
type ControllerActionTab = $Values<typeof ControllerActionTabs>;
type PhoneMetric = $Keys<typeof Metrics>;

type CaseType = {|
  id: number,
  type: 'worksite' | 'pda',
|};

type ViewStateT = {|
  page: ControllerPage,
  actionTab: ControllerActionTab,
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
  CaseType,
  ControllerActionTab,
  ControllerPage,
  ViewStateT,
  PhoneMetric,
  MetricsStateT,
  PhoneMetricUpdate,
};
