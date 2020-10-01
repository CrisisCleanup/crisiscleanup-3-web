// @flow
import CCUModel from '@/models/model';

export type BetaFeatureType = {|
  id: number,
  name: string,
  description: string,
  opt_in: boolean,
|};

export default class BetaFeature extends CCUModel<BetaFeatureType> {
  static entity: string = 'beta_features';

  static fields(): BetaFeatureType {
    return ({
      id: this.number(),
      name: this.string(),
      description: this.string(),
      opt_in: this.boolean(),
    }: BetaFeatureType);
  }

  async optIn() {
    await BetaFeature.api().post(`beta_features/${this.id}/opt_in`, {
      save: false,
    });
  }
}
