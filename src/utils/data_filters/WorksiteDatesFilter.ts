import moment from 'moment';
import { omitBy, isNull } from 'lodash';
import { useI18n } from 'vue-i18n';
import Filter from './Filter';

interface WorksiteDatesFilterPacked {
  created_at__gt?: string;
  created_at__lt?: string;
  updated_at__gt?: string;
  updated_at__lt?: string;
}
export default class WorksiteDatesFilter extends Filter {
  packFunction() {
    const packed: WorksiteDatesFilterPacked = {};
    if (this.data.created) {
      packed.created_at__gt = moment(this.data.created[0]).format('YYYY-MM-DD');
    }

    if (this.data.created) {
      packed.created_at__lt = moment(this.data.created[1]).format('YYYY-MM-DD');
    }

    if (this.data.updated) {
      packed.updated_at__gt = moment(this.data.updated[0]).format('YYYY-MM-DD');
    }

    if (this.data.updated) {
      packed.updated_at__lt = moment(this.data.updated[1]).format('YYYY-MM-DD');
    }

    return packed;
  }

  getCount() {
    return Object.keys(this.data).length;
  }

  getFilterLabels() {
    if (Object.keys(this.data).length === 0) {
      return {};
    }

    return omitBy(
      {
        created_start:
          this.data.created && moment(this.data.created[0]).isValid()
            ? `${useI18n().t('worksiteFilters.from')}: ${moment(
                this.data.created[0],
              ).format('YYYY-MM-DD')}`
            : null,
        created_end:
          this.data.created && moment(this.data.created[1]).isValid()
            ? `${useI18n().t('worksiteFilters.to')}: ${moment(
                this.data.created[1],
              ).format('YYYY-MM-DD')}`
            : null,
        updated_start:
          this.data.updated && moment(this.data.updated[0]).isValid()
            ? `${useI18n().t('worksiteFilters.from')}: ${moment(
                this.data.updated[0],
              ).format('YYYY-MM-DD')}`
            : null,
        updated_end:
          this.data.updated && moment(this.data.updated[1]).isValid()
            ? `${useI18n().t('worksiteFilters.to')}: ${moment(
                this.data.updated[1],
              ).format('YYYY-MM-DD')}`
            : null,
      },
      isNull,
    );
  }

  removeField(identifier: string) {
    this.data[identifier] = false;
    this.data = { ...this.data };
  }
}
