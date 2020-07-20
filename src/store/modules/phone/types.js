// @flow

/**
 * Phone store types.
 */

import { AuthStates } from '@/store/modules/phone/streams';
import {
  ControllerActionTabs,
  ControllerPages,
} from '@/store/modules/phone/controller';

type AuthState = $Values<typeof AuthStates>;

type ControllerPage = $Values<typeof ControllerPages>;
type ControllerActionTab = $Values<typeof ControllerActionTabs>;

type CaseType = {|
  id: number,
  type: 'worksite' | 'pda',
|};

type ViewStateT = {|
  page: ControllerPage,
  actionTab: ControllerActionTab,
|};

export type {
  AuthState,
  CaseType,
  ControllerActionTab,
  ControllerPage,
  ViewStateT,
};
