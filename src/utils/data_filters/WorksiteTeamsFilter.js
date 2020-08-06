import Filter from '@/utils/data_filters/Filter';
import Team from '@/models/Team';

export default class WorksiteTeamsFilter extends Filter {
  packFunction() {
    const packed = {};
    const teamsEntries = Object.entries(this.data).filter(([, value]) => {
      return Boolean(value);
    });
    if (teamsEntries.length) {
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
    Object.entries(this.data)
      .filter(([, value]) => {
        return Boolean(value);
      })
      .forEach(([key]) => {
        labels[key] = `${window.vue.$i18n.t('worksiteFilters.teams')}: ${Team.find(key).name}`;
      });
    return labels;
  }

  removeField(identifier) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
