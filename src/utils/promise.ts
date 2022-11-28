import { zipObject } from "lodash";
import moment from "moment";
import axios from "axios";
import { StorageService } from "../services/storage.service";

export async function hash(hashOfPromises: Record<string, Promise<any>>) {
  const keys = Object.keys(hashOfPromises);
  const promises = keys.map((key) => hashOfPromises[key]);
  const values = await Promise.all(promises);

  return zipObject(keys, values);
}

export const delay = async (ms: number) =>
  new Promise((res) => setTimeout(res, ms));

export const cachedGet = async (url: string, config: any, key: string) => {
  const cachedResponse = StorageService.getItem(`enums:${key}`);

  if (cachedResponse) {
    const currentTime = moment();
    const nextTime = moment(cachedResponse.nextAttempt);
    if (currentTime < nextTime) {
      return cachedResponse.httpResponse;
    }
  }

  const response = await axios.get(url, config);

  StorageService.setItem(`enums:${key}`, {
    httpResponse: response,
    nextAttempt: moment().add(7, "days").toISOString(),
  });

  return response;
};
