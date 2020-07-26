import Filter from '@/utils/data_filters/Filter';

export default class WorksiteTeamsFilter extends Filter {
  packFunction() {
    const packed = {};
    if (this.data.my_team) {
      packed.my_team = this.data.my_team
    }
    return packed;
  }

  getCount() {
    if (!this.data.my_team) {
      return 0;
    }
    return 1;
  }

  getFilterLabels() {
    return {
      my_team: window.vue.$i18n.t('~~My Team')
    };
  }

  removeField(identifier) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
