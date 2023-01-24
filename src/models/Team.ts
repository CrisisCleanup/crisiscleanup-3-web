import { Model } from '@vuex-orm/core';
import Incident from './Incident';
import { WorkType } from './types';
import User from './User';

export default class Team extends Model {
  static entity = 'teams';
  id!: String;
  name!: String;
  notes!: Object;
  users!: User;
  assigned_work_types!: Array<WorkType>;
  cases_area!: Object;
  incident!: Incident;

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
