export function groupBy<T extends Record<string, any>, K extends keyof T>(
  array: T[],
  key: K,
) {
  const result = {} as Record<T[K], T[]>;
  for (const item of array) {
    if (!result[item[key]]) {
      result[item[key]] = [];
    }

    result[item[key]].push(item);
  }

  return result;
}

/**
 * Children by 'null' key
 * @param dict
 * @param key
 */
export function childrenBy<T extends Record<string, any>, K extends keyof T>(
  dict: T,
  key: keyof T['null'][0],
) {
  const array = dict.null;
  for (const item of array) {
    item.children = dict[item[key]];
  }

  return array;
}
