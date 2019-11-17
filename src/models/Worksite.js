import { Model } from '@vuex-orm/core'
import Organization from "@/models/Organization";

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
            what3words: this.attr(null),
            notes: this.attr(null),
        }
    }

    static apiConfig = {
        actions: {
            async fetchById (id) {
                let worksite = await this.get(`/worksites/${id}`);
                let organizations = worksite.response.data.work_types.filter(work_type => Boolean(work_type.claimed_by)).map(work_type => work_type.claimed_by);
                await Organization.api().get(`/organizations?id__in=${organizations.join(',')}`, {
                    dataKey: 'results'
                });
                return worksite
            },
            claimWorksite (id, work_types) {
                return this.post(`/worksites/${id}/claim`, {
                    work_types: work_types
                }, { save: false })
            },
            unclaimWorksite (id, work_types) {
                return this.post(`/worksites/${id}/unclaim`, {
                    work_types: work_types
                }, { save: false })
            },
            requestWorksite (id, work_types) {
                return this.post(`/worksites/${id}/request_take`, {
                    work_types: work_types
                }, { save: false })
            },
            addNote (id, note) {
                return this.post(`/worksites/${id}/notes`, {
                    note: note
                }, { save: false })
            },
            searchWorksites(search, incident) {
                return this.get(`/worksites?fields=id,name,address,case_number,postal_code,city,state,incident&limit=5&search=${search}&incident=${incident}`, {
                    dataKey: 'results'
                });
            },
            updateWorkTypeStatus(work_type_id, status) {
                return this.patch(`/worksite_work_types/${work_type_id}`, {
                    status: status
                }, { save: false })
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