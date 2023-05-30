<template>
  <div class="form-tree">
    <div :key="field.field_key">
      <template v-if="['h4'].includes(field.html_type)">
        <SectionHeading
          :count="getSectionCount(field)"
          :tooltip="field.help_t"
          :data-testid="`test${field.label_t}HelpTooltip`"
          class="mb-3"
          >{{ field.label_t }}
        </SectionHeading>
      </template>
      <template v-if="['h5'].includes(field.html_type)">
        <div class="form-field flex items-center justify-between">
          <base-checkbox
            :model-value="
              Boolean(dynamicFields[field.field_key]) || hasSelectedChildren
            "
            @update:modelValue="
              (value: string) => {
                $emit('updateField', { key: field.field_key, value });
                updateChildren(field, value);
                showChildren = !showChildren;
              }
            "
            :data-testid="`test${field.field_key}Checkbox`"
          >
            <div class="text-base font-semibold">
              {{ field.label_t }}
            </div>
          </base-checkbox>
          <WorksiteStatusDropdown
            v-if="worksite.id && currentWorkType"
            class="block"
            :data-testid="`test${
              worksite.id && currentWorkType
            }WorktypeStatusSelect`"
            :phase="incident ? incident.phase : null"
            :current-work-type="currentWorkType"
            @input="
              (value: string) => {
                $emit('updateWorkTypeStatus', {
                  work_type: field.if_selected_then_work_type,
                  status: value,
                });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'select'">
        <div :key="field.field_key" class="form-field">
          <span slot="label" class="flex items-center">
            <span>{{ field.label_t }}</span>
            <ccu-icon
              v-if="field.help_t"
              v-tooltip="{
                content: field.help_t,
                triggers: ['click'],
                html: true,
                popperClass: 'interactive-tooltip w-72',
              }"
              :alt="$t('actions.help_alt')"
              :data-testid="`test${field.label_t}HelpTooltip`"
              type="help"
              size="large"
            />
          </span>
          <base-select
            :model-value="dynamicFields[field.field_key]"
            :options="
              field.values || getSelectValuesList(field.values_default_t)
            "
            :data-testid="`test${field.field_key}Select`"
            item-key="value"
            label="name_t"
            select-classes="h-12 border"
            @update:modelValue="
              (value: string) => {
                $emit('updateField', { key: field.field_key, value });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'multiselect'">
        <div :key="field.field_key" class="form-field">
          <span slot="label" class="flex items-center">
            <span>{{ field.label_t }}</span>
            <ccu-icon
              v-if="field.help_t"
              :data-testid="`test${field.field_key}HelpTooltip`"
              v-tooltip="{
                content: field.help_t,
                html: true,
                triggers: ['click'],
                popperClass: 'interactive-tooltip w-72',
              }"
              :alt="$t('actions.help_alt')"
              type="help"
              size="large"
            />
          </span>
          <base-select
            :model-value="
              dynamicFields[field.field_key] &&
              dynamicFields[field.field_key].split(',')
            "
            multiple
            :options="
              field.values || getSelectValuesList(field.values_default_t)
            "
            :data-testid="`test${field.field_key}Select`"
            item-key="value"
            label="name_t"
            select-classes="bg-white border text-xs role-select p-1 form-multiselect"
            @update:modelValue="
              (value: string[]) => {
                $emit('updateField', {
                  key: field.field_key,
                  value: value.join(','),
                });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'text'">
        <div :key="field.field_key" class="form-field">
          <base-input
            :model-value="dynamicFields[field.field_key]"
            :tooltip="field.help_t"
            :data-testid="`test${field.field_key}TextInput`"
            size="large"
            :break-glass="field.read_only_break_glass"
            :placeholder="field.placeholder_t || field.label_t"
            @update:modelValue="
              (value: string) => {
                $emit('updateField', { key: field.field_key, value });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'cronselect'">
        <div class="form-field">
          <div class="mb-1">{{ field.label_t }}</div>
          <RecurringSchedule
            :model-value="dynamicFields[field.field_key] || field.recur_default"
            :is-default="!dynamicFields[field.field_key]"
            :data-testid="`test${field.field_key}CronSelect`"
            @update:modelValue="
              (value: string) => {
                $emit('updateField', { key: field.field_key, value });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'textarea'">
        <div :key="field.field_key" class="form-field">
          <span slot="label" class="flex items-center">
            <span>{{ field.label_t }}</span>
            <ccu-icon
              v-if="field.help_t"
              v-tooltip="{
                content: field.help_t,
                triggers: ['click'],
                html: true,
                popperClass: 'interactive-tooltip w-72',
              }"
              :alt="$t('actions.help_alt')"
              :data-testid="`test${field.field_key}HelpTooltip`"
              type="help"
              size="large"
            />
          </span>
          <base-input
            text-area
            :disabled="false"
            :rows="4"
            :model-value="dynamicFields[field.field_key]"
            :placeholder="field.placeholder_t || field.label_t"
            :data-testid="`test${field.field_key}TextArea`"
            @update:modelValue="
              (value: string) => {
                $emit('updateField', { key: field.field_key, value });
              }
            "
          />
        </div>
      </template>
      <template v-if="field.html_type === 'checkbox'">
        <div :key="field.field_key" class="form-field flex items-center">
          <base-checkbox
            :model-value="dynamicFields[field.field_key]"
            :data-testid="`test${field.field_key}Checkbox`"
            @update:modelValue="
              (value: string) => {
                $emit('updateField', { key: field.field_key, value });
              }
            "
            >{{ field.label_t }}
          </base-checkbox>
          <ccu-icon
            v-if="field.help_t"
            :data-testid="`test${field.field_key}HelpTooltip`"
            v-tooltip="{
              content: field.help_t,
              triggers: ['click'],
              html: true,
              popperClass: 'interactive-tooltip w-72',
            }"
            :alt="$t('actions.help_alt')"
            type="help"
            size="large"
          />
        </div>
      </template>
    </div>
    <form-tree
      v-for="item in field.children"
      v-show="showChildren"
      :key="item.field_key"
      :children="item.children"
      :field="item"
      :worksite="worksite"
      :dynamic-fields="dynamicFields"
      @updateField="
        ({ key, value }: Record<string, string>) => {
          $emit('updateField', { key, value });
        }
      "
      @updateWorkTypeStatus="
        ({ work_type, status }: Record<string, string>) => {
          $emit('updateWorkTypeStatus', { work_type, status });
        }
      "
    />
  </div>
</template>
<script lang="ts">
import type { PropType } from 'vue';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import SectionHeading from '../work/SectionHeading.vue';
import RecurringSchedule from '../RecurringSchedule.vue';
import Incident from '../../models/Incident';
import WorksiteStatusDropdown from '../WorksiteStatusDropdown.vue';
import BaseSelect from '../BaseSelect.vue';
import type { FormField, WorkType } from '@/models/types';

export default defineComponent({
  name: 'FormTree',
  components: {
    BaseSelect,
    WorksiteStatusDropdown,
    SectionHeading,
    RecurringSchedule,
  },
  props: {
    worksite: {
      type: Object,
      default: () => ({}),
    },
    dynamicFields: {
      type: Object,
      default: () => ({}),
    },
    children: {
      type: Array,
      default: () => [],
    },
    field: {
      type: Object as PropType<FormField>,
      default: () => ({}),
    },
  },
  emits: ['updateField', 'updateWorkTypeStatus'],
  setup(props, { emit }) {
    const showChildren = ref(true);
    const { t } = useI18n();
    const store = useStore();

    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );
    const incident = computed(() => {
      return Incident.find(currentIncidentId.value);
    });
    const currentWorkType = computed(() => {
      return props.worksite.work_types.find(
        (wt: WorkType) =>
          wt.work_type === props.field.if_selected_then_work_type,
      );
    });
    const hasSelectedChildren = computed(() => {
      return props.field.children.some((childField: FormField) => {
        return (
          childField.if_selected_then_work_type &&
          Boolean(props.dynamicFields[childField.field_key])
        );
      });
    });

    function getValue(fieldKey: string) {
      if (!props.worksite || !props.worksite.form_data) {
        return '';
      }

      const key = props.worksite.form_data.find((element: FormField) => {
        return element.field_key === fieldKey;
      });
      if (key) {
        // this.$log.debug(`${fieldKey}:${key.field_value}`);

        return key.field_value;
      }

      return '';
    }

    function getSectionCount(currentField: FormField) {
      return currentField.order_label;
    }

    function getSelectValuesList(defaultValues: Record<string, string>) {
      return Object.keys(defaultValues).map((key) => {
        return {
          value: key,
          name_t: t(defaultValues[key]),
        };
      });
    }

    function updateChildren(field: FormField, value: string) {
      if (!value) {
        field.children.forEach((child: FormField) => {
          emit('updateField', {
            key: child.field_key,
            value: child.html_type === 'checkbox' ? false : '',
          });
        });
      }
    }

    onMounted(() => {
      if (props.field.if_selected_then_work_type) {
        showChildren.value = Boolean(
          props.dynamicFields[props.field.field_key],
        );
      }

      const hasSelectedChildren = props.field.children.some(
        (childField: FormField) => {
          return (
            childField.if_selected_then_work_type &&
            Boolean(props.dynamicFields[childField.field_key])
          );
        },
      );
      if (hasSelectedChildren) {
        showChildren.value = true;
      }
    });

    return {
      showChildren,
      incident,
      currentWorkType,
      hasSelectedChildren,
      getValue,
      getSectionCount,
      getSelectValuesList,
      updateChildren,
    };
  },
});
</script>

<style>
.form-field {
  @apply py-1 mx-3;
}
.form-multiselect .vs__selected {
  @apply text-xs bg-white !important;
}
</style>
