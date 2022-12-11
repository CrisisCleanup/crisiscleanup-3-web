import { useI18n } from 'vue-i18n';

export default class Filter {
  name: string;
  data: any;

  constructor(name: string, data: any) {
    this.name = name;
    this.data = data;
  }

  packFunction() {
    throw new Error(useI18n().t('info.error_pack_function'));
  }

  getCount() {
    throw new Error(useI18n().t('info.error_get_count'));
  }

  getFilterLabels() {
    throw new Error(useI18n().t('info.error_get_filter_labels'));
  }

  removeField(identifier: string) {
    throw new Error(useI18n().t('info.error_remove_field'));
  }

  get count() {
    this.getCount();
  }

  get labels() {
    this.getFilterLabels();
  }
}
