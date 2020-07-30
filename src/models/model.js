// @flow
/**
 * CrisisCleanup Base Vuex-ORM model.
 */

import { Model } from '@vuex-orm/core';

export default class CCUModel<T> extends Model {
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
}
