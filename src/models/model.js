// @flow
/**
 * CrisisCleanup Base Vuex-ORM model.
 */

import { Model } from '@vuex-orm/core';
import _ from 'lodash';
import { QueryResult } from 'aws-sdk/clients/kendra';

export interface BaseFieldsT {
  id: number;
  invalidated_at?: Date;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}

export default class CCUModel<T> extends Model {
  static historyFields = {
    invalidated_at: this.attr('', (value) => Date.parse(value)),
    created_at: this.attr('', (value) => Date.parse(value)),
    updated_at: this.attr('', (value) => Date.parse(value)),
    created_by: this.number(),
    updated_by: this.number(),
  };

  static baseFields = (omit: string[] = []): $Shape<BaseFieldsT> =>
    _.omit(
      {
        id: this.number(),
        ...this.historyFields,
      },
      omit,
    );

  static entity = '';

  /**
   * Fetch and store item by id.
   * @param id - item id.
   * @returns {T}
   */
  static fetchById(id: number): T {
    return this.api().get(`/${this.entity}/${id}`);
  }

  /**
   * Returns item by Id, ensuring it is in the local database.
   * @param id - ID of item to fetch.
   * @returns {T}
   */
  static async fetchOrFindId(id: number): Promise<T> {
    const exists = await this.query().whereId(id).exists();
    if (!exists) {
      await this.fetchById(id);
    }
    return this.find(id);
  }

  /**
   * Fetch all items from api.
   * @param params - any additional query params.
   * @param dataKey - data key to use.
   * @returns {Promise<Instance<CCUModel extends {new(...args: any[]): infer R} ? R : any>[]>}
   */
  static async fetchAll(
    params?: {
      [key: string]: string,
    },
    dataKey?: string,
  ): Promise<QueryResult<T>> {
    const _dataKey = dataKey || 'results';
    const _params = params || {};
    await this.api().get(`/${this.entity}`, {
      dataKey: _dataKey,
      params: _params,
    });
    return this.query().all();
  }
}
