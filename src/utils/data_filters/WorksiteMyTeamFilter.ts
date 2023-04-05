import { useI18n } from 'vue-i18n';
import Filter from './Filter';

export default class WorksiteMyTeamFilter extends Filter {
  packFunction() {
    const packed: Record<string, unknown> = {};
    if (this.data.my_team) {
      packed.my_team = this.data.my_team;
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
    if (!this.data.my_team) {
      return {};
    }

    return {
      my_team: useI18n().t('worksiteFilters.my_team'),
    };
  }

  removeField(identifier: string) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
