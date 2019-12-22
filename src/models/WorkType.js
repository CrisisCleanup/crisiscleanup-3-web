import { Model } from '@vuex-orm/core'

export default class WorkType extends Model {
    static entity = 'work_types';

    static fields () {
        return {
            id: this.increment(),
            key: this.string(''),
            file_prefix: this.attr(null),
            name_t: this.attr(null),
            description_t: this.attr(null),
            commercial_value: this.attr(null),
        }
    }

    static get commercialValues() {
        return Object.assign({}, ...this.all().map(s => ({[s.key]: s.commercial_value})));
    }
}