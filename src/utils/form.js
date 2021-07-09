// @flow

import _ from 'lodash';
import type { LocaleFormFieldsT } from '@/components/forms/LocaleForm.vue';

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

export const nestUsers = (items, key = null) => {
  return items
    .filter((item) => {
      if (item.referring_user) {
        return item.referring_user === key;
      }
      return false;
    })
    .map((item) => {
      return {
        ...item,
        label: `${item.first_name} ${item.last_name}`,
        children: nestUsers(items, item.id),
      };
    });
};

export const emailRegex =
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

/**
 * Iterates over locale inputs and generates locale keys for each.
 * @param inputs - locale inputs.
 * @param prefix - locale key prefix.
 * @param base - locale key base value.
 * @returns {Dictionary<LocaleFormFieldsT>}
 */
export const makeLocaleInputs = ({
  inputs,
  prefix = '',
  base = '',
}: {
  inputs: string[],
  prefix: string,
  base: string,
}): LocaleFormFieldsT =>
  _.transform(
    inputs,
    (result, value) => {
      const [name, suffix = null] = _.split(value, ':');
      let _key = `${prefix}.${base}${
        _.isNil(suffix) ? '' : `_${suffix || ''}`
      }`;
      const keyParts = _.split(_key, ':');
      _key = keyParts.join('_');
      result[name] = {
        value,
        key: _key,
      };
    },
    {},
  );
