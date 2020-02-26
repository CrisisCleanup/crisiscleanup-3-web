export default class Filter {
  constructor(name, data) {
    this.name = name;
    this.data = data;
  }

  packFunction() {
    throw new Error('You have to implement the method doSomething!');
  }

  getCount() {
    throw new Error('You have to implement the method doSomething!');
  }

  getFilterLabels() {
    throw new Error('You have to implement the method doSomething!');
  }

  // eslint-disable-next-line no-unused-vars
  removeField(identifier) {
    throw new Error('You have to implement the method doSomething!');
  }

  get count() {
    return this.getCount();
  }

  get labels() {
    return this.getFilterLabels();
  }
}
