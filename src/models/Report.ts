import { Model } from '@vuex-orm/core';
import moment from 'moment';
import Role from '@/models/Role';

export default class Report extends Model {
  static entity = 'reports';

  id!: string;

  paid_for_statement!: string;

  created_at!: string;

  static fields() {
    return {
      id: this.attr(''),
      name_t: this.attr(null),
      description_t: this.attr(null),
      report_key: this.attr(null),
      inputs: this.attr(null),
      output_formats: this.attr(null),
      files: this.attr(null),
      paid_for_statement: this.attr(null),
      created_at: this.attr(null),
    };
  }

  get isSponsored() {
    return Boolean(this.paid_for_statement);
  }

  get created() {
    return moment(this.created_at);
  }

  static apiConfig = {
    actions: {
      addFile(id, file, type) {
        return this.post(
          `/reports/${id}/files`,
          {
            file,
            type_t: type,
          },
          { save: false },
        );
      },
      deleteFile(id, file) {
        return this.delete(
          `/reports/${id}/files`,
          {
            data: { file },
          },
          { save: false },
        );
      },
    } as any,
  };
}
