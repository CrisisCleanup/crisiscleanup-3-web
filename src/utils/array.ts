export function groupBy(array, key) {
  const result = {};
  array.forEach((item) => {
    if (!result[item[key]]) {
      result[item[key]] = [];
    }
    result[item[key]].push(item);
  });
  return result;
}

export function childrenBy(dict, key) {
  const array = dict.null;
  array.forEach((item) => {
    item.children = dict[item[key]];
  });
  return array;
}
