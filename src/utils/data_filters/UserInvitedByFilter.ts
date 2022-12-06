import Filter from './Filter';
import { useI18n } from 'vue-i18n';
import User from '../../models/User';

export default class UserInvitedByFilter extends Filter {
  packFunction() {
    const packed: Record<any, any> = {};
    const invitedByIds = Array.from(this.data).map((user: any) => user.id);
    if (invitedByIds.length) {
      packed.referring_user__in = invitedByIds.join(',');
    }
    return packed;
  }

  getCount() {
    return Array.from(this.data).length;
  }

  getFilterLabels() {
    const labels: Record<any, any> = {};
    Array.from(this.data).forEach((user: any) => {
      const { id, full_name } = user;
      labels[id] = useI18n().t('userInvitedBy.invited_by', {
        full_name,
      });
    });
    return labels;
  }

  removeField(identifier: string) {
    Array.from(this.data).forEach((x: any) => {
      if (Number(x.id) === Number(identifier)) {
        this.data.delete(x);
      }
    });
    this.data = new Set(this.data);
  }
}
