import CCUModel from '@/models/model';

export default class BetaFeature extends CCUModel<BetaFeature> {
  static entity: string = 'beta_features';

  id!: number;

  name!: string;

  description!: string;

  opt_in!: boolean;

  static fields() {
    return {
      id: this.number(0),
      name: this.string(''),
      description: this.string(''),
      opt_in: this.boolean(false),
    };
  }

  async optIn() {
    await BetaFeature.api().post(`beta_features/${this.id}/opt_in`, {
      save: false,
    });
  }
}
