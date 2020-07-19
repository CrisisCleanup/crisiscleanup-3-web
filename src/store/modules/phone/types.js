// @flow

/**
 * Phone store types.
 */

import { AuthStates } from '@/store/modules/phone/streams';

type AuthState = $Values<typeof AuthStates>;

export type { AuthState };
