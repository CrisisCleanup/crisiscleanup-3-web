import { Model } from "@vuex-orm/core";

export default class Role extends Model {
  static entity = "roles";

  static fields() {
    return {
      id: this.attr(""),
      name_t: this.string(""),
      description_t: this.string(""),
      level: this.attr(null),
      is_default: this.attr(null),
    };
  }
}
