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

type AuthState = typeof AuthStates;
type InboundAction = typeof InboundActions;

type ControllerPage = typeof ControllerPages[keyof typeof ControllerPages];
type ControllerActionTab =
  typeof ControllerActionTabs[keyof typeof ControllerActionTabs];
type PhoneMetric = typeof Metrics[keyof typeof Metrics];

type CaseType = Pda | Worksite;

interface ViewStateT {
  page?: ControllerPage;
  actionTab?: ControllerActionTab;
}

interface StatusStateT {
  statusId?: number | null;
  notes?: string;
  modified?: CaseType[];
}

type MetricsStateT = Record<string, number>;

interface PhoneMetricUpdate {
  name: PhoneMetric;
  type: string;
  value: string;
}

export {
  CaseType,
  MetricsStateT,
  PhoneMetric,
  PhoneMetricUpdate,
  StatusStateT,
  ViewStateT,
};
