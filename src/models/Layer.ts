import CCUModel from '@/models/base';

export default class Layer extends CCUModel {
  static entity = 'layers';

  static fields() {
    return {
      id: this.attr(''),
      title: this.string(''),
      type: this.attr(null),
      description: this.string(''),
      locations: this.attr([]),
      available_to: this.attr([]),
    };
  }

  static apiConfig = {
    actions: {
      fetchById(id: string) {
        return this.get(`/layers/${id}`);
      },
    } as any,
  };
}
