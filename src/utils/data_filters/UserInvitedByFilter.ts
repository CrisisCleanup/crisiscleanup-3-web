import { useI18n } from 'vue-i18n';
import User from '../../models/User';
import Filter from './Filter';

export default class UserInvitedByFilter extends Filter {
  packFunction() {
    const packed: Record<any, any> = {};
    const invitedByIds = [...this.data].map((user: any) => user.id);
    if (invitedByIds.length > 0) {
      packed.referring_user__in = invitedByIds.join(',');
    }

    return packed;
  }

  getCount() {
    return [...this.data].length;
  }

  getFilterLabels() {
    const labels: Record<any, any> = {};
    [...this.data].forEach((user: any) => {
      const { id, full_name } = user;
      labels[id] = useI18n().t('userInvitedBy.invited_by', {
        full_name,
      });
    });
    return labels;
  }

  removeField(identifier: string) {
    [...this.data].forEach((x: any) => {
      if (Number(x.id) === Number(identifier)) {
        this.data.delete(x);
      }
    });
    this.data = new Set(this.data);
  }
}
