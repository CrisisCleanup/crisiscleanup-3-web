export function groupBy(array, key) {
  const result = {};
  for (const item of array) {
    if (!result[item[key]]) {
      result[item[key]] = [];
    }

    result[item[key]].push(item);
  }

  return result;
}

export function childrenBy(dict, key) {
  const array = dict.null;
  for (const item of array) {
    item.children = dict[item[key]];
  }

  return array;
}
