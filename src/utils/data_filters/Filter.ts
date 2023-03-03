import { i18n } from '@/main';

export default class Filter {
  name: string;
  data: any;

  constructor(name: string, data: any) {
    this.name = name;
    this.data = data;
  }

  packFunction() {
    throw new Error(i18n.global.t('info.error_pack_function'));
  }

  getCount() {
    throw new Error(i18n.global.t('info.error_get_count'));
  }

  getFilterLabels() {
    throw new Error(i18n.global.t('info.error_get_filter_labels'));
  }

  removeField(identifier: string) {
    throw new Error(i18n.global.t('info.error_remove_field'));
  }

  get count() {
    return this.getCount();
  }

  get labels() {
    return this.getFilterLabels();
  }
}
