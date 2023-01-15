import { secondsToHm } from '../filters';
import enums from '../store/modules/enums';
import { getQueryString } from '../utils/urls';
import Organization from './Organization';
import User from './User';
import CCUModel from './model';

export default class Worksite extends CCUModel<Worksite> {
  static entity = 'worksites';

  id!: string;

  name!: string;

  case_number!: string;

  address!: string;

  city!: string;

  postal_code!: string;

  state!: string;

  updated_at!: string;

  location!: any;

  incident!: any;

  time!: any[];

  form_data!: any[];

  flags!: any[];

  work_types!: any[];

  favorite!: boolean;
  svi!: number;

  key_work_type!: Record<string, any>;

  static fields() {
    return {
      id: this.string(''),
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
      key_work_type: this.attr(null),
      what3words: this.attr(null),
      notes: this.attr([]),
      files: this.attr(null),
      time: this.attr(null),
      flags: this.attr([]),
      events: this.attr(null),
      reported_by: this.attr(null),
      phone1: this.attr(null),
      phone2: this.attr(null),
      email: this.attr(null),
      updated_at: this.attr(null),
      favorite: this.attr(null),
      auto_contact_frequency_t: this.attr(null),
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
    return this.time.reduce((total, object) => {
      return total + object.volunteers;
    }, 0);
  }

  get total_time() {
    if (this.time) {
      const seconds = this.time.reduce((total, object) => {
        return total + object.seconds * object.volunteers;
      }, 0);
      return secondsToHm(seconds);
    }

    return null;
  }

  get formFields() {
    if (!this.form_data) {
      return {};
    }

    return this.form_data.reduce((object, item) => {
      return {
        ...object,
        [item.field_key]: item.field_value,
      };
    }, {});
  }

  get isHighPriority() {
    return this.flags.some((flag) => flag.is_high_priority);
  }

  get isFavorite() {
    return Boolean(this.favorite);
  }

  static getWorkType(workTypes, filters, organization) {
    // TODO: Unit Test
    let currentFilteredTypes: string[] = [];
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

    if (workTypesInFilter.length > 1) {
      if (filterByClaimedOrg(workTypesInFilter).length > 0) {
        return filterByClaimedOrg(workTypesInFilter)[0];
      }

      if (filterByUnclaimed(workTypesInFilter).length > 0) {
        return filterByUnclaimed(workTypesInFilter)[0];
      }

      return workTypesInFilter[0];
    }

    if (filterByClaimedOrg(allWorkTypes).length > 0) {
      return filterByClaimedOrg(allWorkTypes)[0];
    }

    if (filterByUnclaimed(allWorkTypes).length > 0) {
      return filterByUnclaimed(allWorkTypes)[0];
    }

    return allWorkTypes[0];
  }

  static apiConfig = {
    actions: {
      async fetch(id, incident = null) {
        const worksiteParameters: any = {};
        if (incident) {
          worksiteParameters.incident = incident;
        }

        const worksite = await this.get(
          `/worksites/${id}?${getQueryString(worksiteParameters)}`,
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
        const eventUserIds = worksite.response.data.events
          .map((event) => event.created_by)
          .filter(
            (userId) =>
              Number(userId) !== Number(User.store().getters['auth/userId']),
          );
        await User.api().get(`/users?id__in=${eventUserIds.join(',')}`, {
          dataKey: 'results',
        });
        return worksite;
      },
      async find_or_fetch(id, { resolve = true }) {
        let item = await Worksite.find(id);
        if (!item) {
          if (resolve) {
            item = await Worksite.api().fetch(id);
          } else {
            const {
              response: { data },
            } = await Worksite.api().get(`/worksites/${id}`);
            item = data;
          }
        }

        return item;
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
        const data: Record<string, any> = {
          work_types: workTypes,
        };
        if (status) {
          data.status = status;
        }

        return this.post(`/worksites/${id}/unclaim`, data, { save: false });
      },
      releaseWorkType(id, workTypes, unclaimReason = '') {
        const data: Record<string, any> = {
          work_types: workTypes,
        };
        if (unclaimReason) {
          data.unclaim_reason = unclaimReason;
        }

        return this.post(`/worksites/${id}/release`, data, { save: false });
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
      addTime(worksiteId, seconds, volunteers) {
        return this.post(
          `/time`,
          {
            worksite: worksiteId,
            seconds,
            volunteers,
          },
          { save: false },
        );
      },
      updateTimeEntry(id, seconds, volunteers) {
        return this.patch(
          `/time/${id}`,
          {
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
      addFileWithToken(token, file) {
        return this.post(
          `/print_tokens/${token}/files`,
          {
            file,
          },
          { save: false },
        );
      },
      addFileWithSurvivorToken(token, file) {
        return this.post(
          `/survivor_tokens/${token}/files`,
          {
            file,
          },
          { save: false },
        );
      },
      getHistory(id) {
        return this.get(`/worksites/${id}/history`, {}, { save: false });
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
      deleteFileWithSurvivorToken(id, file) {
        return this.delete(
          `/survivor_tokens/${id}/files`,
          {
            data: { file },
          },
          { save: false },
        );
      },
      addFlag(id, flag) {
        return this.post(`/worksites/${id}/flags`, flag, { save: false });
      },
      deleteFlag(id, flag) {
        return this.delete(
          `/worksites/${id}/flags`,
          {
            data: { flag_id: flag.id },
          },
          { save: false },
        );
      },
      favorite(id, type = 'favorite') {
        return this.post(
          `/worksites/${id}/favorite`,
          { type_t: type },
          { save: false },
        );
      },
      unfavorite(id, favoriteId) {
        return this.delete(
          `/worksites/${id}/favorite`,
          {
            data: { favorite_id: favoriteId },
          },
          { save: false },
        );
      },
      sendSurvivorSms(id, phone) {
        return this.post(
          `/worksites/${id}/send_survivor_sms`,
          {
            phone,
          },
          { save: false },
        );
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

      printWorksite(id, noClaimReason = null) {
        try {
          const data: Record<string, any> = {};
          if (noClaimReason) {
            data.no_claim_reason_text = noClaimReason;
          }

          return this.request({
            url: `/worksites/${id}/download`,
            method: 'POST',
            responseType: 'blob',
            data,
            headers: { Accept: 'application/pdf' },
            save: false,
          });
        } catch {
          // Console.error(e)
        }
      },
      // TODO: handle exceptions and ensure a value is returned

      downloadWorksite(ids, type = 'text/csv') {
        if (ids.length === 0) {
          throw new Error('Ids are required');
        }

        try {
          return this.request({
            url: `/worksites?id__in=${ids.join(',')}`,
            method: 'GET',
            responseType: 'blob',
            headers: { Accept: type },
            save: false,
          });
        } catch {
          // Console.error(e)
        }
      },
      async fetchByPhoneNumber(phoneNumber, incidentId) {
        const results = await this.get(
          `/worksites`,
          {
            params: {
              phone_number: phoneNumber,
              incident: incidentId,
            },
          },
          { save: false },
        );
        const {
          response: { data },
        } = results;
        return data;
      },
    } as any,
  };
}
