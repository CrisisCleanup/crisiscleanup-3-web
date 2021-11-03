import moment from 'moment';
import { omitBy, isNull } from 'lodash';
import Filter from '@/utils/data_filters/Filter';

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
          ? `${window.vue.$i18n.t('~~From')}: ${moment(
              this.data.created_start,
            ).format('DD/MM/YYYY')}`
          : null,
        created_end: this.data.created_end
          ? `${window.vue.$i18n.t('~~To')}: ${moment(
              this.data.created_end,
            ).format('DD/MM/YYYY')}`
          : null,
        updated_start: this.data.updated_start
          ? `${window.vue.$i18n.t('~~From')}: ${moment(
              this.data.updated_start,
            ).format('DD/MM/YYYY')}`
          : null,
        updated_end: this.data.updated_end
          ? `${window.vue.$i18n.t('~~To')}: ${moment(
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
