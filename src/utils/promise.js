import { zipObject } from 'lodash';

export async function hash(hashOfPromises) {
  const keys = Object.keys(hashOfPromises);
  const promises = keys.map((key) => hashOfPromises[key]);
  const values = await Promise.all(promises);

  return zipObject(keys, values);
}
