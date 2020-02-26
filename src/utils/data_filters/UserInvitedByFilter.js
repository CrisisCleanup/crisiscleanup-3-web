import Filter from '@/utils/data_filters/Filter';

export default class UserInvitedByFilter extends Filter {
  packFunction() {
    const packed = {};
    const invitedByIds = Array.from(this.data).map(user => user.id);
    if (invitedByIds.length) {
      packed.referring_user__in = invitedByIds.join(',');
    }
    return packed;
  }

  getCount() {
    return Array.from(this.data).length;
  }

  getFilterLabels() {
    const labels = {};
    Array.from(this.data).forEach(user => {
      const { id, full_name } = user;
      labels[id] = window.vue.$i18n.t('~~Invited By: {full_name}', {
        full_name,
      });
    });
    return labels;
  }

  removeField(identifier) {
    Array.from(this.data).forEach(x => {
      if (Number(x.id) === Number(identifier)) {
        this.data.delete(x);
      }
    });
    this.data = new Set(this.data);
  }
}
