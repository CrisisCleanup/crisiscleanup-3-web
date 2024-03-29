import CCUModel from '@/models/model';
export default class Pda extends CCUModel<Pda> {
  static entity = 'pdas';

  id!: string;

  name!: string;

  address!: string;

  city!: string;

  postal_code!: string;

  state!: string;

  location!: any;

  worksite!: any;

  incident!: any;

  form_data!: any[];

  static fields() {
    return {
      id: this.string(''),
      address: this.string(''),
      location: this.attr(null),
      city: this.attr(null),
      state: this.attr(null),
      county: this.attr(null),
      postal_code: this.attr(null),
      name: this.attr(null),
      phone1: this.attr(null),
      phone2: this.attr(null),
      email: this.attr(null),
      worksite: this.attr(null),
    };
  }

  get full_address() {
    const { address, city, state, postal_code } = this;
    return `${address}, ${city}, ${state} ${postal_code}`;
  }

  get short_address() {
    const { address, city } = this;
    return `${address}, ${city}`;
  }

  get city_state() {
    const { city, state } = this;
    return `${city}, ${state}`;
  }

  get latitude() {
    return this.location ? this.location.coordinates[1] : 10;
  }

  get longitude() {
    return this.location ? this.location.coordinates[0] : 10;
  }

  get formFields() {
    if (!this.form_data) {
      return {};
    }

    return this.form_data.reduce((obj, item) => {
      return {
        ...obj,
        [item.field_key]: item.field_value,
      };
    }, {});
  }

  static apiConfig = {
    actions: {
      async associateWorksite(pdaId, worksite) {
        this.worksite = worksite;
        await this.patch(`/pdas/${pdaId}`, {
          worksite,
        });
      },
    } as any,
  };
}
