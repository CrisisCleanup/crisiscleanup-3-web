import { useI18n } from 'vue-i18n';
import Team from '../../models/Team';
import Filter from './Filter';

export default class WorksiteTeamsFilter extends Filter {
  packFunction() {
    const packed = {};
    const teamsEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    if (teamsEntries.length > 0) {
      packed.teams = teamsEntries.map(([status]) => status).join(',');
    }

    return packed;
  }

  getCount() {
    if (!this.data) {
      return 0;
    }

    const teamsEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    return teamsEntries.length;
  }

  getFilterLabels() {
    const labels = {};
    for (const [key] of Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    })) {
      labels[key] = `${useI18n().t('worksiteFilters.teams')}: ${
        Team.find(key).name
      }`;
    }

    return labels;
  }

  removeField(identifier) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
