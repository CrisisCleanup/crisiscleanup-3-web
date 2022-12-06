import moment from 'moment';
import { omitBy, isNull } from 'lodash';
import Filter from './Filter';
import { useI18n } from 'vue-i18n';

export default class WorksiteDatesFilter extends Filter {
  packFunction() {
    const packed = {};
    if (this.data.created_start) {
      packed.created_at__gt = this.data.created_start;
    }
    if (this.data.created_end) {
      packed.created_at__lt = this.data.created_end;
    }
    if (this.data.updated_start) {
      packed.updated_at__gt = this.data.updated_start;
    }
    if (this.data.updated_end) {
      packed.updated_at__lt = this.data.updated_end;
    }
    return packed;
  }

  getCount() {
    return Object.keys(this.data).length;
  }

  getFilterLabels() {
    if (!Object.keys(this.data).length) {
      return {};
    }
    return omitBy(
      {
        created_start: this.data.created_start
          ? `${useI18n().t('worksiteFilters.from')}: ${moment(
              this.data.created_start,
            ).format('DD/MM/YYYY')}`
          : null,
        created_end: this.data.created_end
          ? `${useI18n().t('worksiteFilters.to')}: ${moment(
              this.data.created_end,
            ).format('DD/MM/YYYY')}`
          : null,
        updated_start: this.data.updated_start
          ? `${useI18n().t('worksiteFilters.from')}: ${moment(
              this.data.updated_start,
            ).format('DD/MM/YYYY')}`
          : null,
        updated_end: this.data.updated_end
          ? `${useI18n().t('worksiteFilters.to')}: ${moment(
              this.data.updated_end,
            ).format('DD/MM/YYYY')}`
          : null,
      },
      isNull,
    );
  }

  removeField(identifier) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
