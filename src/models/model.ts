// @ts-nocheck TODO(tabiodun): Fix this file
/**
 * CrisisCleanup Base Vuex-ORM model.
 */

import { Model } from '@vuex-orm/core';
import _ from 'lodash';
import { QueryResult } from 'aws-sdk/clients/kendra';

type BaseFieldsT = {
  id: number;
  invalidated_at?: Date;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
};

export default class CCUModel<T> extends Model {
  // Static historyFields = {
  //   invalidated_at: this.attr('', (value) => Date.parse(value)),
  //   created_at: this.attr('', (value) => Date.parse(value)),
  //   updated_at: this.attr('', (value) => Date.parse(value)),
  //   created_by: this.number(),
  //   updated_by: this.number(),
  // };

  static baseFields = (omit: string[] = []): BaseFieldsT =>
    _.omit(
      {
        // Id: this.number(''),
        // ...this.historyFields,
      },
      omit,
    );

  static entity = '';

  /**
   * Fetch and store item(s) by id.
   * @param id - item id or list of item ids.
   * @param save - save item to database.
   * @returns {T}
   */
  static async fetchById(
    id: number | number[] | string | string[],
    save = true,
  ) {
    if (typeof id === 'number' || typeof id === 'string') {
      return this.api().get(`/${this.entity}/${id}`, { save });
    }

    return this.api().get(`/${this.entity}`, {
      params: {
        id__in: id.join(','),
        limit: id.length,
      },
      dataKey: 'results',
      save,
    });
  }

  /**
   * Returns item(s) by Id, ensuring it is in the local database.
   * @param id - ID of item(s) to fetch.
   * @param save - save item to database.
   * @returns {T}
   */
  static async fetchOrFindId(id: number | number[], save = true) {
    const _ids = _.castArray(id);
    const ids = _ids.map((_id) => this.fields().id.make(_id, {}, ''));
    const resolvedIds = ids.filter((itemId) =>
      this.query().whereId(itemId).exists(),
    );
    const unresolved = _.difference(ids, resolvedIds);
    if (!_.isEmpty(unresolved)) {
      await this.fetchById(unresolved, save);
    }

    if (!_.isArray(id)) {
      return this.find(id);
    }

    return ids.map((itemId) => this.find(itemId));
  }

  /**
   * Fetch all items from api.
   * @param params - any additional query params.
   * @param dataKey - data key to use.
   * @returns {Promise<Instance<CCUModel extends {new(...args: any[]): infer R} ? R : any>[]>}
   */
  static async fetchAll(parameters?: Record<string, string>, dataKey?: string) {
    const _dataKey = dataKey || 'results';
    const _parameters = parameters || {};
    await this.api().get(`/${this.entity}`, {
      dataKey: _dataKey,
      params: _parameters,
    });
    return this.query().all();
  }
}
