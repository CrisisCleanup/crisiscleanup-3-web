// @flow
/**
 * User Badge Model
 */

import CCUModel from '@/models/model';
import type { BaseFieldsT } from '@/models/model';
import { Localized } from '@/models/decorators';

export type BadgeType = {|
  key: string,
  name_t: string,
  description_t: string,
|} & BaseFieldsT;

@Localized
class UserBadge extends CCUModel<BadgeType> {
  static entity = 'user_badges';

  static fields() {
    return ({
      ...this.baseFields(),
      key: this.string(),
      name_t: this.string(),
      description_t: this.string(),
    }: BadgeType);
  }
}

export default UserBadge;
