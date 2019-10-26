import { Model } from '@vuex-orm/core'

export default class Worksite extends Model {
    static entity = 'worksites';

    static fields () {
        return {
            id: this.string(),
            address: this.string(''),
            blurred_location: this.attr(null),
            case_number: this.attr(null),
            city: this.attr(null),
            county: this.attr(null),
            form_data: this.attr(null),
            postal_code: this.attr(null),
            map_location: this.attr(null),
            incident: this.attr(null),
            name: this.attr(null),
            state: this.attr(null),
            work_types: this.attr(null),
        }
    }

    static apiConfig = {
        actions: {
            fetchById (id) {
                return this.get(`/worksites/${id}`)
            },
            searchWorksites(search) {
                return this.get(`/worksites?fields=id,name,address,case_number,postal_code&limit=5&search=${search}`, {
                    dataKey: 'results'
                });
            },
            printWorksite(id) {
                try {
                    return this.request({
                        url: `/worksites/${id}/download`,
                        method: 'POST',
                        responseType: 'blob', // important
                        headers: { Accept: "application/pdf" },
                        save: false
                    });
                } catch (e) {
                    // console.error(e)
                }
            }
        }
    }
}