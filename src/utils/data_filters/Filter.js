export default class Filter {
  constructor(name, data) {
    this.name = name;
    this.data = data;
  }

  packFunction() {
    throw new Error('~~You called the undefined method packFunction!');
  }

  getCount() {
    throw new Error('~~You called the undefined method getCount!');
  }

  getFilterLabels() {
    throw new Error('~~You called the undefined method getFilterLabels!');
  }

  // eslint-disable-next-line no-unused-vars
  removeField(identifier) {
    throw new Error('~~You called the undefined method removeField!');
  }

  get count() {
    return this.getCount();
  }

  get labels() {
    return this.getFilterLabels();
  }
}
