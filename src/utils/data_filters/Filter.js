export default class Filter {
  constructor(name, data) {
    this.name = name;
    this.data = data;
  }

  packFunction() {
    throw new Error(i18n.t('info.error_pack_function'));
  }

  getCount() {
    throw new Error(i18n.t('info.error_get_count'));
  }

  getFilterLabels() {
    throw new Error(i18n.t('info.error_get_filter_labels'));
  }

  // eslint-disable-next-line no-unused-vars
  removeField(identifier) {
    throw new Error(i18n.t('info.error_remove_field'));
  }

  get count() {
    return this.getCount();
  }

  get labels() {
    return this.getFilterLabels();
  }
}
