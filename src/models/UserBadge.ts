/**
 * User Badge Model
 */

import CCUModel from '@/models/model';
import { Localized } from '@/models/decorators';

@Localized
class UserBadge extends CCUModel<UserBadge> {
  static entity = 'user_badges';

  static fields() {
    return {
      key: this.string(''),
      name_t: this.string(''),
      description_t: this.string(''),
      invalidated_at: this.attr('', (value) => Date.parse(value)),
      created_at: this.attr('', (value) => Date.parse(value)),
      updated_at: this.attr('', (value) => Date.parse(value)),
      created_by: this.number(0),
      updated_by: this.number(0),
    };
  }
}

export default UserBadge;
