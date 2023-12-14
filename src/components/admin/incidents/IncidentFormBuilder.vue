<template>
  <div class="flex flex-col sm:flex-row">
    <div class="flex flex-col flex-1 mx-1">
      <base-select
        :model-value="selectedIncidentTemplate"
        :options="incidents"
        searchable
        select-classes="bg-white outline-none h-9 mb-3"
        item-key="id"
        label="name"
        :placeholder="translate('incidentBuilder.select_template')"
        @update:modelValue="
          (value: string) => {
            selectedIncidentTemplate = value;
            getTemplate(value);
          }
        "
      />
      <nested-builder-item
        v-if="selectedIncidentTemplate"
        class="h-120 overflow-auto"
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
        :placeholder="translate('incidentBuilder.search_elements')"
        class="mb-2"
        :model-value="elementSearch"
        @update:modelValue="search"
      ></base-input>
      <div class="h-120 overflow-auto">
        <div
          v-for="key in Object.keys(groupedFields)"
          :key="key"
          class="border mb-2 bg-white"
        >
          <div class="px-3 py-1 text-base bg-crisiscleanup-smoke">
            {{ key }}
          </div>
          <draggable
            :key="selectedIncidentTemplate"
            tag="div"
            class="item-container flex flex-wrap my-1"
            :list="groupedFields[key]"
            :group="{ name: 'fields', pull: 'clone', put: false }"
            handle=".handle"
          >
            <template #item="{ element: field }">
              <div class="border p-1 m-1">
                <div class="flex items-center">
                  <div class="handle min-w-max mr-0.5">
                    <ccu-icon
                      icon-classes="cursor-move"
                      :alt="translate('actions.drag')"
                      height="15"
                      width="10"
                      type="drag"
                    />
                  </div>
                  {{ translate(field.label_t) }} ({{ field.html_type }})
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Draggable from 'vuedraggable';
import _, { debounce } from 'lodash';
import { computed, onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { groupBy } from '@/utils/array';
import { nest } from '@/utils/form';
import NestedBuilderItem from '@/components/admin/incidents/NestedBuilderItem.vue';
import type { FormField } from '@/models/types';

export default defineComponent({
  name: 'IncidentFormBuilder',
  components: { Draggable, NestedBuilderItem },
  props: {
    incident: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const route = useRoute();

    const incidents = ref([]);
    const availableFields = ref([]);
    const formFields = ref([]);
    const list = ref<FormField[]>([]);
    const elementSearch = ref('');
    const selectedIncidentTemplate = ref<string>('');

    const groupedFields = computed<Record<string, FormField[]>>(() => {
      const fields = [...availableFields.value];
      return groupBy(fields, 'data_group');
    });

    const fieldTree = ref<FormField[]>([]);

    async function getTemplate(value: string) {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/incidents/${value}/template`,
      );
      formFields.value = response.data.filter(
        (field: FormField) => !['hidden', 'divend'].includes(field.html_type),
      );
      fieldTree.value = _.sortBy(
        nest(formFields.value),
        (o: FormField) => o.list_order,
      );
      list.value = [...fieldTree.value];
      emit('onUpdateForm', list.value);
    }

    async function getAvailableFields() {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/incident_fields`,
        {
          params: {
            limit: 1000,
            search: elementSearch.value,
          },
        },
      );
      availableFields.value = response.data.results;
    }

    function updateField({ field_key, prop, value }: Record<string, any>) {
      const find = (list: FormField[]): FormField | null => {
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

      const field = find(list.value);
      if (field) {
        (field as Record<string, any>)[prop] = value;
      }
    }

    const search = debounce(
      function (value) {
        elementSearch.value = value;
        getAvailableFields();
      },
      150,
      {
        leading: false,
        trailing: true,
      },
    );

    // watch(
    //   () => fieldTree.value,
    //   (value) => {
    //     list.value = [...value];
    //     emit('onUpdateForm', list.value);
    //   },
    // );

    onMounted(async () => {
      const incidentsResponse = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/incidents_list?fields=id,name,short_name,geofence,locations,turn_on_release&limit=200&sort=-start_at`,
      );
      incidents.value = incidentsResponse.data.results;
      await getAvailableFields();
      if (route.params.incident_id && props.incident?.id) {
        selectedIncidentTemplate.value = props.incident.id;
        await getTemplate(props.incident.id);
      }
    });

    return {
      incidents,
      availableFields,
      formFields,
      list,
      elementSearch,
      selectedIncidentTemplate,
      getTemplate,
      updateField,
      search,
      groupedFields,
      fieldTree,
      translate: useI18n().t,
    };
  },
});
</script>
