import { Model } from '@vuex-orm/core';

export default class Team extends Model {
  static entity = 'teams';

  static fields() {
    return {
      id: this.attr(''),
      name: this.string(''),
      notes: this.attr(null),
      users: this.attr([]),
      assigned_work_types: this.attr([]),
      cases_area: this.attr({}),
      incident: this.attr(null),
    };
  }

  static apiConfig = {
    actions: {
      fetchById(id) {
        return this.get(`/teams/${id}`);
      },
      getCasesArea(id, incident) {
        return this.get(`/teams/${id}/cases_area?incident=${incident}`);
      },
    } as any,
  };
}
