import { secondsToHm } from '@/filters';
import Organization from '@/models/Organization';
import User from '@/models/User';
import enums from '@/store/modules/enums';
import { getQueryString } from '@/utils/urls';
import { Model } from '@vuex-orm/core';

export default class Worksite extends Model {
  static entity = 'worksites';

  static fields() {
    return {
      id: this.string(),
      address: this.string(''),
      location: this.attr(null),
      case_number: this.attr(null),
      city: this.attr(null),
      county: this.attr(null),
      form_data: this.attr([]),
      postal_code: this.attr(null),
      map_location: this.attr(null),
      incident: this.attr(null),
      name: this.attr(null),
      state: this.attr(null),
      work_types: this.attr(null),
      what3words: this.attr(null),
      notes: this.attr(null),
      files: this.attr(null),
      time: this.attr(null),
      flags: this.attr(null),
      events: this.attr(null),
      reported_by: this.attr(null),
      phone1: this.attr(null),
      phone2: this.attr(null),
      email: this.attr(null),
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

  get latitude() {
    return this.location ? this.location.coordinates[1] : 10;
  }

  get longitude() {
    return this.location ? this.location.coordinates[0] : 10;
  }

  get total_volunteers() {
    return this.time.reduce((total, obj) => {
      return total + obj.volunteers;
    }, 0);
  }

  get total_time() {
    const seconds = this.time.reduce((total, obj) => {
      return total + obj.seconds * obj.volunteers;
    }, 0);
    return secondsToHm(seconds);
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

  static getWorkType(workTypes, filters, organization) {
    // TODO: Unit Test
    let currentFilteredTypes = [];
    if (filters && filters.fields) {
      currentFilteredTypes = Object.keys(filters.fields).filter((fieldKey) =>
        Boolean(filters.fields[fieldKey]),
      );
    }

    const filterByClaimedOrg = (array) => {
      return array
        .filter((type) => type.claimed_by === (organization && organization.id))
        .sort((a, b) => {
          return (
            enums.getters.workTypeCommercialValues[b.work_type] -
            enums.getters.workTypeCommercialValues[a.work_type]
          );
        });
    };

    const filterByUnclaimed = (array) => {
      return array
        .filter((type) => type.claimed_by === null)
        .sort((a, b) => {
          return (
            enums.getters.workTypeCommercialValues[b.work_type] -
            enums.getters.workTypeCommercialValues[a.work_type]
          );
        });
    };

    const allWorkTypes = [...workTypes].sort((a, b) => {
      return (
        enums.getters.workTypeCommercialValues[b.work_type] -
        enums.getters.workTypeCommercialValues[a.work_type]
      );
    });
    const workTypesInFilter = [...workTypes]
      .filter((type) => currentFilteredTypes.includes(type.work_type))
      .sort((a, b) => {
        return (
          enums.getters.workTypeCommercialValues[b.work_type] -
          enums.getters.workTypeCommercialValues[a.work_type]
        );
      });

    if (allWorkTypes.length === 1) {
      return allWorkTypes[0];
    }
    if (workTypesInFilter.length === 1) {
      return workTypesInFilter[0];
    }
    if (workTypesInFilter > 1) {
      if (filterByClaimedOrg(workTypesInFilter).length) {
        return filterByClaimedOrg(workTypesInFilter)[0];
      }

      if (filterByUnclaimed(workTypesInFilter).length) {
        return filterByUnclaimed(workTypesInFilter)[0];
      }
      return workTypesInFilter[0];
    }
    if (filterByClaimedOrg(allWorkTypes).length) {
      return filterByClaimedOrg(allWorkTypes)[0];
    }

    if (filterByUnclaimed(allWorkTypes).length) {
      return filterByUnclaimed(allWorkTypes)[0];
    }
    return allWorkTypes[0];
  }

  static apiConfig = {
    actions: {
      async fetch(id, incident = null) {
        const worksiteParams = {};
        if (incident) {
          worksiteParams.incident = incident;
        }
        const worksite = await this.get(
          `/worksites/${id}?${getQueryString(worksiteParams)}`,
        );
        const organizations = worksite.response.data.work_types
          .filter((workType) => Boolean(workType.claimed_by))
          .map((workType) => workType.claimed_by);
        await Organization.api().get(
          `/organizations?id__in=${organizations.join(',')}`,
          {
            dataKey: 'results',
          },
        );
        const users = worksite.response.data.events.map((event) => event.user);
        await User.api().get(`/users?id__in=${users.join(',')}`, {
          dataKey: 'results',
        });
        return worksite;
      },
      claimWorksite(id, workTypes) {
        return this.post(
          `/worksites/${id}/claim`,
          {
            work_types: workTypes,
          },
          { save: false },
        );
      },
      unclaimWorksite(id, workTypes, status = null) {
        const data = {
          work_types: workTypes,
        };
        if (status) {
          data.status = status;
        }
        return this.post(`/worksites/${id}/unclaim`, data, { save: false });
      },
      requestWorksite(id, workTypes, reason) {
        return this.post(
          `/worksites/${id}/request_take`,
          {
            work_types: workTypes,
            requested_reason: reason,
          },
          { save: false },
        );
      },
      addNote(id, note) {
        return this.post(
          `/worksites/${id}/notes`,
          {
            note,
          },
          { save: false },
        );
      },
      addTime(id, seconds, volunteers) {
        return this.post(
          `/time`,
          {
            worksite: id,
            seconds,
            volunteers,
          },
          { save: false },
        );
      },
      addFile(id, file) {
        return this.post(
          `/worksites/${id}/files`,
          {
            file,
          },
          { save: false },
        );
      },
      deleteFile(id, file) {
        return this.delete(
          `/worksites/${id}/files`,
          {
            data: { file },
          },
          { save: false },
        );
      },
      addFlag(id, flag) {
        return this.post(`/worksites/${id}/flags`, flag, { save: false });
      },
      searchWorksites(search, incident) {
        return this.get(
          `/worksites?fields=id,name,address,case_number,postal_code,city,state,incident,work_types&limit=5&search=${search}&incident=${incident}`,
          {
            dataKey: 'results',
          },
          { save: false },
        );
      },
      updateWorkTypeStatus(workTypeID, status) {
        return this.patch(
          `/worksite_work_types/${workTypeID}`,
          {
            status,
          },
          { save: false },
        );
      },
      // TODO: handle exceptions and ensure a value is returned
      // eslint-disable-next-line consistent-return
      printWorksite(id) {
        try {
          return this.request({
            url: `/worksites/${id}/download`,
            method: 'POST',
            responseType: 'blob',
            headers: { Accept: 'application/pdf' },
            save: false,
          });
        } catch (e) {
          // console.error(e)
        }
      },
      // TODO: handle exceptions and ensure a value is returned
      // eslint-disable-next-line consistent-return
      downloadWorksite(ids, type = 'text/csv') {
        if (!ids.length) {
          throw Error('Ids are required');
        }
        try {
          return this.request({
            url: `/worksites?id__in=${ids.join(',')}`,
            method: 'GET',
            responseType: 'blob',
            headers: { Accept: type },
            save: false,
          });
        } catch (e) {
          // console.error(e)
        }
      },
    },
  };
}
