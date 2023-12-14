/**
 * CrisisCleanup Base Vuex-ORM model.
 */
import type { Fields } from '@vuex-orm/core';
import { Model } from '@vuex-orm/core';
import _ from 'lodash';
import type { CCUBaseFields } from '@/models/types';

export default class CCUModel extends Model {
  static entity = '';

  static fields(): Fields {
    return {
      id: this.attr(null),
      invalidated_at: this.attr(null),
      created_at: this.attr(null),
      updated_at: this.attr(null),
      ...this.commonRelations(),
    };
  }

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
    const _ids = _.castArray(id) as Array<number | string>;
    const ids = _ids.map((_id) => this.fields().id.make(_id, {}, '') as string);
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
   * @returns {Promise<Instance<CCUModel extends {new(...args: any[]): infer R} ? R : any>[]>}
   * @param parameters
   * @param _dataKey
   */
  static async fetchAll(
    parameters?: Record<string, string>,
    _dataKey = 'results',
  ) {
    const _parameters = parameters ?? {};
    await this.api().get(`/${this.entity}`, {
      dataKey: _dataKey,
      params: _parameters,
    });
    return this.query().all();
  }

  protected static commonRelations() {
    return {
      /**
       * TODO: enabling these causes a circular dependency
       * Maybe define User model in the same file to avoid this?
       */
      // created_by: this.belongsTo(User, 'created_by'),
      // updated_by: this.belongsTo(User, 'updated_by'),
      created_by: this.attr(null),
      updated_by: this.attr(null),
    };
  }

  id!: CCUBaseFields['id'];
  invalidated_at?: CCUBaseFields['invalidated_at'];
  created_at!: CCUBaseFields['created_at'];
  updated_at!: CCUBaseFields['updated_at'];
  created_by!: CCUBaseFields['created_by'];
  updated_by!: CCUBaseFields['updated_by'];
}
