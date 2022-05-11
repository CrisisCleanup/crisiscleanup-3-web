<template>
  <div class="flex">
    <div class="flex flex-col flex-1 mx-1">
      <form-select
        :value="selectedIncidentTemplate"
        :options="incidents"
        searchable
        select-classes="bg-white border border-crisiscleanup-dark-100 h-9 mb-3"
        item-key="id"
        label="name"
        :placeholder="$t('incidentBuilder.select_template')"
        @input="
          (value) => {
            selectedIncidentTemplate = value;
            getTemplate(value);
          }
        "
      />
      <nested-builder-item
        class="h-120 overflow-auto"
        v-if="selectedIncidentTemplate"
        :list="list"
        @deleteItem="list = list.filter((f) => f.field_key !== $event)"
        @update="updateField"
        @change="
          (value) => {
            list = [...value];
            list.forEach((field) => {
              if (!field.children) {
                field.children = [];
              }
            });
            $emit('onUpdateForm', value);
          }
        "
      />
    </div>
    <div class="flex-1 mx-1">
      <base-input
        icon="search"
        :placeholder="$t('incidentBuilder.search_elements')"
        class="mb-2"
        :value="elementSearch"
        @input="search"
      ></base-input>
      <div class="h-120 overflow-auto">
        <div
          class="border mb-2 bg-white"
          v-for="key in Object.keys(groupedFields)"
          :key="key"
        >
          <div class="px-3 py-1 text-base bg-crisiscleanup-smoke">
            {{ key | startCase }}
          </div>
          <draggable
            tag="div"
            class="item-container flex flex-wrap my-1"
            :key="selectedIncidentTemplate"
            :list="groupedFields[key]"
            :group="{ name: 'fields', pull: 'clone', put: false }"
            handle=".handle"
          >
            <div
              class="border p-1 m-1"
              v-for="field in groupedFields[key]"
              :key="field.key"
            >
              <div class="flex items-center">
                <div class="handle min-w-max mr-0.5">
                  <ccu-icon
                    icon-classes="cursor-move"
                    :alt="$t('actions.drag')"
                    height="15"
                    width="10"
                    type="drag"
                  />
                </div>
                {{ $t(field.label_t) }} ({{ field.html_type }})
              </div>
            </div>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Draggable from 'vuedraggable';
import { sortBy } from 'lodash/collection';
import { debounce } from 'lodash';
import { groupBy } from '@/utils/array';
import { nest } from '@/utils/form';
import NestedBuilderItem from '@/components/admin/incidents/NestedBuilderItem';

export default {
  name: 'IncidentFormBuilder',
  components: { Draggable, NestedBuilderItem },
  data() {
    return {
      incidents: [],
      availableFields: [],
      formFields: [],
      list: [],
      elementSearch: '',
      selectedIncidentTemplate: null,
    };
  },
  props: {
    incident: {
      type: Object,
      default: () => ({}),
    },
  },
  async mounted() {
    const incidentsResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/incidents_list?fields=id,name,short_name,geofence,locations,turn_on_release&limit=200&sort=-start_at`,
    );
    this.incidents = incidentsResponse.data.results;
    await this.getAvailableFields();
    if (this.$route.params.incident_id && this.incident?.id) {
      this.selectedIncidentTemplate = this.incident.id;
      await this.getTemplate(this.incident.id);
    }
  },
  methods: {
    async getTemplate(value) {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/incidents/${value}/template`,
      );
      this.formFields = response.data.filter(
        (field) => !['hidden', 'divend'].includes(field.html_type),
      );
    },
    async getAvailableFields() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/incident_fields`,
        {
          params: {
            limit: 1000,
            search: this.elementSearch,
          },
        },
      );
      this.availableFields = response.data.results;
    },
    updateField({ field_key, prop, value }) {
      const find = (list) => {
        let i = 0;
        let found;

        for (; i < list.length; i++) {
          if (list[i].field_key === field_key) {
            return list[i];
          }
          if (Array.isArray(list[i].children)) {
            found = find(list[i].children);
            if (found) {
              return found;
            }
          }
        }
        return null;
      };

      const field = find(this.list);
      if (field) {
        field[prop] = value;
      }
    },
    search: debounce(
      function (value) {
        this.elementSearch = value;
        this.getAvailableFields();
      },
      150,
      {
        leading: false,
        trailing: true,
      },
    ),
  },
  computed: {
    groupedFields() {
      const fields = [...this.availableFields];
      return groupBy(fields, 'data_group');
    },
    fieldTree() {
      if (this.formFields.length > 0) {
        return sortBy(nest(this.formFields), (o) => o.list_order);
      }
      return [];
    },
  },
  watch: {
    fieldTree: {
      handler(value) {
        this.list = [...value];
        this.$emit('onUpdateForm', this.list);
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>
