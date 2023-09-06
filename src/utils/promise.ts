import { zipObject } from 'lodash';
import moment from 'moment';
import axios from 'axios';
import { StorageService } from '../services/storage.service';

export async function hash(hashOfPromises: Record<string, Promise<any>>) {
  const keys = Object.keys(hashOfPromises);
  const promises = keys.map(async (key) => hashOfPromises[key]);
  const values = await Promise.all(promises);

  return zipObject(keys, values);
}

export const delay = async (ms: number) =>
  new Promise((res) => setTimeout(res, ms));

export const cachedGet = async (
  url: string,
  config: any,
  key: string,
  maxRetries: number = 3,
  delay: number = 1000,
) => {
  const cachedResponse = StorageService.getItem(`enums:${key}`);

  if (cachedResponse) {
    const currentTime = moment();
    const nextTime = moment(cachedResponse.nextAttempt);
    if (currentTime < nextTime) {
      return cachedResponse.httpResponse;
    }
  }

  let attempts = 0;
  let response;

  while (attempts < maxRetries) {
    try {
      response = await axios.get(url, config);

      // If the request succeeds, break out of the loop
      break;
    } catch (error) {
      attempts++;
      if (attempts < maxRetries) {
        // If there are retries left, wait for the delay duration before retrying
        await new Promise((res) => setTimeout(res, delay));
      } else {
        // If no retries left, throw the error
        throw error;
      }
    }
  }

  StorageService.setItem(`enums:${key}`, {
    httpResponse: response,
    nextAttempt: moment().add(7, 'days').toISOString(),
  });

  return response;
};
