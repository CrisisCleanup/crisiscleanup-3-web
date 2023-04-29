import moment from 'moment';
import Role from './Role';
import CCUModel from '@/models/base';

export default class Report extends CCUModel<Report> {
  static entity = 'reports';

  id!: string;

  name_t!: string;
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
      addFile(id: string, file: any, type: string) {
        return this.post(
          `/reports/${id}/files`,
          {
            file,
            type_t: type,
          },
          { save: false },
        );
      },
      deleteFile(id: string, file: any) {
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
