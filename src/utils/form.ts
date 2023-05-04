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
    array.reduce<Record<T[K], T[]>>((objectsByKeyValue, object) => {
      const value = object[key];
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(
        object,
      );
      return objectsByKeyValue;
    }, {});

export const buildForm = <T extends Record<string, any>, K extends keyof T>(
  key: K,
  dict: Record<K, T[]>,
  array: T[],
) => {
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
  value: T[K] | undefined = null,
  link = 'field_parent_key',
  excluded: K[] = [],
): Array<Record<K, T & { children: T[] | undefined }>> =>
  items
    .filter((item) => Boolean(item.field_key))
    .filter(
      (item) => item[link] === value && !excluded.includes(item.field_key),
    )
    .map((item) => ({ ...item, children: nest(items, item.field_key) }));

export const nestUsers = <T extends Record<string, any>, K extends keyof T>(
  items: T[],
  referringUserId: T[K] | undefined = null,
): Array<Record<K, T & { label: string; children: T[] | undefined }>> => {
  return items
    .filter((item) => {
      if (item.referring_user) {
        return item.referring_user === referringUserId;
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

export const EMAIL_REGEX = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;

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
  prefix?: string;
  base?: string;
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
