import type { Config } from '@vuex-orm/plugin-axios';
import type Incident from './Incident';
import type { WorkType } from './types';
import type User from './User';
import CCUModel from '@/models/base';

export default class Team extends CCUModel {
  static entity = 'teams';
  id!: string;
  name!: string;
  notes!: string;
  users!: User[];
  assigned_work_types!: WorkType[];
  cases_area!: Record<string, unknown>;
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

  static apiConfig: Config = {
    actions: {
      fetchById(id: number) {
        return this.get(`/teams/${id}`);
      },
      getCasesArea(id: number, incident: number) {
        return this.get(`/teams/${id}/cases_area?incident=${incident}`);
      },
    },
  };
}
