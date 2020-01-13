<template>
  <modal
    v-if="true"
    modal-classes="bg-white max-w-2xl shadow"
    modal-style="min-height: 60%"
  >
    <div class="flex flex-col h-full">
      <div class="p-3">
        {{ $t('Filters') }}
        <span
          v-if="filtersCount > 0"
          class="rounded-full px-1 bg-yellow-500 text-xs"
          >{{ filtersCount }}</span
        >
      </div>
      <div
        v-if="filtersCount > 0"
        class="flex items-center justify-between bg-gray-100 p-1 px-2"
      >
        <div class="applied-filters flex flex-wrap justify-start bg-gray-100">
          <template v-for="(value, key) in filters.fields">
            <tag
              v-if="value"
              :key="key"
              closeable
              class="m-1"
              @closed="removeField(key)"
            >
              {{ $t('worksiteFilters.work_type') }}: {{ key | getWorkTypeName }}
            </tag>
          </template>
          <template v-for="(value, key) in filters.statusGroups">
            <tag
              v-if="value"
              :key="key"
              closeable
              class="m-1"
              @closed="removeStatus(key)"
            >
              {{ $t('worksiteFilters.status') }}: {{ key | snakeToTitleCase }}
            </tag>
          </template>
          <template v-for="(value, key) in filters.statuses">
            <tag
              v-if="value"
              :key="key"
              closeable
              class="m-1"
              @closed="removeStatus(key)"
            >
              {{ $t('worksiteFilters.status') }}: {{ key | getStatusName }}
            </tag>
          </template>
        </div>
        <div>
          <base-button
            type="bare"
            :text="$t('actions.clear_filters')"
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
              'border-l-8 border-l-black': currentSection === 'general',
            }"
            @click="currentSection = 'general'"
          >
            {{ $t('General') }}
            <span
              v-if="statusCount + statusGroupCount > 0"
              class="rounded-full px-1 bg-black text-white text-xs"
              >{{ statusCount + statusGroupCount }}</span
            >
          </div>
          <div class="p-3 px-4 border-b cursor-pointer">
            {{ $t('Personal Info') }}
          </div>
          <div
            class="p-3 px-4 border-b cursor-pointer"
            :class="{ 'border-l-8 border-l-black': currentSection === 'work' }"
            @click="currentSection = 'work'"
          >
            {{ $t('Work') }}
            <span
              v-if="fieldsCount > 0"
              class="rounded-full px-1 bg-black text-white text-xs"
              >{{ fieldsCount }}</span
            >
          </div>
        </div>
        <div
          class="w-3/4 ml-4 mt-2 flex-grow"
          style="height: 450px; overflow:auto"
        >
          <div v-if="currentSection === 'general'" class="flex flex-col">
            <div class="claim-status mb-2">
              <div class="my-1 text-base">{{ $t('worksiteFilters.claim_reported_by') }}</div>
              <base-checkbox
                v-model="filters.statusGroups['unclaimed']"
                class="block my-1"
                >{{ $t('worksiteFilters.unclaimed') }}
              </base-checkbox>
              <base-checkbox
                v-model="filters.statusGroups['claimed_by_org']"
                class="block my-1"
                >{{ $t('worksiteFilters.claimed_by_my_org') }}
              </base-checkbox>
              <base-checkbox
                v-model="filters.statusGroups['reported_by_org']"
                class="block my-1"
                >{{ $t('worksiteFilters.reported_by_my_org') }}
              </base-checkbox>
            </div>
            <div class="status-group mb-2">
              <div class="my-1 text-base">{{ $t('worksiteFilters.over_all_status') }}</div>
              <base-checkbox
                class="block my-1"
                :value="filters.statusGroups['open']"
                @input="
                  value => {
                    setOpenClosed(value, 'open');
                  }
                "
                >{{ $t('worksiteFilters.open') }}
              </base-checkbox>
              <base-checkbox
                class="block my-1"
                :value="filters.statusGroups['closed']"
                @input="
                  value => {
                    setOpenClosed(value, 'closed');
                  }
                "
                >{{ $t('worksiteFilters.closed') }}
              </base-checkbox>
            </div>

            <div class="statuses mb-2">
              <div class="my-1 text-base">{{ $t('worksiteFilters.detailed_status') }}</div>
              <div
                v-for="status in allStatuses"
                :key="status.id"
                :value="status.status"
              >
                <base-checkbox
                  class="block my-1"
                  :value="filters.statuses[status.status]"
                  @input="
                    value => {
                      filters.statuses[status.status] = value;
                      filters.statuses = {
                        ...filters.statuses,
                      };
                    }
                  "
                  >{{ status.status | getStatusName }}
                </base-checkbox>
              </div>
            </div>
          </div>
          <template v-if="currentSection === 'work'">
            <div
              v-for="f in incidentTypes"
              :key="f.key"
              :header="f.name_t"
              class="p-2 px-4 mb-2 bg-gray-100"
            >
              <div class="flex items-center justify-between">
                <base-checkbox v-model="filters.fields[f.key]">{{
                  f.name_t
                }}</base-checkbox>
                <font-awesome-icon
                  v-if="filters.fields[f.key]"
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
                            v-for="option in field.values"
                            v-if="Boolean(option.value)"
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
                            v-for="option in field.values"
                            v-if="Boolean(option.value)"
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
          </template>
        </div>
      </div>
    </div>
    <div
      slot="footer"
      class="flex items-center justify-center p-2 bg-white border-t"
    >
      <base-button
        :text="$t('actions.cancel')"
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
        size="medium"
        class="m-1 p-3 px-6"
        type="primary"
        :action="updateFilters"
      />
    </div>
  </modal>
</template>

<script>
import WorkType from '@/models/WorkType';
import Status from '@/models/Status';

export default {
  name: 'WorksiteFilters',
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
  },
  data() {
    return {
      filters: {
        fields: {},
        statuses: {},
        statusGroups: {},
        sub_fields: {},
      },
      currentSection: 'general',
      expanded: {},
    };
  },
  computed: {
    incidentTypes() {
      if (this.incident && this.incident.form_fields) {
        const fieldsWithTypes = this.incident.form_fields.filter(field => {
          return Boolean(field.if_selected_then_work_type);
        });

        return new Set(
          fieldsWithTypes.map(field => {
            const workTypes = WorkType.query()
              .where('key', field.if_selected_then_work_type)
              .get();
            return workTypes[0];
          }),
        );
      }
      return [];
    },
    fieldsCount() {
      return Object.values(this.filters.fields).filter(field => Boolean(field))
        .length;
    },
    statusCount() {
      return Object.values(this.filters.statuses).filter(field =>
        Boolean(field),
      ).length;
    },
    statusGroupCount() {
      return Object.values(this.filters.statusGroups).filter(field =>
        Boolean(field),
      ).length;
    },
    filtersCount() {
      return this.fieldsCount + this.statusCount + this.statusGroupCount;
    },
    allStatuses() {
      return Status.all().map((status, index) => {
        return {
          ...status,
          selectionKey: index + 1,
        };
      });
    },
  },
  created() {
    this.filters = {
      fields: { ...this.currentFilters.fields },
      statusGroups: { ...this.currentFilters.statusGroups },
      statuses: { ...this.currentFilters.statuses },
      sub_fields: {},
    };
  },
  mounted() {
    /* eslint-disable no-restricted-syntax */
    /* TODO: refactor after unit tests are complete */
    for (const type of this.incidentTypes) {
      this.filters.sub_fields[type.key] = {};
    }
  },
  methods: {
    updateFilters() {
      this.$emit('updatedFilters', {
        fields: { ...this.filters.fields },
        statusGroups: { ...this.filters.statusGroups },
        statuses: { ...this.filters.statuses },
      });

      for (const [key, value] of Object.entries(this.filters.fields)) {
        if (!value) {
          this.expanded[key] = false;
        }
      }
    },
    /* eslint-enable no-restricted-syntax */
    setOpenClosed(value, status) {
      this.filters.statusGroups.open = false;
      this.filters.statusGroups.closed = false;
      if (value) {
        this.filters.statusGroups[status] = value;
      }
      this.filters.statusGroups = {
        ...this.filters.statusGroups,
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
        return this.incident.form_fields.filter(field => {
          const parent = this.incident.form_fields.find(element => {
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
    removeField(key) {
      this.filters.fields[key] = undefined;
    },
    removeStatus(key) {
      this.filters.statusGroups[key] = undefined;
      this.filters.statuses[key] = undefined;
    },
    clearAllFilters() {
      this.filters = {
        fields: {},
        statuses: {},
        statusGroups: {},
        sub_fields: {},
      };
    },
  },
};
</script>

<style scoped></style>
