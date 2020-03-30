export const groupBy = (key) => (array) =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

export const buildForm = (key, dict, array) => {
  // TODO: refactor after writing unit tests
  // eslint-disable-next-line no-restricted-syntax
  for (const item of dict[key]) {
    if (item.label_t) {
      array.push(item);
    }
    if (item.field_key in dict) {
      buildForm(item.field_key, dict, array);
    }
  }
};

export const nest = (
  items,
  key = null,
  link = 'field_parent_key',
  excluded = [],
) =>
  items
    .filter((item) => item[link] === key && !excluded.includes(item.field_key))
    .map((item) => ({ ...item, children: nest(items, item.field_key) }));

export const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
