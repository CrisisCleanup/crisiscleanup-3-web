import { Model } from '@vuex-orm/core';

export default class Report extends Model {
  static entity = 'reports';

  static fields() {
    return {
      id: this.attr(),
      name_t: this.attr(null),
      description_t: this.attr(null),
      report_key: this.attr(null),
      inputs: this.attr(null),
      output_formats: this.attr(null),
      files: this.attr(null),
    };
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
    },
  };
}
