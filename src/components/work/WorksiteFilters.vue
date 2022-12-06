<template>
  <modal
    v-if="show"
    modal-classes="bg-white max-w-2xl shadow"
    modal-style="min-height: 60%"
  >
    <div class="flex flex-col h-full">
      <div class="p-3">
        {{ $t('worksiteFilters.filters') }}
        <span
          v-if="filtersCount > 0"
          class="rounded-full px-1 bg-yellow-500 text-xs"
          >{{ filtersCount }}</span
        >
      </div>
      <div
        v-if="filtersCount > 0"
        class="flex items-center justify-between bg-crisiscleanup-light-grey p-1 px-2"
      >
        <div
          class="applied-filters flex flex-wrap justify-start bg-crisiscleanup-light-grey"
        >
          <template v-for="(filter, key) in filters">
            <template v-for="(label, identifier) in filter.labels">
              <tag
                :key="key + identifier"
                closeable
                class="m-1"
                @closed="
                  () => {
                    filter.removeField(identifier);
                  }
                "
              >
                {{ label }}
              </tag>
            </template>
          </template>
        </div>
        <div>
          <base-button
            type="bare"
            :text="$t('actions.clear_filters')"
            :alt="$t('actions.clear_filters')"
            class="text-yellow-500 text-underline w-32"
            :action="clearAllFilters"
          />
        </div>
      </div>

      <div class="flex flex-grow h-full">
        <div class="w-1/4 border-r">
          <div
            class="p-3 px-4 border-b cursor-pointer"
            :class="{
              'border-l-4 border-l-black': currentSection === 'general',
            }"
            @click="currentSection = 'general'"
          >
            {{ $t('worksiteFilters.general') }}
            <span
              v-if="statusCount + statusGroupCount > 0"
              class="rounded-full px-1 bg-black text-white text-xs"
              >{{ statusCount + statusGroupCount }}</span
            >
          </div>
          <div
            class="p-3 px-4 border-b cursor-pointer"
            :class="{
              'border-l-4 border-l-black': currentSection === 'personal',
            }"
            @click="currentSection = 'personal'"
          >
            {{ $t('worksiteFilters.personal_info') }}
            <span
              v-if="formDataCount + survivorCount > 0"
              class="rounded-full px-1 bg-black text-white text-xs"
              >{{ formDataCount + survivorCount }}</span
            >
          </div>
          <div
            class="p-3 px-4 border-b cursor-pointer"
            :class="{
              'border-l-4 border-l-black': currentSection === 'flags',
            }"
            @click="currentSection = 'flags'"
          >
            {{ $t('worksiteFilters.flags') }}
            <span
              v-if="flagsCount > 0"
              class="rounded-full px-1 bg-black text-white text-xs"
              >{{ flagsCount }}</span
            >
          </div>
          <div
            class="p-3 px-4 border-b cursor-pointer"
            :class="{ 'border-l-4 border-l-black': currentSection === 'work' }"
            @click="currentSection = 'work'"
          >
            {{ $t('worksiteFilters.work') }}
            <span
              v-if="fieldsCount + missingWorkTypeCount > 0"
              class="rounded-full px-1 bg-black text-white text-xs"
              >{{ fieldsCount + missingWorkTypeCount }}</span
            >
          </div>
          <div
            class="p-3 px-4 border-b cursor-pointer"
            :class="{ 'border-l-4 border-l-black': currentSection === 'teams' }"
            @click="currentSection = 'teams'"
            v-if="teams.length"
          >
            {{ $t('worksiteFilters.teams') }}
            <span
              v-if="teamsCount > 0"
              class="rounded-full px-1 bg-black text-white text-xs"
              >{{ teamsCount }}</span
            >
          </div>
          <div
            class="p-3 px-4 border-b cursor-pointer"
            :class="{
              'border-l-4 border-l-black': currentSection === 'locations',
            }"
            @click="currentSection = 'locations'"
          >
            {{ $t('worksiteFilters.locations') }}
            <span
              v-if="locationsCount > 0"
              class="rounded-full px-1 bg-black text-white text-xs"
              >{{ locationsCount }}</span
            >
          </div>
          <div
            class="p-3 px-4 border-b cursor-pointer"
            :class="{
              'border-l-4 border-l-black': currentSection === 'dates',
            }"
            @click="currentSection = 'dates'"
          >
            {{ $t('worksiteFilters.dates') }}
            <span
              v-if="datesCount > 0"
              class="rounded-full px-1 bg-black text-white text-xs"
              >{{ datesCount }}</span
            >
          </div>
        </div>
        <div class="w-3/4 ml-4 mt-2 flex-grow modal-item">
          <div v-if="currentSection === 'general'" class="flex flex-col">
            <div class="claim-status mb-2">
              <div class="my-1 text-base">
                {{ $t('worksiteFilters.location') }}
              </div>
              <base-checkbox
                v-model="
                  filters.locations.data['organization_primary_location']
                "
                class="block my-1"
              >
                {{ $t('worksiteFilters.in_primary_response_area') }}
              </base-checkbox>
              <base-checkbox
                v-model="
                  filters.locations.data['organization_secondary_location']
                "
                class="block my-1"
              >
                {{ $t('worksiteFilters.in_secondary_response_area') }}
              </base-checkbox>
            </div>
            <div class="claim-status mb-2">
              <div class="my-1 text-base">
                {{ $t('worksiteFilters.team') }}
              </div>
              <base-checkbox
                v-model="filters.my_team.data.my_team"
                class="block my-1"
              >
                {{ $t('worksiteFilters.assigned_to_my_team') }}
              </base-checkbox>
            </div>
            <div class="claim-status mb-2">
              <div class="my-1 text-base">
                {{ $t('worksiteFilters.claim_reported_by') }}
              </div>
              <base-checkbox
                v-model="filters.statusGroups.data['unclaimed']"
                class="block my-1"
                >{{ $t('worksiteFilters.unclaimed') }}
              </base-checkbox>
              <base-checkbox
                v-model="filters.statusGroups.data['claimed_by_org']"
                class="block my-1"
                >{{ $t('worksiteFilters.claimed_by_my_org') }}
              </base-checkbox>
              <base-checkbox
                v-model="filters.statusGroups.data['reported_by_org']"
                class="block my-1"
                >{{ $t('worksiteFilters.reported_by_my_org') }}
              </base-checkbox>
            </div>
            <div class="status-group mb-2">
              <div class="my-1 text-base">
                {{ $t('worksiteFilters.over_all_status') }}
              </div>
              <base-checkbox
                class="block my-1"
                :value="filters.statusGroups.data['open']"
                @input="
                  (value) => {
                    setOpenClosed(value, 'open');
                  }
                "
                >{{ $t('worksiteFilters.open') }}
              </base-checkbox>
              <base-checkbox
                class="block my-1"
                :value="filters.statusGroups.data['closed']"
                @input="
                  (value) => {
                    setOpenClosed(value, 'closed');
                  }
                "
                >{{ $t('worksiteFilters.closed') }}
              </base-checkbox>
            </div>

            <div class="statuses mb-2">
              <div class="my-1 text-base">
                {{ $t('worksiteFilters.detailed_status') }}
              </div>
              <div
                v-for="status in allStatuses"
                :key="`${status.id}`"
                :value="status.status"
              >
                <base-checkbox
                  class="block my-1"
                  :value="filters.statuses.data[status.status]"
                  @input="
                    (value) => {
                      filters.statuses.data[status.status] = value;
                      filters.statuses.data = {
                        ...filters.statuses.data,
                      };
                    }
                  "
                  >{{ status.status | getStatusName }}
                </base-checkbox>
              </div>
            </div>
          </div>
          <div v-if="currentSection === 'flags'" class="flex flex-col">
            <div class="status-group mb-2">
              <div class="my-1 text-base">
                {{ $t('worksiteFilters.flags') }}
              </div>
              <base-checkbox
                v-for="flag in flagTypes"
                :key="flag"
                class="block my-1"
                :value="filters.flags.data[flag]"
                @input="
                  (value) => {
                    filters.flags.data[flag] = value;
                    filters.flags.data = { ...filters.flags.data };
                  }
                "
                >{{ $t(flag) }}
              </base-checkbox>
            </div>
          </div>
          <div v-if="currentSection === 'personal'" class="flex flex-col">
            <div class="survivors mb-2">
              <div class="my-1 text-base">
                {{ $t('worksiteFilters.my_organization') }}
              </div>
              <base-checkbox
                v-model="filters.survivors.data.member_of_my_organization"
                class="block my-1"
              >
                {{ $t('worksiteFilters.member_of_my_org') }}
              </base-checkbox>
            </div>
            <div class="status-group mb-2">
              <div class="my-1 text-base">
                {{ $t('worksiteFilters.personal_info') }}
              </div>
              <base-checkbox
                v-for="data in [
                  'older_than_60',
                  'children_in_home',
                  'first_responder',
                  'veteran',
                ]"
                :key="data"
                class="block my-1"
                :value="filters.form_data.data[data]"
                @input="
                  (value) => {
                    filters.form_data.data[data] = value;
                    filters.form_data.data = { ...filters.form_data.data };
                  }
                "
                >{{ $t(`formLabels.${data}`) }}
              </base-checkbox>
            </div>
          </div>
          <template v-if="currentSection === 'work'">
            <div
              v-for="f in incidentTypes"
              :key="f.key"
              :header="f.name_t"
              class="p-2 px-4 mb-2 bg-crisiscleanup-light-grey"
            >
              <div class="flex items-center justify-between">
                <base-checkbox v-model="filters.fields.data[f.key]">{{
                  f.name_t
                }}</base-checkbox>
                <font-awesome-icon
                  v-if="filters.fields.data[f.key]"
                  class="cursor-pointer"
                  size="md"
                  :icon="expanded[f.key] ? 'caret-up' : 'caret-down'"
                  @click="expandSection(f.key)"
                />
              </div>
              <div v-if="expanded[f.key]">
                <template v-for="field in getFieldsForType(f.key)">
                  <div :key="field.field_key" class="border-b py-3">
                    <template v-if="field.html_type === 'select'">
                      <div class="font-bold">
                        {{ field.label_t }}
                      </div>
                      <div>
                        <div>
                          <div
                            v-for="option in field.values.filter((option) =>
                              Boolean(option.value),
                            )"
                            :key="option.value"
                            :span="8"
                          >
                            <base-checkbox :value="option.value">
                              {{ option.name_t }}
                            </base-checkbox>
                          </div>
                        </div>
                      </div>
                    </template>
                    <template v-if="field.html_type === 'multiselect'">
                      <div class="font-bold">
                        {{ field.label_t }}
                      </div>
                      <div>
                        <div>
                          <div
                            v-for="option in field.values.filter((option) =>
                              Boolean(option.value),
                            )"
                            :key="option.value"
                            :span="8"
                          >
                            <base-checkbox :value="option.value">
                              {{ option.name_t }}
                            </base-checkbox>
                          </div>
                        </div>
                      </div>
                    </template>
                    <template v-if="field.html_type === 'checkbox'">
                      <div class="flex">
                        <span class="font-bold w-1/2">
                          {{ field.label_t }}
                        </span>
                        <div class="flex justify-around w-1/2">
                          <base-checkbox>{{
                            $t('worksiteFilters.yes')
                          }}</base-checkbox>
                          <base-checkbox>{{
                            $t('worksiteFilters.no')
                          }}</base-checkbox>
                          <base-checkbox>{{
                            $t('worksiteFilters.maybe')
                          }}</base-checkbox>
                        </div>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </div>
            <div class="status-group mb-2">
              <div class="my-1 text-base">
                {{ $t('worksiteFilters.missing_information') }}
              </div>
              <base-checkbox
                v-model="filters.missingWorkType.data['missing_work_type']"
                class="block my-1"
              >
                {{ $t('worksiteFilters.no_work_type') }}
              </base-checkbox>
            </div>
          </template>
          <div v-if="currentSection === 'teams'" class="flex flex-col">
            <div class="status-group mb-2">
              <div class="my-1 text-base">
                {{ $t('worksiteFilters.teams') }}
              </div>
              <base-checkbox
                v-for="team in teams"
                :key="`${team.id}`"
                class="block my-1"
                :value="filters.teams.data[team.id]"
                @input="
                  (value) => {
                    filters.teams.data[team.id] = value;
                    filters.teams.data = { ...filters.teams.data };
                  }
                "
                >{{ team.name }}
              </base-checkbox>
            </div>
          </div>
          <div v-if="currentSection === 'locations'" class="flex flex-col">
            <div class="mb-2">
              <div class="claim-status mb-2" v-if="filters.locations">
                <div class="my-1 text-base">
                  {{ $t('worksiteFilters.response_areas') }}
                </div>
                <base-checkbox
                  v-model="
                    filters.locations.data['organization_primary_location']
                  "
                  class="block my-1"
                >
                  {{ $t('worksiteFilters.in_primary_response_area') }}
                </base-checkbox>
                <base-checkbox
                  v-model="
                    filters.locations.data['organization_secondary_location']
                  "
                  class="block my-1"
                >
                  {{ $t('worksiteFilters.in_secondary_response_area') }}
                </base-checkbox>
              </div>
              <div class="mb-2">
                <div class="my-1 text-base">
                  {{ $t('worksiteFilters.my_locations') }}
                </div>
                <div v-for="location in locations" :key="`${location.id}`">
                  <base-checkbox
                    class="block my-1"
                    :value="filters.locations.data[location.id]"
                    @input="
                      (value) => {
                        filters.locations.data[location.id] = value;
                        filters.locations.data = {
                          ...filters.locations.data,
                        };
                      }
                    "
                    >{{ location.name }}
                  </base-checkbox>
                </div>
              </div>
            </div>
          </div>
          <div v-if="currentSection === 'dates'" class="flex flex-col">
            <div class="mb-2">
              <div class="mb-2">
                <div class="my-1 text-base">
                  {{ $t('worksiteFilters.created') }}
                </div>
                <datepicker
                  input-class="h-10 p-1 outline-none w-56 border border-crisiscleanup-dark-100 text-sm mb-2"
                  wrapper-class="flex-grow"
                  :format="(date) => $moment(date).format('ddd MMMM Do YYYY')"
                  :placeholder="$t('worksiteFilters.start_date')"
                  v-model="filters.dates.data.created_start"
                ></datepicker>
                <datepicker
                  input-class="h-10 p-1 outline-none w-56 border border-crisiscleanup-dark-100 text-sm"
                  wrapper-class="flex-grow"
                  :format="(date) => $moment(date).format('ddd MMMM Do YYYY')"
                  :placeholder="$t('worksiteFilters.end_date')"
                  v-model="filters.dates.data.created_end"
                ></datepicker>

                <div class="my-1 text-base">
                  {{ $t('worksiteFilters.updated') }}
                </div>
                <datepicker
                  input-class="h-10 p-1 outline-none w-56 border border-crisiscleanup-dark-100 text-sm mb-2"
                  wrapper-class="flex-grow"
                  :format="(date) => $moment(date).format('ddd MMMM Do YYYY')"
                  :placeholder="$t('worksiteFilters.start_date')"
                  v-model="filters.dates.data.updated_start"
                ></datepicker>
                <datepicker
                  input-class="h-10 p-1 outline-none w-56 border border-crisiscleanup-dark-100 text-sm"
                  wrapper-class="flex-grow"
                  :format="(date) => $moment(date).format('ddd MMMM Do YYYY')"
                  :placeholder="$t('worksiteFilters.end_date')"
                  v-model="filters.dates.data.updated_end"
                ></datepicker>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      slot="footer"
      class="flex items-center justify-center p-2 bg-white border-t"
    >
      <base-button
        :text="$t('actions.cancel')"
        :alt="$t('actions.cancel')"
        size="medium"
        class="m-1 border-2 border-black px-6 py-2"
        :action="
          () => {
            $emit('closedFilters');
          }
        "
      />
      <base-button
        :text="$t('actions.apply_filters')"
        :alt="$t('actions.apply_filters')"
        ccu-event="user_ui-turn-on_filter"
        size="medium"
        class="m-1 p-3 px-6"
        variant="solid"
        :action="updateFilters"
      />
    </div>
  </modal>
</template>

<script>
import { mapState } from 'vuex';
import Team from '@/models/Team';
import WorksiteFieldsFilter from '../utils/data_filters/WorksiteFieldsFilter';
import WorksiteFlagsFilter from '../utils/data_filters/WorksiteFlagsFilter';
import FormDataFilter from '../utils/data_filters/FormDataFilter';
import WorksiteStatusGroupFilter from '../utils/data_filters/WorksiteStatusGroupFilter';
import WorksiteStatusFilter from '../utils/data_filters/WorksiteStatusFilter';
import WorksiteLocationsFilter from '../utils/data_filters/WorksiteLocationsFilter';
import WorksiteMissingWorkTypeFilter from '../utils/data_filters/WorksiteMissingWorkTypeFilter';
import WorksiteMyTeamFilter from '../utils/data_filters/WorksiteMyTeamFilter';
import SurvivorFilter from '../utils/data_filters/SurvivorFilter';
import WorksiteTeamsFilter from '../utils/data_filters/WorksiteTeamsFilter';
// import { UserMixin } from '../mixins';
import WorksiteDatesFilter from '@/utils/data_filters/WorksiteDatesFilter';
import { ref } from 'vue';

export default {
  name: 'WorksiteFilters',
  // mixins: [UserMixin],
  props: {
    incident: {
      type: Object,
      default: () => {
        return {};
      },
    },
    currentFilters: {
      type: Object,
      default: () => {
        return {};
      },
    },
    locations: {
      type: Array,
      default: () => {
        return [];
      },
    },
    show: {
      type: Boolean,
    },
  },
  computed: {
    incidentTypes() {
      if (this.incident && this.incident.form_fields) {
        const fieldsWithTypes = this.incident.form_fields.filter((field) => {
          return Boolean(field.if_selected_then_work_type);
        });

        const types = new Set(
          fieldsWithTypes.map((t) => t.if_selected_then_work_type),
        );

        return Array.from(types).map((workType) => {
          return this.workTypes.find((type) => type.key === workType);
        });
      }
      return [];
    },
    fieldsCount() {
      return this.filters.fields.count;
    },
    statusCount() {
      return this.filters.statuses.count;
    },
    statusGroupCount() {
      return this.filters.statusGroups.count;
    },
    flagsCount() {
      return this.filters.flags.count;
    },
    formDataCount() {
      return this.filters.form_data.count;
    },
    locationsCount() {
      return this.filters.locations.count;
    },
    missingWorkTypeCount() {
      return this.filters.missingWorkType.count;
    },
    teamsCount() {
      return this.filters.teams.count;
    },
    myTeamCount() {
      return this.filters.my_team.count;
    },
    datesCount() {
      return this.filters.dates.count;
    },
    survivorCount() {
      return this.filters.survivors.count;
    },
    filtersCount() {
      return (
        this.fieldsCount +
        this.statusCount +
        this.statusGroupCount +
        this.locationsCount +
        this.flagsCount +
        this.formDataCount +
        this.missingWorkTypeCount +
        this.teamsCount +
        this.survivorCount +
        this.datesCount +
        this.myTeamCount
      );
    },
    teams() {
      return Team.all();
    },
    ...mapState('enums', ['statuses', 'workTypes']),
    allStatuses() {
      return this.statuses.map((status, index) => {
        return {
          ...status,
          selectionKey: index + 1,
        };
      });
    },
  },
  watch: {
    currentFilters() {
      this.filters = {
        fields: new WorksiteFieldsFilter(
          'fields',
          (this.currentFilters.fields && this.currentFilters.fields.data) || {},
        ),
        statusGroups: new WorksiteStatusGroupFilter(
          'statusGroups',
          (this.currentFilters.statusGroups &&
            this.currentFilters.statusGroups.data) ||
            {},
        ),
        flags: new WorksiteFlagsFilter(
          'flags',
          (this.currentFilters.flags && this.currentFilters.flags.data) || {},
        ),
        form_data: new FormDataFilter(
          'flags',
          (this.currentFilters.form_data &&
            this.currentFilters.form_data.data) ||
            {},
        ),
        locations: new WorksiteLocationsFilter(
          'locations',
          (this.currentFilters.locations &&
            this.currentFilters.locations.data) ||
            {},
        ),
        statuses: new WorksiteStatusFilter(
          'statuses',
          (this.currentFilters.statuses && this.currentFilters.statuses.data) ||
            {},
        ),
        my_team: new WorksiteMyTeamFilter(
          'my_team',
          (this.currentFilters.my_team && this.currentFilters.my_team.data) ||
            {},
        ),
        dates: new WorksiteDatesFilter(
          'dates',
          (this.currentFilters.dates && this.currentFilters.dates.data) || {},
        ),
        survivors: new SurvivorFilter(
          'survivors',
          (this.currentFilters.survivors &&
            this.currentFilters.survivors.data) ||
            {},
        ),
        teams: new WorksiteTeamsFilter(
          'teams',
          (this.currentFilters.teams && this.currentFilters.teams.data) || {},
        ),
        missingWorkType: new WorksiteMissingWorkTypeFilter(
          'missingWorkType',
          (this.currentFilters.missingWorkType &&
            this.currentFilters.missingWorkType.data) ||
            {},
        ),
      };
      this.$emit('updateFiltersCount', this.filtersCount);
    },
  },
  methods: {
    updateFilters() {
      this.$emit('updatedFilters', {
        filters: {
          ...this.filters,
        },
        count: this.filtersCount,
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(this.filters.fields.data)) {
        if (!value) {
          this.expanded[key] = false;
        }
      }
    },
    /* eslint-enable no-restricted-syntax */
    setOpenClosed(value, status) {
      this.filters.statusGroups.data.open = false;
      this.filters.statusGroups.data.closed = false;
      if (value) {
        this.filters.statusGroups.data[status] = value;
      }
      this.filters.statusGroups.data = {
        ...this.filters.statusGroups.data,
      };
    },
    expandSection(key) {
      this.expanded[key] = !this.expanded[key];
      this.expanded = { ...this.expanded };
    },
    setSubFields(workType, field, values) {
      this.sub_fields[workType][field] = values;
    },
    getFieldsForType(workType) {
      if (this.incident && this.incident.form_fields) {
        return this.incident.form_fields.filter((field) => {
          const parent = this.incident.form_fields.find((element) => {
            return element.field_key === field.field_parent_key;
          });

          // eslint-disable-next-line camelcase
          let { if_selected_then_work_type } = field;
          if (parent) {
            if_selected_then_work_type = parent.if_selected_then_work_type;
          }
          return if_selected_then_work_type === workType;
        });
      }
      return [];
    },
    clearAllFilters() {
      this.filters = {
        fields: new WorksiteFieldsFilter('fields', {}),
        statusGroups: new WorksiteStatusGroupFilter('statusGroups', {}),
        flags: new WorksiteFlagsFilter('flags', {}),
        form_data: new FormDataFilter('form_data', {}),
        statuses: new WorksiteStatusFilter('statuses', {}),
        locations: new WorksiteLocationsFilter('locations', {}),
        teams: new WorksiteTeamsFilter('teams', {}),
        my_team: new WorksiteMyTeamFilter('my_team', {}),
        dates: new WorksiteDatesFilter('dates', {}),
        survivors: new SurvivorFilter('survivors', {}),
        missingWorkType: new WorksiteMissingWorkTypeFilter(
          'missingWorkType',
          {},
        ),
      };
    },
  },
  mounted() {
    if (Object.keys(this.currentFilters).length === 0) {
      this.clearAllFilters();
    }
  },

  setup(props, { emit }) {
    const filters = ref({
      fields: {},
      statuses: {},
      teams: {},
      dates: {},
      my_team: {},
      survivors: {},
      statusGroups: {},
      flags: {},
      form_data: {},
      sub_fields: {},
      locations: {},
      missingWorkType: {},
    });
    const currentSection = ref('general');
    const expanded = ref({});
    const flagTypes = [
      'flag.worksite_high_priority',
      'flag.worksite_upset_client',
      'flag.worksite_mark_for_deletion',
      'flag.worksite_abuse',
      'flag.duplicate',
      'flag.worksite_wrong_location',
      'flag.worksite_wrong_incident',
    ];

    return {
      filters,
      currentSection,
      expanded,
      flagTypes,
    };
  },
};
</script>

<style scoped>
.modal-item {
  height: 450px;
  overflow: auto;
}
@media only screen and (max-width: 1223px) and (orientation: landscape) {
  .modal-item {
    height: 68vh;
  }
}
</style>
