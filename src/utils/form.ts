import _ from 'lodash';

type LocaleFormFieldsT = Record<
  string,
  {
    locale: string | undefined;
    value: string | undefined;
    key: string | undefined;
  }
>;

export const groupBy =
  <T extends Record<string, any>, K extends keyof T>(key: K) =>
  (array: T[]): Record<T[K], T[]> =>
    array.reduce((objectsByKeyValue, object) => {
      const value = object[key];
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(
        object,
      );
      return objectsByKeyValue;
    }, {} as Record<T[K], T[]>);

export const buildForm = <T extends Record<string, any>, K extends keyof T>(
  key: K,
  dict: Record<K, T[]>,
  array: T[],
) => {
  // TODO: refactor after writing unit tests

  for (const item of dict[key]) {
    if (item.label_t && Boolean(item.field_key)) {
      array.push(item);
    }

    if (item.field_key in dict && Boolean(item.field_key)) {
      buildForm(item.field_key, dict, array);
    }
  }
};

export const nest = <T extends Record<string, any>, K extends keyof T>(
  items: T[],
  key: K | null = null,
  link = 'field_parent_key',
  excluded: K[] = [],
): Record<K, T & { children: T[] | null }>[] =>
  items
    .filter((item) => Boolean(item.field_key))
    .filter((item) => item[link] === key && !excluded.includes(item.field_key))
    .map((item) => ({ ...item, children: nest(items, item.field_key) }));

export const nestUsers = <T extends Record<string, any>, K extends keyof T>(
  items: T[],
  key: K | null = null,
): Record<K, T & { label: string; children: T[] | null }>[] => {
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
  /^[\w.!#$%&’*+/=?^`{|}~-]+@[a-zA-Z\d-]+(?:\.[a-zA-Z\d-]+)*$/;

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
  inputs: string[];
  prefix: string;
  base: string;
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
    {} as Record<string, any>,
  );
